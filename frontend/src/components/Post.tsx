import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { timeAgo } from "../utils/time";

import { HiDotsHorizontal } from "react-icons/hi";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { AiOutlineMessage } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";

export interface PostProps {
  id: string;
  entity_id: string;
  username: string;
  caption: string;
  created_at: string;
  like_count: number;
  liked_by_me: boolean;
  bookmarked_by_me: boolean;
  media_urls: string[];
}

export const Post = ({
  id,
  entity_id,
  username,
  caption,
  created_at,
  like_count,
  liked_by_me,
  bookmarked_by_me,
  media_urls,
}: PostProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isLiked, setIsLiked] = useState(liked_by_me);
  const [isBookmarked, setIsBookmarked] = useState(bookmarked_by_me);
  const [likes, setLikes] = useState(like_count);
  const router = useRouter();

  const handleLike = async () => {
    setIsLiked(!isLiked);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/${entity_id}/action`, {
      method: "PUT",
      credentials: "include",
    });
    if (!res.ok) {
      router.push("/500");
    }
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/${entity_id}/action`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      router.push("/500");
    }
  };

  return (
    <div className="w-[468px] flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <Image
          src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
          alt="pfp"
          width={30}
          height={30}
          unoptimized
          className="rounded-full"
        />
        <div className="flex gap-1">
          <Link href={`/${username}`} className="font-bold">
            {username}
          </Link>
          &#x2022;
          <Link href={`/${username}`} className="text-gray-500">
            {timeAgo(created_at)}
          </Link>
        </div>
        <button
          className="ml-auto hover:cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            setShowOptions(true);
          }}
        >
          <HiDotsHorizontal size={15} />
        </button>
        {showOptions && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 opacity-60"
              onClick={() => setShowOptions(false)}
            ></div>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-md w-[400px] z-30 rounded-xl">
              <button className="w-full font-bold text-red-500 p-3 hover:cursor-pointer border-b border-gray-200">
                Report
              </button>
              <button className="w-full font-bold text-red-500 p-3 hover:cursor-pointer border-b border-gray-200">
                Unfollow
              </button>
              <button className="w-full p-3 hover:cursor-pointer border-b border-gray-200">
                Add to favorites
              </button>
              <button className="w-full p-3 hover:cursor-pointer border-b border-gray-200">
                Go to post
              </button>
              <button className="w-full p-3 hover:cursor-pointer border-b border-gray-200">
                About this account
              </button>
              <button
                onClick={() => setShowOptions(false)}
                className="w-full p-3 hover:cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
      <div className="w-full h-[585px] relative z-[-1]">
        {media_urls.map((url, index) => (
          <Image
            key={index}
            src={url}
            alt="post"
            fill
            unoptimized
            className="object-cover"
          />
        ))}
      </div>
      <div className="w-full flex gap-3 items-center">
        <button className="hover:cursor-pointer" onClick={handleLike}>
          {isLiked ? <IoMdHeart size={25} /> : <IoMdHeartEmpty size={25} />}
        </button>
        <button className="hover:cursor-pointer">
          <AiOutlineMessage size={25} />
        </button>
        <button
          className="ml-auto hover:cursor-pointer"
          onClick={handleBookmark}
        >
          {isBookmarked ? (
            <IoBookmark size={25} />
          ) : (
            <IoBookmarkOutline size={25} />
          )}
        </button>
      </div>
      <button className="font-bold mr-auto hover:cursor-pointer">
        {likes} likes
      </button>
      <div className="flex gap-2">
        <Link href={`/${username}`} className="font-bold">
          {username}
        </Link>
        <span>{caption}</span>
      </div>
      <input
        className="outline-none"
        type="text"
        placeholder="Add a comment..."
      />
    </div>
  );
};
