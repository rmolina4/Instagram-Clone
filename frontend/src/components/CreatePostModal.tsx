"use client";

import { useState, useRef, SetStateAction, Dispatch, useEffect } from "react";
import { useApp } from "@/utils/AppProvider";
import {
  CreateResourceResponse,
  Resolution,
  Adjustment,
  MediaDraft,
  ProcessedMedia,
} from "@/utils/types";
import safeFetch from "@/utils/safeFetch";
import OptionsMenu from "./OptionsMenu";
import CreatePostCarousel from "./CreatePostCarousel";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { flushSync } from "react-dom";
import Sidebar from "./PostSettingsBar";
import { resize } from "motion";
import { initializeCanvas } from "@/utils/Canvas";

import { RxCross1 } from "react-icons/rx";
import { MdOutlinePermMedia } from "react-icons/md";
import { LiaLongArrowAltLeftSolid } from "react-icons/lia";

export type Active = "zoom" | "reorder" | "resolution" | null;

export interface InteractionState {
  position: number;
  optionsVisible: boolean;
  advancedSettingsVisible: boolean;
  emojiPickerVisible: boolean;
  stage: Stage;
  isDragOver: boolean;
  adjustmentsVisible: boolean;
  addCollaboratorsVisible: boolean;
  active: Active;
  currentVideoProgress: number;
}

export interface PostFormData {
  media: MediaDraft[];
  processedMedia: ProcessedMedia[];
  posters: string[];
  body: string;
  location: string;
  collaborators: {
    id: string;
    username: string;
    name: string;
    collaborator: boolean;
  }[];
  hideMetrics: boolean;
  disableComments: boolean;
}

const defaultAdjustments: Adjustment = {
  Brightness: 0,
  Contrast: 0,
  Saturation: 0,
  Fade: 0,
  Temperature: 0,
  Vignette: 0,
};

export enum Stage {
  Upload,
  Crop,
  Edit,
  Share,
}

