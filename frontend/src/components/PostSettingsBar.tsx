import { InteractionState, PostFormData, Stage } from "./CreatePostModal";
import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { GetUsernamesResponse } from "@/utils/types";
import safeFetch from "@/utils/safeFetch";
import { Emoji } from "./Emoji";
import { useApp } from "@/utils/AppProvider";
import { motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { resize } from "motion";
import { initializeCanvas } from "@/utils/Canvas";
import { VideoMediaDraft } from "@/utils/types";
import { Adjustment } from "@/utils/types";
import { LUT_FILTERS, LUT_NAME } from "@/utils/types";

import { FaRegUser } from "react-icons/fa";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineLocationOn } from "react-icons/md";

export default function PostSettingsBar({
  interactionState,
  setInteractionState,
  postFormData,
  setPostFormData,
  canvasRef,
  videoRef,
}: {
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  postFormData: PostFormData;
  setPostFormData: Dispatch<SetStateAction<PostFormData>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "340px" }}
      transition={{ duration: 0.8, ease: [0.2, 0.95, 0.1, 0.99] }}
      className="overflow-hidden flex-shrink-0"
    >
      <div className="w-[340px] h-full flex flex-col text-sm overflow-y-auto gap-3">
        {interactionState.stage == Stage.Edit &&
          (postFormData.media[interactionState.position].media_type ===
          "image" ? (
            <Filters
              interactionState={interactionState}
              setInteractionState={setInteractionState}
              postFormData={postFormData}
              setPostFormData={setPostFormData}
            />
          ) : (
            <Video
              interactionState={interactionState}
              postFormData={postFormData}
              setPostFormData={setPostFormData}
              canvasRef={canvasRef}
              videoRef={videoRef}
            />
          ))}
        {interactionState.stage == Stage.Share && (
          <Meta
            interactionState={interactionState}
            setInteractionState={setInteractionState}
            postFormData={postFormData}
            setPostFormData={setPostFormData}
          />
        )}
      </div>
    </motion.div>
  );
}

