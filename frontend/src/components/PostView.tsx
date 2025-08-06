"use client";

import { APIResponse, Post as PostProps } from "@/utils/types";
import { useState } from "react";
import Image from "next/image";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import Link from "next/link";
import { HiDotsHorizontal } from "react-icons/hi";
import safeFetch from "@/utils/safeFetch";
import { useApp } from "@/utils/AppProvider";

interface InteractionState {
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  position: number;
  isFollowing: boolean;
  optionsVisible: boolean;
}

export default function PostView(props: PostProps) {
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isLiked: props.liked_by_me,
    isBookmarked: props.bookmarked_by_me,
    likeCount: props.like_count,
    position: 0,
    isFollowing: props.followed_by_me,
    optionsVisible: false,
  });
  const { setError } = useApp();

  const handleFollow = async () => {
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/user/${props.account_id}/follow`,
      { method: "POST", credentials: "include" }
    );
    if (!data.success) {
      return setError({ message: data.message, status: data.status });
    }
    setInteractionState((prev) => ({
      ...prev,
      isFollowing: !prev.isFollowing,
    }));
  };

  return (
    <>
      <div className="relative h-[585px] aspect-[4/3]">
        {props.media.map((media, index) => (
          <Image
            key={index}
            src={media.media_url}
            alt="post"
            fill
            className={`object-cover ${index == interactionState.position ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {interactionState.position > 0 && (
          <button
            className="absolute top-1/2 left-3 transform -translate-y-1/2 hover:cursor-pointer opacity-80"
            onClick={() => {
              setInteractionState((prev) => ({
                ...prev,
                position:
                  (prev.position - 1 + props.media.length) % props.media.length,
              }));
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
        {interactionState.position < props.media.length - 1 && (
          <button
            className="absolute top-1/2 right-3 transform -translate-y-1/2 hover:cursor-pointer opacity-80"
            onClick={() => {
              setInteractionState((prev) => ({
                ...prev,
                position: (prev.position + 1) % props.media.length,
              }));
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
        {props.media.length > 1 && (
          <div className="absolute bottom-6 flex gap-1 w-full justify-center">
            {props.media.map((_, index) => (
              <div
                key={index}
                className={`${index == interactionState.position ? "bg-blue-500" : "bg-white"} w-[6px] h-[6px] rounded-full`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-3 px-4 py-3.5 border-b border-gray-200">
        <Image
          src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
          alt="pfp"
          width={30}
          height={30}
          unoptimized
          className="rounded-full"
        />
        <div className="flex items-center gap-1">
          <Link href={`/${props.username}`} className="font-bold">
            {props.username}
          </Link>
          {!interactionState.isFollowing && !props.is_owner && (
            <>
              &#x2022;
              <button className="text-blue-500" onClick={handleFollow}>
                Follow
              </button>
            </>
          )}
        </div>
        <button
          className="ml-auto hover:cursor-pointer"
          onClick={() => {
            setInteractionState((prev) => ({
              ...prev,
              optionsVisible: true,
            }));
          }}
        >
          <HiDotsHorizontal size={15} />
        </button>
      </div>
    </>
  );
}
