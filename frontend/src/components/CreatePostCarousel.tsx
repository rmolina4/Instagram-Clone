import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionValue,
  Reorder,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import {
  LUT_FIELDS,
  LUT_FILTERS,
  MediaDraft as Media,
  ProcessedMedia,
  Resolution,
} from "@/utils/types";
import { InteractionState, PostFormData, Stage } from "./CreatePostModal";
import { initializeCanvas } from "@/utils/Canvas";
import { ImageMediaDraft, VideoMediaDraft } from "@/utils/types";

import {
  IoIosArrowDroprightCircle,
  IoIosArrowDropleftCircle,
} from "react-icons/io";
import { MdCropFree, MdZoomIn, MdContentCopy } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { IoMdAdd } from "react-icons/io";
import { FaPlay } from "react-icons/fa";

interface CreatePostCarouselProps {
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  postFormData: PostFormData;
  setPostFormData: Dispatch<SetStateAction<PostFormData>>;
  carouselRef: React.RefObject<HTMLDivElement | null>;
  carouselSize: { width: number; height: number };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  animating: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  className?: string;
}

const isVideoMediaDraft = (
  media: ImageMediaDraft | VideoMediaDraft
): media is VideoMediaDraft => {
  return media.media_type === "video";
};

export default function CreatePostCarousel({
  interactionState,
  setInteractionState,
  className,
  postFormData,
  setPostFormData,
  carouselRef,
  carouselSize,
  fileInputRef,
  animating,
  videoRef,
}: CreatePostCarouselProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [constraints, setConstraints] = useState<{
    left: number;
    right: number;
    top: number;
    bottom: number;
  }>({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const currentZoom = postFormData.media[interactionState.position]?.zoom;
  const [isPlaying, setIsPlaying] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleIncrementPosition = () => {
    setInteractionState((prev) => ({
      ...prev,
      position: (interactionState.position + 1) % postFormData.media.length,
      active: null,
    }));
  };

  const handleDecrementPosition = () => {
    setInteractionState((prev) => ({
      ...prev,
      position:
        (interactionState.position - 1 + postFormData.media.length) %
        postFormData.media.length,
      active: null,
    }));
  };

  const clampPosition = () => {
    x.set(Math.max(constraints.left, Math.min(x.get(), constraints.right)));
    y.set(Math.max(constraints.top, Math.min(y.get(), constraints.bottom)));
  };

  const buildFilter = (index: number) => {
    const parts: string[] = [];
    if (postFormData.media[index].lut !== "None") {
      (
        Object.entries(LUT_FILTERS[postFormData.media[index].lut]) as [
          key: keyof LUT_FIELDS,
          value: number,
        ][]
      ).forEach(([key, target]) => {
        const neutral =
          key === "brightness" || key === "contrast" || key === "saturate"
            ? 1
            : 0;
        const value =
          neutral +
          ((target - neutral) * postFormData.media[index].lut_strength) / 100;
        parts.push(`${key}(${value})`);
      });
    }
    parts.push(
      `brightness(${1 + postFormData.media[index].adjustments.Brightness / 100})`
    );
    parts.push(
      `contrast(${1 + postFormData.media[index].adjustments.Contrast / 100})`
    );
    parts.push(
      `saturate(${1 + postFormData.media[index].adjustments.Saturation / 100})`
    );
    parts.push(
      `sepia(${postFormData.media[index].adjustments.Temperature / 100})`
    );
    parts.push(
      `grayscale(${postFormData.media[index].adjustments.Fade / 100})`
    );
    return parts.join(" ");
  };

  const buildCanvasParams = (
    index: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const zoomFactor = 1 + postFormData.media[index].zoom / 100;
    const scaledHeight = canvasHeight * zoomFactor;
    const scaledWidth =
      (postFormData.media[index].resource.width * scaledHeight) /
      postFormData.media[index].resource.height;

    const normalizedPan = normalizePan(
      postFormData.media[index].pan,
      canvasWidth,
      canvasHeight,
      scaledWidth,
      scaledHeight
    );

    return {
      sx: normalizedPan.x * postFormData.media[index].resource.width,
      sy: normalizedPan.y * postFormData.media[index].resource.height,
      sWidth:
        postFormData.media[index].resource.width * (canvasWidth / scaledWidth),
      sHeight:
        postFormData.media[index].resource.height *
        (canvasHeight / scaledHeight),
      dx: 0,
      dy: 0,
      dWidth: canvasWidth,
      dHeight: canvasHeight,
    };
  };

  const normalizePan = (
    pan: { x: number; y: number },
    containerWidth: number,
    containerHeight: number,
    scaledWidth: number,
    scaledHeight: number
  ): { x: number; y: number } => {
    const maxPanX = Math.max(
      0,
      (scaledWidth - containerWidth) / (2 * scaledWidth)
    );
    const maxPanY = Math.max(
      0,
      (scaledHeight - containerHeight) / (2 * scaledHeight)
    );
    return {
      x: -pan.x + maxPanX,
      y: -pan.y + maxPanY,
    };
  };

  const drawCanvas = (
    ctx: CanvasRenderingContext2D,
    index: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.filter = buildFilter(index);

    const { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } =
      buildCanvasParams(index, canvasWidth, canvasHeight);

    ctx.drawImage(
      postFormData.media[index].resource,
      sx,
      sy,
      sWidth,
      sHeight,
      dx,
      dy,
      dWidth,
      dHeight
    );
  };

  const exportCanvas = (
    canvas: HTMLCanvasElement,
    index: number
  ): Promise<{
    media_type: "image";
    media_url: string;
    mime_type: string;
    file: Blob;
  } | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        resolve({
          media_type: "image",
          media_url: URL.createObjectURL(blob),
          mime_type: postFormData.media[index].mime_type,
          file: blob,
        });
      });
    });
  };

  //sets constraints
  useEffect(() => {
    if (carouselSize.width === 0 || carouselSize.height === 0 || animating)
      return;

    const zoomFactor =
      postFormData.media[interactionState.position].zoom / 100 + 1;
    const scaledHeight = carouselSize.height * zoomFactor;
    const scaledWidth =
      (postFormData.media[interactionState.position].resource.width *
        scaledHeight) /
      postFormData.media[interactionState.position].resource.height;

    x.set(postFormData.media[interactionState.position].pan.x * scaledWidth);
    y.set(postFormData.media[interactionState.position].pan.y * scaledHeight);

    const maxDragLeft = -(scaledWidth - carouselSize.width) / 2;
    const maxDragRight = (scaledWidth - carouselSize.width) / 2;
    const maxDragTop = -(scaledHeight - carouselSize.height) / 2;
    const maxDragBottom = (scaledHeight - carouselSize.height) / 2;

    setConstraints((prev) => ({
      ...prev,
      left: maxDragLeft,
      right: maxDragRight,
      top: maxDragTop,
      bottom: maxDragBottom,
    }));
  }, [
    interactionState.position,
    interactionState.stage,
    currentZoom,
    carouselSize,
  ]);

  // draws canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || interactionState.stage < Stage.Edit) return;
    if (
      interactionState.stage == Stage.Share &&
      postFormData.processedMedia.length == 0
    ) {
      const canvasWidth = 1080;
      const canvasHeight = 1080;
      initializeCanvas(canvas, ctx, canvasWidth, canvasHeight);

      const exportAllMedia = async () => {
        const processedMedia: ProcessedMedia[] = [];
        for (let i = 0; i < postFormData.media.length; i++) {
          if (postFormData.media[i].media_type === "video") {
            const zoomFactor = 1 + postFormData.media[i].zoom / 100;
            const scaledHeight = canvasHeight * zoomFactor;
            const scaledWidth =
              (postFormData.media[i].resource.width * scaledHeight) /
              postFormData.media[i].resource.height;

            const normalizedPan = normalizePan(
              postFormData.media[i].pan,
              canvasWidth,
              canvasHeight,
              scaledWidth,
              scaledHeight
            );

            processedMedia.push({
              media_type: "video",
              file: (postFormData.media[i] as VideoMediaDraft).file,
              mime_type: postFormData.media[i].mime_type,
              media_url: postFormData.media[i].resource.src,
              start_percent: (postFormData.media[i] as VideoMediaDraft)
                .start_percent,
              end_percent: (postFormData.media[i] as VideoMediaDraft)
                .end_percent,
              duration: (postFormData.media[i] as VideoMediaDraft).resource
                .duration,
              crop: {
                width: canvasWidth,
                height: canvasHeight,
              },
              dimensions: {
                width: scaledWidth,
                height: scaledHeight,
              },
              offset: {
                x: normalizedPan.x * scaledWidth,
                y: normalizedPan.y * scaledHeight,
              },
            });
          } else {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawCanvas(ctx, i, canvasWidth, canvasHeight);
            const result = await exportCanvas(canvas, i);
            if (result) processedMedia.push(result);
          }
        }
        setPostFormData((prev) => ({
          ...prev,
          processedMedia: processedMedia,
        }));
      };
      exportAllMedia();
    } else {
      setPostFormData((prev) => ({
        ...prev,
        processedMedia: [],
      }));
    }

    if (postFormData.media[interactionState.position].media_type === "video")
      return;
    initializeCanvas(
      canvas,
      ctx,
      carouselSize.width,
      carouselSize.height,
      window.devicePixelRatio
    );
    drawCanvas(
      ctx,
      interactionState.position,
      carouselSize.width,
      carouselSize.height
    );
  }, [
    canvasRef,
    interactionState.stage,
    interactionState.position,
    postFormData.media,
  ]);

  // draws posters
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (
      !canvas ||
      !ctx ||
      interactionState.stage != Stage.Crop ||
      !postFormData.media.some((m) => m.updatePoster)
    )
      return;
    const exportAllPosters = async () => {
      const canvasWidth = 88;
      const canvasHeight = 88;
      initializeCanvas(
        canvas,
        ctx,
        canvasWidth,
        canvasHeight,
        window.devicePixelRatio
      );
      const posters: (string | null)[] = [];
      for (let i = 0; i < postFormData.media.length; i++) {
        const m = postFormData.media[i];
        if (m.media_type === "video" && postFormData.media[i].poster === null) {
          await new Promise((resolve) =>
            m.resource.requestVideoFrameCallback(resolve)
          );
        }
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        const { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } =
          buildCanvasParams(i, canvasWidth, canvasHeight);
        ctx.drawImage(
          m.resource,
          sx,
          sy,
          sWidth,
          sHeight,
          dx,
          dy,
          dWidth,
          dHeight
        );
        posters.push(canvas.toDataURL());
      }
      setPostFormData((prev) => ({
        ...prev,
        media: prev.media.map((m, index) => ({
          ...m,
          poster: posters[index],
          updatePoster: false,
        })),
      }));
    };
    exportAllPosters();
  }, [canvasRef, interactionState.stage, postFormData.media]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };

    setIsPlaying(!video.paused);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoRef, interactionState.position]);

  useEffect(() => {
    const video = videoRef.current;
    const m = postFormData.media[interactionState.position];
    if (!video || !isPlaying || !isVideoMediaDraft(m)) return;

    let frameId: number;
    const SEEK_OFFSET = 0.01;
    const tick = () => {
      const progress = video.currentTime / video.duration;
      setInteractionState((prev) => ({
        ...prev,
        currentVideoProgress: progress,
      }));
      if (progress > m.end_percent || progress < m.start_percent) {
        video.currentTime = m.start_percent * video.duration + SEEK_OFFSET;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isPlaying]);

  useMotionValueEvent(x, "change", (value) => {
    const width =
      postFormData.media[interactionState.position].resource.width *
      (carouselSize.height /
        postFormData.media[interactionState.position].resource.height);
    const zoomFactor =
      postFormData.media[interactionState.position].zoom / 100 + 1;
    const scaledWidth = width * zoomFactor;
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((m, index) =>
        index == interactionState.position
          ? {
              ...m,
              pan: {
                x: value / scaledWidth,
                y: m.pan.y,
              },
              updatePoster: true,
            }
          : m
      ),
    }));
  });

  useMotionValueEvent(y, "change", (value) => {
    const zoomFactor =
      postFormData.media[interactionState.position].zoom / 100 + 1;
    const scaledHeight = carouselSize.height * zoomFactor;
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((m, index) =>
        index == interactionState.position
          ? {
              ...m,
              pan: {
                x: m.pan.x,
                y: value / scaledHeight,
              },
              updatePoster: true,
            }
          : m
      ),
    }));
  });

  return (
    <motion.div
      ref={carouselRef}
      className={`relative flex items-center overflow-hidden justify-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.3 }}
      exit={{ opacity: 0 }}
    >
      {postFormData.media[interactionState.position].media_type === "video" ? (
        <>
          <motion.video
            ref={videoRef}
            src={postFormData.media[interactionState.position].resource.src}
            autoPlay
            loop
            className={`h-full max-w-none relative ${interactionState.stage >= Stage.Edit ? "hover:cursor-pointer" : "hover:cursor-grab"}`}
            style={{
              aspectRatio:
                postFormData.media[interactionState.position].resource.width /
                postFormData.media[interactionState.position].resource.height,
              scale:
                (postFormData.media[interactionState.position].zoom + 100) /
                100,
              x,
              y,
            }}
            drag={interactionState.stage === Stage.Crop}
            dragConstraints={constraints}
            dragMomentum={false}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 500 }}
            onDragStart={() => {
              setIsDragging(true);
            }}
            onDragEnd={() => {
              setIsDragging(false);
            }}
            onClick={() => {
              if (interactionState.stage >= Stage.Edit) {
                if (videoRef.current?.paused) {
                  videoRef.current?.play();
                } else {
                  videoRef.current?.pause();
                }
              }
            }}
          />
          {interactionState.stage >= Stage.Edit && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center opacity-85 pointer-events-none">
              <FaPlay className="text-white" size={50} />
            </div>
          )}
        </>
      ) : (
        interactionState.stage === Stage.Crop && (
          <motion.div
            className={`bg-cover bg-center h-full ${interactionState.stage >= Stage.Edit ? "hover:cursor-pointer" : "hover:cursor-grab"}`}
            style={{
              aspectRatio:
                postFormData.media[interactionState.position].resource.width /
                postFormData.media[interactionState.position].resource.height,
              backgroundImage: `url(${postFormData.media[interactionState.position].resource.src})`,
              scale:
                (postFormData.media[interactionState.position].zoom + 100) /
                100,
              x,
              y,
            }}
            drag
            dragConstraints={constraints}
            dragMomentum={false}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 500 }}
            onDragStart={() => {
              setIsDragging(true);
            }}
            onDragEnd={() => {
              setIsDragging(false);
            }}
          />
        )
      )}
      {isDragging && (
        <>
          <div className="absolute h-full w-[1px] right-1/3 bg-white opacity-30" />
          <div className="absolute h-full w-[1px] left-1/3 bg-white opacity-30" />
          <div className="absolute h-[1px] w-full top-1/3 bg-white opacity-30" />
          <div className="absolute h-[1px] w-full bottom-1/3 bg-white opacity-30" />
        </>
      )}
      <canvas
        ref={canvasRef}
        className={`${
          interactionState.stage < Stage.Edit ||
          postFormData.media[interactionState.position].media_type === "video"
            ? "hidden"
            : ""
        }`}
      />
      {interactionState.position > 0 && (
        <button
          className="absolute top-1/2 left-3 transform -translate-y-1/2 hover:cursor-pointer"
          onClick={handleDecrementPosition}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white w-4 h-4 rounded-full" />
          </span>
          <IoIosArrowDropleftCircle
            className="relative text-neutral-900/80"
            size={25}
          />
        </button>
      )}
      {interactionState.position < postFormData.media.length - 1 && (
        <button
          className="absolute top-1/2 right-3 transform -translate-y-1/2 hover:cursor-pointer"
          onClick={handleIncrementPosition}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white w-4 h-4 rounded-full" />
          </span>
          <IoIosArrowDroprightCircle
            size={25}
            className="relative text-neutral-900/80"
          />
        </button>
      )}
      {postFormData.media.length > 1 && (
        <div className="absolute bottom-6 flex gap-1 w-full justify-center">
          {postFormData.media.map((_, index) => (
            <div
              key={index}
              className={`${index == interactionState.position ? "bg-blue-500" : "bg-white"} w-[6px] h-[6px] rounded-full`}
            />
          ))}
        </div>
      )}
      {interactionState.stage === Stage.Crop && (
        <>
          <button
            className={`absolute bottom-3 left-3 hover:cursor-pointer rounded-full p-2 ${interactionState.active === "resolution" ? "bg-white" : "bg-neutral-900/80"}`}
            onClick={() => {
              setInteractionState((prev) => ({
                ...prev,
                active: prev.active === "resolution" ? null : "resolution",
              }));
            }}
          >
            <MdCropFree
              size={18}
              color={interactionState.active === "resolution" ? "#000" : "#FFF"}
            />
          </button>
          <button
            className={`absolute bottom-3 left-16 hover:cursor-pointer rounded-full p-2 ${interactionState.active === "zoom" ? "bg-white" : "bg-neutral-900/80"}`}
            onClick={() => {
              setInteractionState((prev) => ({
                ...prev,
                active: prev.active === "zoom" ? null : "zoom",
              }));
            }}
          >
            <MdZoomIn
              size={18}
              color={interactionState.active === "zoom" ? "#000" : "#FFF"}
            />
          </button>
          <button
            className={`absolute bottom-3 right-3 hover:cursor-pointer rounded-full p-2 ${interactionState.active === "reorder" ? "bg-white" : "bg-neutral-900/80"}`}
            onClick={() => {
              setInteractionState((prev) => ({
                ...prev,
                active: prev.active === "reorder" ? null : "reorder",
              }));
            }}
          >
            <MdContentCopy
              size={18}
              color={interactionState.active === "reorder" ? "#000" : "#FFF"}
            />
          </button>
        </>
      )}
      <AnimatePresence>
        {interactionState.active === "reorder" && (
          <motion.div
            className="absolute bottom-16 right-3 bg-neutral-900/80 rounded-md flex items-center justify-center p-2 gap-2"
            exit={{ opacity: 0, y: 10 }}
            transition={{ ease: "easeInOut", duration: 0.1 }}
          >
            <Reorder.Group
              axis="x"
              values={postFormData.media}
              onReorder={(media: Media[]) => {
                setPostFormData((prev) => ({
                  ...prev,
                  media,
                }));
              }}
              className="flex gap-2 overflow-x-hidden"
            >
              {postFormData.media.map((m, index) => (
                <Reorder.Item
                  key={m.id}
                  value={m}
                  className={`relative w-22 aspect-square flex-shrink-0 overflow-hidden rounded hover:cursor-pointer ${interactionState.position != index ? "opacity-50" : ""}`}
                  initial={false}
                  animate={{
                    scale:
                      interactionState.position == index ? [1, 1.05, 1] : 1,
                  }}
                  transition={{ ease: "easeInOut", duration: 0.2 }}
                  onClick={() => {
                    setInteractionState((prev) => ({
                      ...prev,
                      position: index,
                    }));
                  }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${m.poster})`,
                      backgroundSize: "cover",
                    }}
                  />
                  {interactionState.position == index && (
                    <button
                      className="absolute top-1 right-1 bg-neutral-900/80 rounded-full p-1 hover:cursor-pointer z-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInteractionState((prev) => ({
                          ...prev,
                          position: Math.min(
                            interactionState.position,
                            postFormData.media.length - 2
                          ),
                        }));
                        setPostFormData((prev) => ({
                          ...prev,
                          media: prev.media.filter((_, i) => i != index),
                        }));
                      }}
                    >
                      <RxCross1 color="white" size={12} />
                    </button>
                  )}
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <button
              className="bg-neutral-900/80 rounded-full p-1 hover:cursor-pointer border-1 border-white"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <IoMdAdd color="gray" size={30} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {interactionState.active === "resolution" && (
          <motion.div
            className="absolute bottom-16 left-3"
            exit={{ opacity: 0, y: 10 }}
            transition={{ ease: "easeInOut", duration: 0.1 }}
          >
            <div className="flex flex-col bg-neutral-900/80 rounded-md items-center justify-center w-[120px] text-sm">
              {Object.values(Resolution).map((resolution, index) => (
                <button
                  key={resolution}
                  className={`flex items-center justify-center w-full h-10 ${
                    postFormData.media[interactionState.position].resolution ==
                    resolution
                      ? "text-white"
                      : "text-white/50"
                  } ${
                    index != Object.values(Resolution).length - 1
                      ? "border-b border-white"
                      : ""
                  }`}
                  onClick={() => {
                    setPostFormData((prev) => ({
                      ...prev,
                      media: prev.media.map((m, index) =>
                        index == interactionState.position
                          ? { ...m, resolution }
                          : m
                      ),
                    }));
                  }}
                >
                  {resolution}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {interactionState.active === "zoom" && (
          <motion.div
            className="absolute bottom-16 left-15 bg-neutral-900/80 flex items-center justify-center py-4 px-2 rounded-md"
            exit={{ opacity: 0, y: 10 }}
            transition={{ ease: "easeInOut", duration: 0.1 }}
          >
            <input
              type="range"
              className="custom-slider"
              style={
                {
                  "--thumb-color": "#FFF",
                  "--background-color": "#000",
                  background: `linear-gradient(to right, #FFF 0%, #FFF ${postFormData.media[interactionState.position].zoom}%, #000 ${postFormData.media[interactionState.position].zoom}%, #000 100%)`,
                } as React.CSSProperties
              }
              min={0}
              max={100}
              value={postFormData.media[interactionState.position].zoom}
              onChange={(e) => {
                setPostFormData((prev) => ({
                  ...prev,
                  media: prev.media.map((m, index) =>
                    index == interactionState.position
                      ? { ...m, zoom: parseInt(e.target.value) }
                      : m
                  ),
                }));
              }}
              onMouseUp={() => {
                requestAnimationFrame(clampPosition);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
