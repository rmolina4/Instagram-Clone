import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { InteractionState, PostFormData } from "./CreatePostModal";
import { motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { resize } from "motion";
import { initializeCanvas } from "@/utils/Canvas";

export default function Video({
  interactionState,

  postFormData,
  setPostFormData,
  videoRef,
  canvasRef,
}: {
  interactionState: InteractionState;
  postFormData: PostFormData;
  setPostFormData: Dispatch<SetStateAction<PostFormData>>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  const leftX = useMotionValue(0);
  const rightX = useMotionValue(0);
  const markerX = useMotionValue(0);
  const coverX = useMotionValue(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [leftConstraints, setLeftConstraints] = useState<{
    left: number;
    right: number;
  }>({
    left: 0,
    right: 0,
  });
  const [rightConstraints, setRightConstraints] = useState<{
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
    const video = postFormData.media[interactionState.position]
      .resource as HTMLVideoElement;
    const progress = coverX.get() / size.width;
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((media, index) =>
        index === interactionState.position
          ? { ...media, cover: progress }
          : media
      ),
    }));
    video.currentTime = progress * video.duration;
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
      setLeftConstraints({ left: 0, right: width - 16 });
      setRightConstraints({ left: -width + 16, right: 0 });
      setSize({ width, height });
    });
    return () => stop();
  }, [timelineRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let frameId: number;

    const tick = () => {
      if (!video.duration) return;
      const progress = video.currentTime / video.duration;
      const max = (rightX.get() + size.width) / size.width;
      const min = leftX.get() / size.width;
      if (progress > max || progress < min) {
        return (video.currentTime = min * video.duration);
      }
      markerX.set(progress * size.width);
      frameId = requestAnimationFrame(tick);
    };

    const handlePlay = () => {
      frameId = requestAnimationFrame(tick);
    };

    const handlePause = () => cancelAnimationFrame(frameId);

    const handleSeeked = () => tick();

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeked", handleSeeked);

    if (!video.paused) handlePlay();

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeked", handleSeeked);
      cancelAnimationFrame(frameId);
    };
  }, [videoRef, size]);

  useMotionValueEvent(leftX, "change", (value) => {
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((media, index) =>
        index === interactionState.position
          ? { ...media, start_time: value / size.width }
          : media
      ),
    }));
    setRightConstraints({ left: -size.width + value + 16, right: 0 });
  });

  useMotionValueEvent(rightX, "change", (value) => {
    setPostFormData((prev) => ({
      ...prev,
      media: prev.media.map((media, index) =>
        index === interactionState.position
          ? { ...media, end_time: -value / size.width }
          : media
      ),
    }));
    setLeftConstraints({ left: 0, right: size.width + value - 16 });
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
            {postFormData.media[interactionState.position].timeline?.map(
              (frame, index) => (
                <div
                  style={{ backgroundImage: `url(${frame})` }}
                  key={index}
                  className="w-16 aspect-square bg-cover bg-center shrink-0"
                />
              )
            )}
          </div>
          <motion.div
            className="absolute top-0 left-0 border-2 border-white w-16 aspect-square rounded-md bg-cover bg-center"
            drag="x"
            dragConstraints={{ left: 0, right: size.width - 16 * 4 }}
            dragMomentum={false}
            dragElastic={0}
            style={{
              backgroundImage: `url(${cover || postFormData.media[interactionState.position].timeline?.[0]})`,
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
            {postFormData.media[interactionState.position].timeline?.map(
              (frame, index) => (
                <div
                  style={{ backgroundImage: `url(${frame})` }}
                  key={index}
                  className="w-16 aspect-square bg-cover bg-center shrink-0"
                />
              )
            )}
          </div>
          <div
            className="absolute inset-0 bg-black/50 rounded-l-md"
            style={{
              width: `${((size.width + rightConstraints.left - 16) * 100) / size.width}%`,
            }}
          />
          <div
            className="absolute inset-0 bg-black/50 rounded-r-md left-auto"
            style={{
              width: `${((size.width - leftConstraints.right - 16) * 100) / size.width}%`,
            }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-[6px] h-[78px] bg-white shadow-[1px_0_10px_1px_rgba(0,0,0,0.4)] rounded-full"
            style={{ x: markerX }}
          />
          <motion.div
            className="absolute flex items-center justify-center top-0 left-0 w-2 h-full bg-white shadow-[-1px_0_10px_1px_rgba(0,0,0,0.4)] hover:cursor-grab rounded-l-md"
            drag="x"
            dragConstraints={leftConstraints}
            dragMomentum={false}
            dragElastic={0}
            style={{ x: leftX }}
          >
            <div className="w-[2px] h-5 bg-black" />
          </motion.div>
          <motion.div
            className="absolute flex items-center justify-center top-0 right-0 w-2 h-full bg-white shadow-[1px_0_10px_1px_rgba(0,0,0,0.4)] hover:cursor-grab rounded-r-md"
            drag="x"
            dragConstraints={rightConstraints}
            dragMomentum={false}
            dragElastic={0}
            style={{ x: rightX }}
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
          checked={!postFormData.media[interactionState.position].audio}
          onChange={() => {
            setPostFormData((prev) => ({
              ...prev,
              media: prev.media.map((media, index) =>
                index === interactionState.position
                  ? { ...media, audio: !media.audio }
                  : media
              ),
            }));
          }}
        />
      </div>
    </>
  );
}
