"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { timeAgo } from "../utils/time";
import Loader from "./Loader";
import Comment from "./Comment";
import safeFetch from "@/utils/safeFetch";
import {
  APIResponse,
  CreateCommentResponse,
  Post as PostProps,
  Comment as CommentType,
} from "@/utils/types";
import PostModal from "./PostModal";
import { useApp } from "@/utils/AppProvider";
import OptionsMenu, { OptionsMenuItem } from "./OptionsMenu";
import PostCarousel from "./PostCarousel";

import { HiDotsHorizontal } from "react-icons/hi";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { AiOutlineMessage } from "react-icons/ai";
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";

export interface CommentFormData {
  body: string;
  parent_id: string;
  root_id?: string;
}

export interface InteractionState {
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  position: number;
  isFollowing: boolean;
  optionsVisible: boolean;
  postModalVisible: boolean;
  followOptionVisible: boolean;
  isLoading: boolean;
}

export default function Post(props: PostProps) {
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isLiked: props.liked_by_me,
    isBookmarked: props.bookmarked_by_me,
    likeCount: props.like_count,
    position: 0,
    isFollowing: props.followed_by_me,
    optionsVisible: false,
    postModalVisible: false,
    followOptionVisible: false,
    isLoading: false,
  });
  const [formData, setFormData] = useState<CommentFormData>({
    body: "",
    parent_id: "",
  });
  const { posts, setPosts, setError } = useApp();
  const [comments, setComments] = useState<CommentType[]>(
    props.comments.map((comment) => ({
      ...comment,
    }))
  );
  const showFollowingBtn = useRef<boolean>(false);

  useEffect(() => {
    if (interactionState.postModalVisible) {
      window.history.pushState(null, "", `/p/${props.id}`);
    } else {
      window.history.pushState(null, "", `/`);
    }
  }, [props.id, interactionState.postModalVisible]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInteractionState((prev) => ({
      ...prev,
      isLoading: true,
    }));
    if (!props.id) return;
    const data = await safeFetch<CreateCommentResponse>(
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
      }
    );
    if (!data.success) {
      return setError({ message: data.message, status: data.status });
    }
    setComments((prev) => [
      ...prev,
      { ...data.comment, root_id: formData.root_id },
    ]);
    setFormData({ body: "", parent_id: "" });
    setInteractionState((prev) => ({
      ...prev,
      isLoading: false,
    }));
  };

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setInteractionState((prev) => ({
      ...prev,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
      isLiked: !prev.isLiked,
    }));
    if (!props.id) return;
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${props.entity_id}/action`,
      {
        method: "PUT",
        credentials: "include",
      }
    );
    if (!data.success) {
      return setError({ message: data.message, status: data.status });
    }
  };

  const handleBookmark = async () => {
    setInteractionState((prev) => ({
      ...prev,
      optionsVisible: false,
      isBookmarked: !prev.isBookmarked,
    }));
    if (!props.id) return;
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${props.entity_id}/action`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!data.success) {
      return setError({ message: data.message, status: data.status });
    }
  };

  const handleDelete = async () => {
    setInteractionState((prev) => ({
      ...prev,
      optionsVisible: false,
    }));
    if (!props.id) return;
    setPosts(posts.filter((post) => post.id !== props.id));
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${props.entity_id}/action`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (!data.success) {
      return setError({ message: data.message, status: data.status });
    }
  };

  const handleFollow = async (key?: keyof InteractionState) => {
    setInteractionState((prev) => ({
      ...prev,
      [key ?? "optionsVisible"]: false,
    }));
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
    showFollowingBtn.current = true;
  };

  return (
    <>
      <div className="w-[468px] flex flex-col gap-1 text-sm">
        <div className="flex items-center gap-2">
          <Image
            src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
            alt="pfp"
            width={30}
            height={30}
            unoptimized
            className="rounded-full w-[30px] h-[30px]"
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
          {!interactionState.isFollowing && !props.is_owner && (
            <button
              className="text-blue-500 hover:cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleFollow();
              }}
            >
              Follow
            </button>
          )}
          {interactionState.isFollowing && showFollowingBtn.current && (
            <button
              className="text-blue-500 hover:cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setInteractionState((prev) => ({
                  ...prev,
                  followOptionVisible: true,
                }));
              }}
            >
              Following
            </button>
          )}
          <button
            className="ml-auto hover:cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setInteractionState((prev) => ({
                ...prev,
                optionsVisible: true,
              }));
            }}
          >
            <HiDotsHorizontal size={15} />
          </button>
        </div>
        <PostCarousel
          media_urls={props.media_urls}
          className="w-full h-[585px]"
        />
        <div className="w-full flex gap-3 items-center">
          <button className="flex hover:cursor-pointer" onClick={handleLike}>
            <span className="relative inline-block w-[25px] h-[25px]">
              <IoMdHeart
                className={`${interactionState.isLiked ? "opacity-100 scale-100" : "opacity-0 scale-0"} transition-[scale] duration-300 absolute`}
                size={25}
                color="red"
              />
              <IoMdHeartEmpty
                className={`${interactionState.isLiked ? "opacity-0 scale-0" : "opacity-100 scale-100"} transition-[scale] duration-300 absolute`}
                size={25}
              />
            </span>
          </button>
          <button
            className="hover:cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setInteractionState((prev) => ({
                ...prev,
                postModalVisible: true,
              }));
            }}
          >
            <AiOutlineMessage size={25} />
          </button>
          <button
            className="ml-auto hover:cursor-pointer"
            onClick={handleBookmark}
          >
            {interactionState.isBookmarked ? (
              <IoBookmark size={25} />
            ) : (
              <IoBookmarkOutline size={25} />
            )}
          </button>
        </div>
        <button className="font-bold mr-auto hover:cursor-pointer">
          {interactionState.likeCount} likes
        </button>
        <div className="flex gap-1">
          <Link href={`/${props.username}`} className="font-bold">
            {props.username}
          </Link>
          <span>{props.body}</span>
        </div>
        {comments.length > 0 && (
          <div>
            <button
              className="text-gray-500 hover:cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setInteractionState((prev) => ({
                  ...prev,
                  postModalVisible: true,
                }));
              }}
            >
              View all {comments.length} comments
            </button>
          </div>
        )}
        {comments
          .filter((comment) => comment.parent_id === null && comment.is_owner)
          .slice(-2)
          .map((comment) => (
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
          {interactionState.isLoading ? (
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
      {interactionState.postModalVisible && (
        <PostModal
          {...props}
          handleLike={handleLike}
          handleBookmark={handleBookmark}
          handleSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          handleFollow={handleFollow}
          comments={comments}
          setComments={setComments}
          interactionState={interactionState}
          setInteractionState={setInteractionState}
          showFollowingBtn={showFollowingBtn}
        />
      )}
      {interactionState.optionsVisible && (
        <OptionsMenu
          setInteractionState={setInteractionState}
          items={
            [
              props.is_owner
                ? {
                    label: "Delete",
                    onClick: () => handleDelete(),
                    red: true,
                  }
                : {
                    label: "Report",
                    onClick: () => {},
                    red: true,
                  },
              interactionState.isFollowing && {
                label: "Unfollow",
                onClick: () => handleFollow(),
                red: true,
              },
              {
                label: interactionState.isBookmarked
                  ? "Remove from favorites"
                  : "Add to favorites",
                onClick: () => handleBookmark(),
              },
              {
                label: "Go to post",
                href: `/p/${props.id}`,
                isLink: true,
              },
              {
                label: "About this account",
                href: `/${props.username}`,
                isLink: true,
              },
              {
                label: "Cancel",
                onClick: () =>
                  setInteractionState((prev) => ({
                    ...prev,
                    optionsVisible: false,
                  })),
              },
            ].filter(Boolean) as OptionsMenuItem[]
          }
        />
      )}
      {interactionState.followOptionVisible && (
        <OptionsMenu<InteractionState>
          setInteractionState={setInteractionState}
          items={[
            {
              label: "Unfollow",
              onClick: () => handleFollow("followOptionVisible"),
              red: true,
            },
            {
              label: "Cancel",
              onClick: () =>
                setInteractionState((prev) => ({
                  ...prev,
                  followOptionVisible: false,
                })),
            },
          ]}
          field={"followOptionVisible"}
        />
      )}
    </>
  );
}
