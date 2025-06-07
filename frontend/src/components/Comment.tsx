"use client";

import Link from "next/link";
import { Comment as CommentType } from "@/utils/types";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { useState } from "react";
import Image from "next/image";
import { timeAgo } from "../utils/time";
import { routerFetch } from "@/utils/safeFetch";
import { APIResponse } from "@/utils/types";
import { useRouter } from "next/navigation";

export interface CommentProps extends CommentType {
  isModal?: boolean;
  setFormData?: (data: { body: string; parent_id: string }) => void;
}

export const Comment = ({
  id,
  body,
  username,
  created_at,
  entity_id,
  like_count,
  liked_by_me,
  isModal,
  setFormData,
}: CommentProps) => {
  const [isLiked, setIsLiked] = useState(liked_by_me);
  const [likeCount, setLikeCount] = useState<number>(like_count);
  const router = useRouter();

  const handleLike = async () => {
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);
    await routerFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${entity_id}/action`,
      {
        method: "PUT",
        credentials: "include",
      },
      router
    );
  };

  const handleReply = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFormData &&
      setFormData({
        body: `@${username} `,
        parent_id: `${id}`,
      });
  };

  return (
    <div
      className={`flex items-center gap-3 ${isModal ? "px-4 py-[6px]" : ""}`}
    >
      {isModal && (
        <Image
          src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
          alt="pfp"
          width={30}
          height={30}
          unoptimized
          className="rounded-full"
        />
      )}
      <div className="flex flex-col gap-1">
        <p className="break-words flex gap-1">
          <Link href={`/${username}`} className="font-bold">
            {username}
          </Link>
          {body}
        </p>
        {isModal && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{timeAgo(created_at)}</span>
            <span>{likeCount} likes</span>
            <button onClick={handleReply}>Reply</button>
          </div>
        )}
      </div>
      <button className="hover:cursor-pointer ml-auto" onClick={handleLike}>
        {isLiked ? <IoMdHeart size={15} /> : <IoMdHeartEmpty size={15} />}
      </button>
    </div>
  );
};
