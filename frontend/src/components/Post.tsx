"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { timeAgo } from "../utils/time";
import { useRouter } from "next/navigation";
import { Loader } from "./Loader";
import { Comment, CommentProps } from "./Comment";
import { routerFetch } from "@/utils/safeFetch";
import {
  APIResponse,
  CreateCommentResponse,
  Post as PostProps,
} from "@/utils/types";
import PostModal from "./PostModal";

import { HiDotsHorizontal } from "react-icons/hi";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { AiOutlineMessage } from "react-icons/ai";
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";

interface CommentFormData {
  body: string;
  parent_id: string;
}

export const Post = (props: PostProps) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(props.liked_by_me);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(
    props.bookmarked_by_me
  );
  const [likeCount, setLikeCount] = useState<number>(props.like_count);
  const [postModalVisible, setPostModalVisible] = useState<boolean>(false);
  const [userComments, setUserComments] = useState<CommentProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<CommentFormData>({
    body: "",
    parent_id: "",
  });
  const router = useRouter();

  useEffect(() => {
    if (postModalVisible) {
      window.history.pushState(null, "", `/p/${props.id}`);
    } else {
      window.history.pushState(null, "", `/`);
    }
  }, [postModalVisible]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const data = await routerFetch<CreateCommentResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${props.id}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: formData.body,
          parent_id: formData.parent_id === "" ? null : formData.parent_id,
        }),
      },
      router
    );
    setUserComments((prev) => [...prev, data!.comment]);
    props.comments.push(data!.comment);
    setFormData({ body: "", parent_id: "" });
    setIsLoading(false);
  };

  const handleLike = async () => {
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);
    await routerFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${props.entity_id}/action`,
      {
        method: "PUT",
        credentials: "include",
      },
      router
    );
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    await routerFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${props.entity_id}/action`,
      {
        method: "POST",
        credentials: "include",
      },
      router
    );
    setShowOptions(false);
  };

  return (
    <div className="w-[468px] flex flex-col gap-1 text-sm">
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
          <Link href={`/${props.username}`} className="font-bold">
            {props.username}
          </Link>
          &#x2022;
          <Link href={`/${props.username}`} className="text-gray-500">
            {timeAgo(props.created_at)}
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
          <div className="z-40">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 opacity-60"
              onClick={() => setShowOptions(false)}
            ></div>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-md w-[400px] z-30 rounded-xl flex flex-col">
              <button className="w-full font-bold text-red-500 p-3 hover:cursor-pointer border-b border-gray-200">
                Report
              </button>
              <button className="w-full font-bold text-red-500 p-3 hover:cursor-pointer border-b border-gray-200">
                Unfollow
              </button>
              {isBookmarked ? (
                <button
                  className="w-full p-3 hover:cursor-pointer border-b border-gray-200"
                  onClick={handleBookmark}
                >
                  Remove from favorites
                </button>
              ) : (
                <button
                  className="w-full p-3 hover:cursor-pointer border-b border-gray-200"
                  onClick={handleBookmark}
                >
                  Add to favorites
                </button>
              )}
              <Link
                href={`/p/${props.id}`}
                className="w-full flex justify-center p-3 hover:cursor-pointer border-b border-gray-200"
              >
                Go to post
              </Link>
              <Link
                className="w-full flex justify-center p-3 hover:cursor-pointer border-b border-gray-200"
                href={`/${props.username}`}
              >
                About this account
              </Link>
              <button
                onClick={() => setShowOptions(false)}
                className="w-full p-3 hover:cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="w-full h-[585px] relative z-[-1]">
        {props.media_urls.map((url, index) => (
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
        <button
          className="hover:cursor-pointer"
          onClick={() => setPostModalVisible(true)}
        >
          <AiOutlineMessage size={25} />
        </button>
        {postModalVisible && (
          <PostModal
            {...props}
            setPostModalVisible={setPostModalVisible}
            setShowOptions={setShowOptions}
            handleLike={handleLike}
            handleBookmark={handleBookmark}
            isLiked={isLiked}
            isBookmarked={isBookmarked}
            likeCount={likeCount}
            handleSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
          />
        )}
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
        {likeCount} likes
      </button>
      <div className="flex gap-1">
        <Link href={`/${props.username}`} className="font-bold">
          {props.username}
        </Link>
        <span>{props.caption}</span>
      </div>
      {props.comments.length > 0 && (
        <div>
          <button
            className="text-gray-500 hover:cursor-pointer"
            onClick={() => setPostModalVisible(true)}
          >
            View all {props.comments.length} comments
          </button>
        </div>
      )}
      {userComments &&
        userComments.map((comment) => (
          <Comment key={comment.id} {...comment} isModal={false} />
        ))}
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-between p-0"
      >
        <input
          name="body"
          className="outline-none rounded w-full"
          type="text"
          value={formData.body}
          onChange={(e) => {
            e.preventDefault();
            setFormData({ ...formData, body: e.target.value });
          }}
          placeholder="Add a comment..."
        />
        {isLoading ? (
          <Loader />
        ) : (
          formData.body.length > 0 && (
            <button
              type="submit"
              className="text-blue-500 hover:cursor-pointer"
            >
              Post
            </button>
          )
        )}
      </form>
    </div>
  );
};
