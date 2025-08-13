import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { InteractionState, PostFormData } from "./CreatePostModal";
import { motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { resize } from "motion";
import { initializeCanvas } from "@/utils/Canvas";
import { VideoMediaDraft } from "@/utils/types";

export default function Video({
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
}) {
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
}
