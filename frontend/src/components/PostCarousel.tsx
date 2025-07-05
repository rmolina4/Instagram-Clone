import Image from "next/image";
import { useRef, useState } from "react";
import {
  IoIosArrowDroprightCircle,
  IoIosArrowDropleftCircle,
} from "react-icons/io";

interface PostCarouselProps {
  className?: string;
  media_urls: string[];
}

export default function PostCarousel({
  className,
  media_urls,
}: PostCarouselProps) {
  const [position, setPosition] = useState(0);

  return (
    <div className={`flex relative ${className} overflow-hidden bg-black`}>
      <div
        className="flex transition-transform duration-300 ease-in-out w-full h-full items-center"
        style={{
          transform: `translateX(-${position * 100}%)`,
        }}
      >
        {media_urls.map((url, index) => (
          <div key={index} className="relative w-full h-[400px] flex-shrink-0">
            <Image
              src={url}
              alt="post"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>
        ))}
      </div>
      {position > 0 && (
        <button
          className="absolute top-1/2 left-3 transform -translate-y-1/2 hover:cursor-pointer opacity-80"
          onClick={(e) => {
            e.preventDefault();
            setPosition((position - 1 + media_urls.length) % media_urls.length);
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white w-4 h-4 rounded-full opacity-80" />
          </span>
          <IoIosArrowDropleftCircle
            className="relative text-neutral-900"
            size={25}
          />
        </button>
      )}
      {position < media_urls.length - 1 && (
        <button
          className="absolute top-1/2 right-3 transform -translate-y-1/2 hover:cursor-pointer opacity-80"
          onClick={(e) => {
            e.preventDefault();
            setPosition((position + 1) % media_urls.length);
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white w-4 h-4 rounded-full" />
          </span>
          <IoIosArrowDroprightCircle
            size={25}
            className="relative text-neutral-900"
          />
        </button>
      )}
      {media_urls.length > 1 && (
        <div className="absolute bottom-6 flex gap-1 w-full justify-center">
          {media_urls.map((_, index) => (
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