const Meta = ({
  interactionState,
  setInteractionState,
  postFormData,
  setPostFormData,
}: {
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  postFormData: PostFormData;
  setPostFormData: Dispatch<SetStateAction<PostFormData>>;
}) => {
  const { user } = useApp();
  const locationInputRef = useRef<HTMLInputElement>(null);
  const collaboratorsInputRef = useRef<HTMLInputElement>(null);

  const handleCollaboratorsBlur = () => {
    setInteractionState((prev) => ({
      ...prev,
      addCollaboratorsVisible: false,
    }));
    setPostFormData((prev) => ({
      ...prev,
      collaborators: postFormData.collaborators.filter(
        (user) => user.collaborator
      ),
    }));
    if (collaboratorsInputRef.current) {
      collaboratorsInputRef.current.value = "";
    }
  };

  const handleSearchCollaborators = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.value.length == 0) return;
    const data = await safeFetch<GetUsernamesResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/user/search?prefix=${e.target.value}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!data.success) return;
    setPostFormData((prev) => ({
      ...prev,
      collaborators: [
        ...prev.collaborators,
        ...data.users
          .filter(
            (user) =>
              !prev.collaborators.some(
                (collaborator) => collaborator.id === user.id
              )
          )
          .map((user) => ({
            ...user,
            collaborator: false,
          })),
      ],
    }));
  };

  const handleCollaboratorsChange = (user: {
    id: string;
    username: string;
    name: string;
    collaborator: boolean;
  }) => {
    setPostFormData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.map((u) =>
        u.id === user.id
          ? {
              ...u,
              collaborator: !u.collaborator,
            }
          : u
      ),
    }));
  };

  const handleCollaboratorsDone = () => {
    setPostFormData((prev) => ({
      ...prev,
      collaborators: postFormData.collaborators.filter(
        (user) => user.collaborator
      ),
    }));
    setInteractionState((prev) => ({
      ...prev,
      addCollaboratorsVisible: false,
    }));
    if (collaboratorsInputRef.current) {
      collaboratorsInputRef.current.value = "";
      collaboratorsInputRef.current.blur();
    }
  };

  return (
    <>
      <div className="w-full flex items-center gap-3 px-4 py-2">
        <Image
          src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
          alt="pfp"
          width={28}
          height={28}
          unoptimized
          className="rounded-full"
        />
        <span className="font-bold">{user.username}</span>
      </div>
      <textarea
        className="w-full p-4 outline-none rounded-md min-h-[200px] resize-none flex-shrink-0"
        value={postFormData.body}
        maxLength={300}
        onChange={(e) =>
          setPostFormData((prev) => ({
            ...prev,
            body: e.target.value.slice(0, 300),
          }))
        }
      />
      <div className="relative px-4 py-2 flex justify-between border-b border-gray-300 dark:border-gray-700">
        <button
          onClick={() => {
            setInteractionState((prev) => ({
              ...prev,
              emojiPickerVisible: !prev.emojiPickerVisible,
            }));
          }}
        >
          <MdOutlineEmojiEmotions size={20} />
        </button>
        <span
          className={`${
            postFormData.body.length >= 300 ? "text-red-500" : "text-gray-500 "
          }`}
        >
          {postFormData.body.length}/300
        </span>
        {interactionState.emojiPickerVisible && (
          <Emoji
            setBody={(emoji) => {
              setPostFormData((prev) => ({
                ...prev,
                body: prev.body + emoji,
              }));
              setInteractionState((prev) => ({
                ...prev,
                emojiPickerVisible: false,
              }));
            }}
            className="bottom-[40px]"
          />
        )}
      </div>
      <div className="px-4 flex py-2">
        <input
          ref={locationInputRef}
          className="w-full outline-none text-md"
          placeholder="Add location"
          value={postFormData.location}
          onChange={(e) =>
            setPostFormData((prev) => ({
              ...prev,
              location: e.target.value,
            }))
          }
        />
        <button
          onClick={() => {
            if (postFormData.location.length == 0) {
              return locationInputRef.current?.focus();
            }
            setPostFormData((prev) => ({
              ...prev,
              location: "",
            }));
          }}
        >
          {postFormData.location.length == 0 ? (
            <MdOutlineLocationOn color="black" size={20} />
          ) : (
            <RxCross1 size={20} />
          )}
        </button>
      </div>
      <div className="px-4 flex py-2">
        <div className="w-full relative">
          <input
            ref={collaboratorsInputRef}
            className={`w-full outline-none text-md ${
              postFormData.collaborators.length > 0 &&
              !interactionState.addCollaboratorsVisible
                ? "placeholder:text-black placeholder:font-bold"
                : ""
            }`}
            placeholder={
              postFormData.collaborators.length == 0 ||
              interactionState.addCollaboratorsVisible
                ? "Add collaborators"
                : postFormData.collaborators.length == 1
                  ? postFormData.collaborators[0].username
                  : `${postFormData.collaborators.length} people`
            }
            onFocus={() => {
              setInteractionState((prev) => ({
                ...prev,
                addCollaboratorsVisible: true,
              }));
            }}
            onBlur={handleCollaboratorsBlur}
            onChange={handleSearchCollaborators}
          />
          {interactionState.addCollaboratorsVisible && (
            <div
              className="absolute bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] w-full h-[200px] mt-2 rounded-md overflow-y-auto"
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              {collaboratorsInputRef.current &&
              (collaboratorsInputRef.current.value?.length > 0 ||
                postFormData.collaborators.length > 0) ? (
                <>
                  <div className="flex flex-col h-[70%]">
                    {postFormData.collaborators.map((user) => (
                      <div
                        className="flex w-full px-4 py-2 gap-2 items-center"
                        key={user.id}
                      >
                        <Image
                          src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
                          alt="pfp"
                          width={28}
                          height={28}
                          unoptimized
                          className="rounded-full"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold">{user.username}</span>
                          <span className="text-xs text-gray-500">
                            {user.name}
                          </span>
                        </div>
                        <input
                          className="ml-auto hover:cursor-pointer"
                          type="checkbox"
                          checked={user.collaborator}
                          onChange={() => {
                            handleCollaboratorsChange(user);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center h-[30%]">
                    <button
                      className="font-bold w-[90%] bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-md"
                      onClick={handleCollaboratorsDone}
                    >
                      Done
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1 justify-center items-center h-full">
                  <FaRegUser size={20} />
                  <span className="text-sm font-medium">Add Collaborators</span>
                  <span className="text-xs text-gray-500 text-center px-6">
                    If they accept, their username will be added to the post. It
                    will be shared with their followers and shown on their
                    profile.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (postFormData.collaborators.length == 0) {
              return collaboratorsInputRef.current?.focus();
            }
            setPostFormData((prev) => ({
              ...prev,
              collaborators: [],
            }));
          }}
        >
          {postFormData.collaborators.length == 0 ? (
            <FaRegUser size={20} />
          ) : (
            <RxCross1 size={20} />
          )}
        </button>
      </div>
      <button
        onClick={() => {
          setInteractionState((prev) => ({
            ...prev,
            advancedSettingsVisible: !prev.advancedSettingsVisible,
          }));
        }}
        className={`hover:cursor-pointer flex items-center justify-between px-4 py-2 ${!interactionState.advancedSettingsVisible ? " border-b border-gray-300 dark:border-gray-700" : "font-bold"} text-md`}
      >
        Advanced settings
        {interactionState.advancedSettingsVisible ? (
          <MdOutlineKeyboardArrowUp size={20} />
        ) : (
          <MdOutlineKeyboardArrowDown size={20} />
        )}
      </button>
      {interactionState.advancedSettingsVisible && (
        <>
          <div className="px-4 py-2 flex flex-wrap">
            <span className="flex-1 break-words">
              Hide like and view counts on this post
            </span>
            <input
              className="w-5 h-5"
              type="checkbox"
              checked={postFormData.hideMetrics}
              onChange={(e) =>
                setPostFormData((prev) => ({
                  ...prev,
                  hideMetrics: e.target.checked,
                }))
              }
            />
          </div>
          <div className="px-4 py-2 flex flex-wrap">
            <span className="flex-1 break-words">Turn off commenting</span>
            <input
              className="w-5 h-5"
              type="checkbox"
              checked={postFormData.disableComments}
              onChange={(e) =>
                setPostFormData((prev) => ({
                  ...prev,
                  disableComments: e.target.checked,
                }))
              }
            />
          </div>
        </>
      )}
    </>
  );
};

const Video = ({
  interactionState,
  postFormData,
  setPostFormData,
  canvasRef,
  videoRef,
}: {
  interactionState: InteractionState;
  postFormData: PostFormData;
  setPostFormData: Dispatch<SetStateAction<PostFormData>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) => {
  const startX = useMotionValue(0);
  const endX = useMotionValue(0);
  const progressX = useMotionValue(0);
  const coverX = useMotionValue(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [startConstraints, setStartConstraints] = useState<{
    left: number;
    right: number;
  }>({
    left: 0,
    right: 0,
  });
  const [endConstraints, setEndConstraints] = useState<{
    left: number;
    right: number;
  }>({
    left: 0,
    right: 0,
  });
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [cover, setCover] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const video = postFormData.media[
    interactionState.position
  ] as VideoMediaDraft;

  const handleDragEnd = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const canvasWidth = 200;
    const canvasHeight = 200;
    initializeCanvas(
      canvas,
      ctx,
      canvasWidth,
      canvasHeight,
      window.devicePixelRatio
    );
    const progress = coverX.get() / size.width;
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((media, index) =>
        index === interactionState.position
          ? { ...media, cover: progress }
          : media
      ),
    }));
    video.resource.currentTime = progress * video.resource.duration;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(
      postFormData.media[interactionState.position].resource,
      0,
      0,
      canvasWidth,
      canvasHeight
    );
    setCover(canvas.toDataURL());
  };

  useEffect(() => {
    if (!timelineRef.current) return;
    const stop = resize(timelineRef.current, (_, { width, height }) => {
      if (width === 0) return;
      const startXValue = video.start_percent * width;
      const endXValue = video.end_percent * width - width;
      startX.set(startXValue);
      endX.set(endXValue);
      setStartConstraints({ left: 0, right: width + endXValue - 16 });
      setEndConstraints({ left: -width + startXValue + 16, right: 0 });
      setSize({ width, height });
    });
    return () => stop();
  }, [timelineRef, interactionState.position]);

  useEffect(() => {
    progressX.set(interactionState.currentVideoProgress * size.width);
  }, [interactionState.currentVideoProgress]);

  useMotionValueEvent(startX, "change", (value) => {
    if (size.width === 0) return;
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((media, index) =>
        index === interactionState.position
          ? { ...media, start_percent: value / size.width }
          : media
      ),
    }));
    setEndConstraints({ left: -size.width + value + 16, right: 0 });
  });

  useMotionValueEvent(endX, "change", (value) => {
    if (size.width === 0) return;
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((media, index) =>
        index === interactionState.position
          ? {
              ...media,
              end_percent: (size.width + value) / size.width,
            }
          : media
      ),
    }));
    setStartConstraints({ left: 0, right: size.width + value - 16 });
  });

  return (
    <>
      <input
        className="hidden"
        type="file"
        id="coverInput"
        accept="image/png, image/jpeg"
        ref={coverInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          setPostFormData((prev) => ({
            ...prev,
            media: prev.media.map((media, index) =>
              index === interactionState.position
                ? { ...media, cover: url }
                : media
            ),
          }));
        }}
      />
      <div className="flex flex-col px-4 py-2 gap-5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[16px]">Cover photo</span>
          <span
            className="text-md font-medium text-blue-500 hover:underline hover:cursor-pointer"
            onClick={() => {
              coverInputRef.current?.click();
            }}
          >
            Select from computer
          </span>
        </div>
        <div className="relative">
          <div className="flex items-center rounded-md overflow-hidden">
            {video.timeline.map((frame, index) => (
              <div
                style={{ backgroundImage: `url(${frame})` }}
                key={index}
                className="w-16 aspect-square bg-cover bg-center shrink-0"
              />
            ))}
          </div>
          <motion.div
            className="absolute top-0 left-0 border-2 border-white w-16 aspect-square rounded-md bg-cover bg-center"
            drag="x"
            dragConstraints={{ left: 0, right: size.width - 16 * 4 }}
            dragMomentum={false}
            dragElastic={0}
            style={{
              backgroundImage: `url(${cover || video.timeline[0]})`,
              x: coverX,
            }}
            onDragEnd={handleDragEnd}
          />
        </div>
      </div>
      <div className="flex flex-col px-4 py-2">
        <span className="text-[16px] font-bold">Trim</span>
        <div className="relative h-16 mt-5 mb-1">
          <div
            className="flex items-center rounded-md overflow-hidden"
            ref={timelineRef}
          >
            {video.timeline.map((frame, index) => (
              <div
                style={{ backgroundImage: `url(${frame})` }}
                key={index}
                className="w-16 aspect-square bg-cover bg-center shrink-0"
              />
            ))}
          </div>
          <div
            className="absolute inset-0 bg-black/50 rounded-l-md"
            style={{
              width: `${((size.width + endConstraints.left - 16) * 100) / size.width}%`,
            }}
          />
          <div
            className="absolute inset-0 bg-black/50 rounded-r-md left-auto"
            style={{
              width: `${((size.width - startConstraints.right - 16) * 100) / size.width}%`,
            }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-[6px] h-[78px] bg-white shadow-[1px_0_10px_1px_rgba(0,0,0,0.4)] rounded-full"
            style={{ x: progressX }}
          />
          <motion.div
            className="absolute flex items-center justify-center top-0 left-0 w-2 h-full bg-white shadow-[-1px_0_10px_1px_rgba(0,0,0,0.4)] hover:cursor-grab rounded-l-md"
            drag="x"
            dragConstraints={startConstraints}
            dragMomentum={false}
            dragElastic={0}
            style={{ x: startX }}
            onDragStart={() => {
              videoRef.current?.pause();
            }}
            onDragEnd={() => {
              videoRef.current?.play();
            }}
          >
            <div className="w-[2px] h-5 bg-black" />
          </motion.div>
          <motion.div
            className="absolute flex items-center justify-center top-0 right-0 w-2 h-full bg-white shadow-[1px_0_10px_1px_rgba(0,0,0,0.4)] hover:cursor-grab rounded-r-md"
            drag="x"
            dragConstraints={endConstraints}
            dragMomentum={false}
            dragElastic={0}
            style={{ x: endX }}
            onDragStart={() => {
              videoRef.current?.pause();
            }}
            onDragEnd={() => {
              videoRef.current?.play();
            }}
          >
            <div className="w-[2px] h-5 bg-black" />
          </motion.div>
        </div>
        <div className="flex items-center justify-between">
          <span>0s</span>
          <span>
            {Math.round(
              (
                postFormData.media[interactionState.position]
                  .resource as HTMLVideoElement
              ).duration / 2
            )}
            s
          </span>
          <span>
            {Math.round(
              (
                postFormData.media[interactionState.position]
                  .resource as HTMLVideoElement
              ).duration
            )}
            s
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-[16px]">Video has no audio</span>
        <input
          className="w-5 h-5"
          type="checkbox"
          checked={!video.audio}
          onChange={() => {
            setPostFormData((prev) => ({
              ...prev,
              media: prev.media.map((media, index) =>
                index === interactionState.position
                  ? {
                      ...media,
                      audio: !video.audio,
                    }
                  : media
              ),
            }));
          }}
        />
      </div>
    </>
  );
};