export default function CreatePostModal({
  setCreatePostModalVisible,
}: {
  setCreatePostModalVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const { setPosts, user } = useApp();
  const [interactionState, setInteractionState] = useState<InteractionState>({
    position: 0,
    optionsVisible: false,
    advancedSettingsVisible: false,
    emojiPickerVisible: false,
    stage: Stage.Upload,
    isDragOver: false,
    adjustmentsVisible: false,
    addCollaboratorsVisible: false,
    active: null,
    currentVideoProgress: 0,
  });
  const [postFormData, setPostFormData] = useState<PostFormData>({
    media: [],
    processedMedia: [],
    posters: [],
    body: "",
    location: "",
    collaborators: [],
    hideMetrics: false,
    disableComments: false,
  });
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const exit = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scope, animate] = useAnimate();
  const [animating, setAnimating] = useState<boolean>(false);

  const drawTimeline = async (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    resource: HTMLVideoElement,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const timeline: string[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          resource.removeEventListener("seeked", onSeeked);
          resolve();
        };
        resource.addEventListener("seeked", onSeeked);
        resource.currentTime = (i * resource.duration) / 5;
      });
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(resource, 0, 0, canvasWidth, canvasHeight);
      timeline.push(canvas.toDataURL());
    }
    return timeline;
  };

  const handleAddMedia = (files: File[]) => {
    if (!files || files.length == 0) return;
    const loaders = files.map(
      (file) =>
        new Promise<MediaDraft>((resolve) => {
          if (file.type.startsWith("image/")) {
            const resource = new Image();
            resource.src = URL.createObjectURL(file);
            resource.onload = () => {
              resolve({
                media_type: "image",
                id: crypto.randomUUID(),
                resource,
                poster: null,
                updatePoster: true,
                mime_type: file.type,
                lut: "None",
                lut_strength: 100,
                adjustments: defaultAdjustments,
                zoom: 0,
                resolution: Resolution.Original,
                pan: { x: 0, y: 0 },
              });
            };
          } else if (file.type.startsWith("video/")) {
            const resource = document.createElement(
              "video"
            ) as HTMLVideoElement;
            resource.src = URL.createObjectURL(file);
            Object.defineProperty(resource, "width", {
              get: () => resource.videoWidth,
            });
            Object.defineProperty(resource, "height", {
              get: () => resource.videoHeight,
            });
            resource.onloadeddata = () => {
              resolve({
                media_type: "video",
                file,
                id: crypto.randomUUID(),
                resource,
                poster: null,
                updatePoster: true,
                timeline: [],
                cover: 0,
                audio: true,
                start_percent: 0,
                end_percent: 1,
                mime_type: file.type,
                lut: "None",
                lut_strength: 100,
                adjustments: defaultAdjustments,
                zoom: 0,
                resolution: Resolution.Original,
                pan: { x: 0, y: 0 },
              });
            };
          }
        })
    );
    Promise.all(loaders).then(async (newMedia) => {
      setPostFormData((prev) => ({
        ...prev,
        media: [...prev.media, ...newMedia],
      }));
      if (interactionState.stage != Stage.Crop) {
        setInteractionState((prev) => ({
          ...prev,
          stage: Stage.Crop,
        }));
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const canvasWidth = 200;
      const canvasHeight = 200;
      if (!canvas || !ctx) return;
      initializeCanvas(
        canvas,
        ctx,
        canvasWidth,
        canvasHeight,
        window.devicePixelRatio
      );
      for (const media of newMedia) {
        if (media.media_type === "video") {
          const timeline = await drawTimeline(
            canvas,
            ctx,
            media.resource,
            canvasWidth,
            canvasHeight
          );
          setPostFormData((prev) => ({
            ...prev,
            media: prev.media.map((m) =>
              m.id === media.id ? { ...m, timeline } : m
            ),
          }));
        }
      }
    });
  };

  const handleCreatePost = async () => {
    setCreatePostModalVisible(false);
    const optimisticPost = {
      id: crypto.randomUUID(),
      body: postFormData.body,
      username: user.username,
      created_at: new Date().toISOString(),
      like_count: 0,
      liked_by_me: false,
      bookmarked_by_me: false,
      comments: [],
      media: postFormData.processedMedia,
      is_owner: true,
      account_id: user.id,
      followed_by_me: false,
      entity_id: crypto.randomUUID(),
      comment_count: 0,
    };
    if (!postFormData.media.some((m) => m.media_type === "video")) {
      setPosts((prev) => [optimisticPost, ...prev]);
    }

    const formData = new FormData();
    formData.append("body", postFormData.body);
    formData.append("location", postFormData.location);
    formData.append("hide_metrics", postFormData.hideMetrics.toString());
    formData.append(
      "disable_comments",
      postFormData.disableComments.toString()
    );
    postFormData.processedMedia.forEach((m) => {
      formData.append("files", m.file);
    });
    const metadata = postFormData.processedMedia.map((m) => {
      return m.media_type === "video"
        ? {
            start_percent: m.start_percent,
            end_percent: m.end_percent,
            pan: m.pan,
            zoom: m.zoom,
            duration: m.duration,
            width: m.width,
            height: m.height,
          }
        : null;
    });
    formData.append("metadata", JSON.stringify(metadata));
    const data = await safeFetch<CreateResourceResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );
    if (!data.success)
      return setPosts((prev) =>
        prev.filter((post) => post.id !== optimisticPost.id)
      );
    if (!postFormData.media.some((m) => m.media_type === "video")) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === optimisticPost.id
            ? { ...post, id: data.id, entity_id: data.entity_id }
            : post
        )
      );
    }
  };

  const handleIncrementStage = async () => {
    if (interactionState.stage < Stage.Share) {
      setInteractionState((prev) => ({
        ...prev,
        stage: prev.stage + 1,
      }));
      return runTransition();
    }
    handleCreatePost();
  };

  const handleDecrementStage = () => {
    if (interactionState.stage > Stage.Crop) {
      if (interactionState.stage === Stage.Edit) {
        setPostFormData((prev) => ({
          ...prev,
          media: prev.media.map((m) =>
            m.media_type === "video"
              ? { ...m, start_percent: 0, end_percent: 1 }
              : m
          ),
        }));
        if (videoRef.current) {
          videoRef.current.play();
        }
      }
      setInteractionState((prev) => ({
        ...prev,
        stage: prev.stage - 1,
      }));
      return runTransition();
    }
    exit.current = false;
    setInteractionState((prev) => ({
      ...prev,
      optionsVisible: true,
    }));
  };

  const handleExit = () => {
    if (interactionState.stage === Stage.Upload)
      return setCreatePostModalVisible(false);
    exit.current = true;
    setInteractionState((prev) => ({
      ...prev,
      optionsVisible: true,
    }));
  };

  const runTransition = () => {
    if (!scope.current) return;
    animate(
      scope.current,
      { opacity: [1, 0] },
      { duration: 0.8, ease: [0.2, 0.95, 0.1, 0.99] }
    );
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "scroll";
    };
  }, []);

  useEffect(() => {
    if (!carouselRef.current) return;
    const stop = resize(carouselRef.current, (_, { width, height }) => {
      setSize({ width, height });
    });
    return () => stop();
  }, [carouselRef, interactionState.stage]);

  useEffect(() => {
    setInteractionState((prev) => ({
      ...prev,
      isDragOver: false,
      active: null,
    }));
  }, [interactionState.stage]);

  useEffect(() => {
    if (postFormData.media.length == 0) {
      setInteractionState((prev) => ({
        ...prev,
        position: 0,
        stage: Stage.Upload,
      }));
    }
  }, [postFormData.media]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <div
        className="fixed inset-0 bg-black opacity-60 z-3"
        onClick={handleExit}
      ></div>
      <motion.div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-3 rounded-xl bg-white dark:bg-black overflow-hidden"
        initial={false}
        animate={{
          width:
            interactionState.stage < Stage.Edit
              ? "clamp(300px, 60vw, 700px)"
              : `${size.width + 340}px`,
        }}
        transition={{ duration: 0.8, ease: [0.2, 0.95, 0.1, 0.99] }}
        onAnimationStart={() => setAnimating(true)}
        onAnimationComplete={() => setAnimating(false)}
      >
        <div className="flex items-center justify-between font-bold h-[50px] border-b border-gray-300 dark:border-gray-700 px-4">
          {interactionState.stage === Stage.Upload ? (
            <span className="w-full text-center"> Create new post</span>
          ) : (
            <>
              <button onClick={handleDecrementStage}>
                <LiaLongArrowAltLeftSolid size={35} />
              </button>
              <span>
                {interactionState.stage === Stage.Share
                  ? "Create new post"
                  : Stage[interactionState.stage]}
              </span>
              <button
                className="text-blue-500 text-sm"
                onClick={handleIncrementStage}
              >
                {interactionState.stage < Stage.Share ? "Next" : "Share"}
              </button>
            </>
          )}
        </div>
        <motion.div
          onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setInteractionState((prev) => ({
              ...prev,
              isDragOver: true,
            }));
          }}
          onDragLeave={() =>
            setInteractionState((prev) => ({
              ...prev,
              isDragOver: false,
            }))
          }
          onDrop={(e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            if (interactionState.stage != Stage.Upload) return;
            handleAddMedia(Array.from(e.dataTransfer.files));
          }}
          className={`relative flex justify-center text-xl w-full ${
            interactionState.isDragOver ? "bg-gray-200" : ""
          }`}
          initial={false}
          animate={{
            height:
              interactionState.stage >= Stage.Edit
                ? size.height
                : "clamp(300px, 60vw, 700px)",
          }}
        >
          <>
            <div
              className="absolute inset-0 bg-white pointer-events-none z-1 opacity-0"
              ref={scope}
            />
            <input
              ref={fileInputRef}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleAddMedia(Array.from(e.target.files || []));
              }}
              className="hidden"
              type="file"
              id="fileInput"
              accept={"image/png, image/jpeg, video/mp4"}
              multiple
            />
            <AnimatePresence mode="popLayout">
              {interactionState.stage == Stage.Upload && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                  exit={{ opacity: 0 }}
                >
                  <MdOutlinePermMedia size={40} />
                  Drag photos and videos here
                  <button
                    className="bg-blue-500 text-white px-4 py-1 text-[16px] rounded-md"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                  >
                    Select from computer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="popLayout">
              {interactionState.stage >= Stage.Crop &&
                postFormData.media.length > 0 && (
                  <CreatePostCarousel
                    postFormData={postFormData}
                    carouselRef={carouselRef}
                    fileInputRef={fileInputRef}
                    carouselSize={size}
                    className="w-full h-full"
                    interactionState={interactionState}
                    setInteractionState={setInteractionState}
                    setPostFormData={setPostFormData}
                    animating={animating}
                    videoRef={videoRef}
                  />
                )}
            </AnimatePresence>
            {interactionState.stage >= Stage.Edit && (
              <Sidebar
                interactionState={interactionState}
                setInteractionState={setInteractionState}
                postFormData={postFormData}
                setPostFormData={setPostFormData}
                canvasRef={canvasRef}
                videoRef={videoRef}
              />
            )}
          </>
        </motion.div>
      </motion.div>
      <button
        className="fixed top-4 right-4 cursor-pointer z-3"
        onClick={handleExit}
      >
        <RxCross1 color="white" size={24} />
      </button>
      {interactionState.optionsVisible && (
        <OptionsMenu
          setOptionsVisible={(visible) =>
            setInteractionState((prev) => ({
              ...prev,
              optionsVisible: visible,
            }))
          }
          items={[
            {
              label: "Discard",
              onClick: () => {
                flushSync(() => {
                  setInteractionState((prev) => ({
                    ...prev,
                    active: null,
                  }));
                });
                setInteractionState((prev) => ({
                  ...prev,
                  position: 0,
                  stage: Stage.Upload,
                }));
                setPostFormData((prev) => ({
                  ...prev,
                  media: [],
                }));
                if (exit.current) setCreatePostModalVisible(false);
              },
              red: true,
            },
            {
              label: "Cancel",
            },
          ]}
        />
      )}
    </>
  );
}
