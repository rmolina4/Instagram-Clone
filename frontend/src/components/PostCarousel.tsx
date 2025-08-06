import Image from "next/image";
import { LUT_FILTERS, Media, LUT_FIELDS } from "@/utils/types";
import { useState } from "react";
import {
  IoIosArrowDroprightCircle,
  IoIosArrowDropleftCircle,
} from "react-icons/io";

interface PostCarouselProps {
  position: number;
  setPosition: (position: number) => void;
  media: Media[];
  className?: string;
}

export default function PostCarousel({
  position,
  setPosition,
  className,
  media,
}: PostCarouselProps) {
  const [loaded, setLoaded] = useState(false);

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
                src={media.media_url}
                autoPlay
                loop
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>
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