const Filters = ({
  interactionState,
  setInteractionState,
  postFormData,
  setPostFormData,
}: {
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  postFormData: PostFormData;
  setPostFormData: Dispatch<SetStateAction<PostFormData>>;
}) => {
  const handleReset = (key: keyof Adjustment) => {
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((media, index) => {
        if (index === interactionState.position) {
          return {
            ...media,
            adjustments: {
              ...media.adjustments,
              [key]: 0,
            },
          };
        }
        return media;
      }),
    }));
  };

  const handleSetLut = (name: LUT_NAME) => {
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((media, index) =>
        index === interactionState.position ? { ...media, lut: name } : media
      ),
    }));
  };

  return (
    <>
      <div className="flex justify-between">
        <button
          className={`w-full text-[16px] font-medium border-b border-black py-2 ${
            interactionState.adjustmentsVisible ? "opacity-30" : ""
          }`}
          onClick={() => {
            setInteractionState((prev) => ({
              ...prev,
              adjustmentsVisible: false,
            }));
          }}
        >
          Filters
        </button>
        <button
          className={`w-full text-[16px] font-medium border-b border-black py-2 ${
            !interactionState.adjustmentsVisible ? "opacity-30" : ""
          }`}
          onClick={() => {
            setInteractionState((prev) => ({
              ...prev,
              adjustmentsVisible: true,
            }));
          }}
        >
          Adjustments
        </button>
      </div>
      {interactionState.adjustmentsVisible ? (
        <div className="flex flex-col gap-5">
          {(
            Object.keys(
              postFormData.media[interactionState.position].adjustments
            ) as (keyof Adjustment)[]
          ).map((key) => (
            <div key={key} className="flex flex-col px-4 group gap-5">
              <div className="flex justify-between font-medium text-[16px] items-center">
                {key}
                {postFormData.media[interactionState.position].adjustments[
                  key
                ] != 0 && (
                  <div
                    className="text-blue-500 font-bold hover:cursor-pointer group-hover:block hidden text-sm"
                    onClick={() => {
                      handleReset(key);
                    }}
                  >
                    Reset
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <input
                  className="w-[270px] custom-slider"
                  key={key}
                  type="range"
                  min={
                    key == "Vignette" || key == "Temperature" || key == "Fade"
                      ? 0
                      : -100
                  }
                  max={100}
                  value={
                    postFormData.media[interactionState.position].adjustments[
                      key
                    ]
                  }
                  onChange={(e) =>
                    setPostFormData((prev) => ({
                      ...prev,
                      media: prev.media.map((media, index) =>
                        index === interactionState.position
                          ? {
                              ...media,
                              adjustments: {
                                ...media.adjustments,
                                [key]: Number(e.target.value),
                              },
                            }
                          : media
                      ),
                    }))
                  }
                  style={{
                    backgroundImage:
                      key != "Vignette" && key != "Temperature" && key != "Fade"
                        ? `linear-gradient(to right,  rgba(255, 255, 255, 0) ${
                            postFormData.media[interactionState.position]
                              .adjustments[key] >= 0
                              ? 50
                              : postFormData.media[interactionState.position]
                                  .adjustments[key] /
                                  2 +
                                50
                          }%, #000000 ${
                            postFormData.media[interactionState.position]
                              .adjustments[key] >= 0
                              ? 50
                              : postFormData.media[interactionState.position]
                                  .adjustments[key] /
                                  2 +
                                50
                          }%, #000000 ${
                            postFormData.media[interactionState.position]
                              .adjustments[key] >= 0
                              ? postFormData.media[interactionState.position]
                                  .adjustments[key] /
                                  2 +
                                50
                              : 50
                          }%, rgba(255, 255, 255, 0) ${
                            postFormData.media[interactionState.position]
                              .adjustments[key] >= 0
                              ? postFormData.media[interactionState.position]
                                  .adjustments[key] /
                                  2 +
                                50
                              : 50
                          }%)`
                        : `linear-gradient(to right, #000000 0%, #000000 ${postFormData.media[interactionState.position].adjustments[key]}%, rgba(255, 255, 255, 0) ${postFormData.media[interactionState.position].adjustments[key]}%)`,
                  }}
                />
                <div
                  className={`w-6 text-[12px] text-right ${
                    postFormData.media[interactionState.position].adjustments[
                      key
                    ] != 0
                      ? "text-black"
                      : "text-gray-500"
                  }`}
                >
                  {
                    postFormData.media[interactionState.position].adjustments[
                      key
                    ]
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className={`grid grid-cols-3 gap-5 overflow-y-auto px-4 pb-2 ${postFormData.media[interactionState.position].lut != "None" ? "border-b border-gray-300 dark:border-gray-700" : ""}`}
          >
            {(Object.keys(LUT_FILTERS) as LUT_NAME[]).map((name, index) => (
              <div
                className="flex flex-col gap-1 items-center hover:cursor-pointer"
                key={index}
                onClick={() => {
                  handleSetLut(name);
                }}
              >
                <Image
                  src="/Aden-2x.jpg"
                  alt="Hot Air Balloon"
                  width={90}
                  height={90}
                  unoptimized
                  className={`border-2 rounded-md ${postFormData.media[interactionState.position].lut === name ? "border-blue-500" : "border-transparent"}`}
                  style={{
                    filter: Object.entries(LUT_FILTERS[name]).reduce(
                      (acc, [key, value]) => {
                        return acc + `${key}(${value})`;
                      },
                      "" as string
                    ),
                  }}
                />
                <span className="text-sm">{name}</span>
              </div>
            ))}
          </div>
          {postFormData.media[interactionState.position].lut != "None" && (
            <div className="flex justify-between items-center px-4">
              <input
                className="w-[270px] custom-slider"
                type="range"
                min={0}
                max={100}
                value={
                  postFormData.media[interactionState.position].lut_strength
                }
                onChange={(e) => {
                  setPostFormData((prev) => ({
                    ...prev,
                    media: prev.media.map((media, index) =>
                      index === interactionState.position
                        ? {
                            ...media,
                            lut_strength: Number(e.target.value),
                          }
                        : media
                    ),
                  }));
                }}
                style={{
                  backgroundImage: `linear-gradient(to right, #000000 0%, #000000 ${postFormData.media[interactionState.position].lut_strength}%, rgba(255,255,255,0) ${postFormData.media[interactionState.position].lut_strength}%)`,
                }}
              />
              <span className="text-sm">
                {postFormData.media[interactionState.position].lut_strength}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};
