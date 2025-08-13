import Image from "next/image";
import { Media, ProcessedVideoMedia } from "@/utils/types";
import { useEffect, useRef, useState } from "react";
import {
  IoIosArrowDroprightCircle,
  IoIosArrowDropleftCircle,
} from "react-icons/io";
import { FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

interface PostCarouselProps {
  position: number;
  setPosition: (position: number) => void;
  media: (Media | ProcessedVideoMedia)[];
  className?: string;
}

const isProcessedVideoMedia = (
  media: Media | ProcessedVideoMedia
): media is ProcessedVideoMedia => {
  return "media_type" in media && media.media_type === "video";
};

export default function PostCarousel({
  position,
  setPosition,
  className,
  media,
}: PostCarouselProps) {
  const [loaded, setLoaded] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      const setCurrentTime = () => {
        video.currentTime = isProcessedVideoMedia(media[index])
          ? media[index].start_percent * video.duration
          : 0;
      };
      if (video.readyState < 2) {
        video.onloadeddata = setCurrentTime;
      } else {
        setCurrentTime();
      }
      if (index === position) {
        video.play();
      } else {
        video.pause();
      }
    });
  }, [position]);

  useEffect(() => {
    const video = videoRefs.current[position];
    if (!video) {
      setIsPlaying(true);
      return;
    }

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
  }, [videoRefs, position]);

  useEffect(() => {
    const video = videoRefs.current[position];
    const m = media[position];
    if (!video || !isPlaying || !isProcessedVideoMedia(m)) return;

    let frameId: number;
    const SEEK_OFFSET = 0.01;
    const tick = () => {
      const progress = video.currentTime / video.duration;
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

  return (
    <div
      className={`flex relative overflow-hidden ${
        loaded ? "bg-black" : ""
      } ${className}`}
    >
      <div
        className="flex w-full h-full items-center transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(-${position * 100}%)`,
        }}
      >
        {media.map((media, index) => (
          <div
            key={index}
            className="relative w-full h-full flex-shrink-0 overflow-hidden"
          >
            {media.mime_type.startsWith("image/") ? (
              <Image
                src={media.media_url}
                alt="post"
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover"
                onLoad={() => {
                  setLoaded(true);
                }}
              />
            ) : (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={media.media_url}
                autoPlay
                muted={isMuted}
                playsInline
                loop
                className="object-cover w-full h-full"
                style={
                  isProcessedVideoMedia(media)
                    ? {
                        objectPosition: `${(-media.pan.x + 0.5) * 100}% ${
                          (-media.pan.y + 0.5) * 100
                        }%`,
                        transform: `scale(${(media.zoom + 100) / 100})`,
                      }
                    : undefined
                }
                onClick={() => {
                  if (videoRefs.current[index]?.paused) {
                    videoRefs.current[index]?.play();
                  } else {
                    videoRefs.current[index]?.pause();
                  }
                }}
              />
            )}
          </div>
        ))}
      </div>
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center opacity-85 pointer-events-none">
          <FaPlay className="text-white" size={50} />
        </div>
      )}
      {media[position].mime_type.startsWith("video/") && (
        <button
          className="absolute bottom-3 right-3 hover:cursor-pointer rounded-full p-2 bg-neutral-900/60"
          onClick={() => {
            setIsMuted(!isMuted);
          }}
        >
          {isMuted ? (
            <FaVolumeMute className="text-white" size={15} />
          ) : (
            <FaVolumeUp className="text-white" size={15} />
          )}
        </button>
      )}
      {position > 0 && (
        <button
          className="absolute top-1/2 left-3 transform -translate-y-1/2 hover:cursor-pointer"
          onClick={() => {
            setPosition((position - 1 + media.length) % media.length);
          }}
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
      {position < media.length - 1 && (
        <button
          className="absolute top-1/2 right-3 transform -translate-y-1/2 hover:cursor-pointer"
          onClick={() => {
            setPosition((position + 1) % media.length);
          }}
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
      {media.length > 1 && (
        <div className="absolute bottom-6 flex gap-1 w-full justify-center">
          {media.map((_, index) => (
            <div
              key={index}
              className={`${index == position ? "bg-blue-500" : "bg-white"} w-[6px] h-[6px] rounded-full`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
