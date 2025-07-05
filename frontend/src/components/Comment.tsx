"use client";

import Link from "next/link";
import { Comment as CommentType, GetRepliesResponse } from "@/utils/types";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import Image from "next/image";
import { timeAgo } from "../utils/time";
import safeFetch from "@/utils/safeFetch";
import { APIResponse } from "@/utils/types";
import { CommentFormData } from "./Post";
import { useApp } from "@/utils/AppProvider";
import OptionsMenu from "./OptionsMenu";

import { HiDotsHorizontal } from "react-icons/hi";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";

export interface CommentProps extends CommentType {
  isModal?: boolean;
  setFormData?: (data: CommentFormData) => void;
  comments?: CommentType[];
  setComments?: Dispatch<SetStateAction<CommentType[]>>;
}

interface InteractionState {
  isLiked: boolean;
  likeCount: number;
  optionsVisible: boolean;
  repliesDisplayed: number;
  repliesLeft: number;
  repliesVisible: boolean;
}

export default function Comment({
  reply_count,
  is_owner,
  id,
  body,
  username,
  created_at,
  entity_id,
  like_count,
  liked_by_me,
  isModal,
  setFormData,
  parent_id,
  root_id,
  comments,
  setComments,
}: CommentProps) {
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isLiked: liked_by_me,
    likeCount: like_count,
    optionsVisible: false,
    repliesDisplayed: 0,
    repliesLeft: reply_count,
    repliesVisible: false,
  });
  const [cursor, setCursor] = useState<string | null>(null);
  const { setError } = useApp();

  useEffect(() => {
    if (comments) {
      setInteractionState((prev) => ({
        ...prev,
        repliesDisplayed: comments!.filter((c) => c.root_id == id).length,
      }));
    }
  }, [comments]);

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setInteractionState((prev) => ({
      ...prev,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
      isLiked: !prev.isLiked,
    }));
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${entity_id}/action`,
      {
        method: "PUT",
        credentials: "include",
      }
    );
    if (!data.success) {
      return setError({ message: data.message, status: data.status });
    }
  };

  const handleReply = () => {
    if (setFormData) {
      setFormData({
        body: `@${username} `,
        parent_id: `${id}`,
        root_id: parent_id === null ? id : root_id,
      });
    }
  };

  const handleDelete = async () => {
    setInteractionState((prev) => ({
      ...prev,
      optionsVisible: false,
    }));
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${entity_id}/action`,
      { method: "DELETE", credentials: "include" }
    );
    if (!data.success) {
      return setError({ message: data.message, status: data.status });
    }
    setComments!((prev) => prev.filter((c) => c.id !== id));
  };

  const handleViewReplies = async () => {
    if (interactionState.repliesLeft > 0) {
      const data = await safeFetch<GetRepliesResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/post/comments/${id}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!data.success) {
        return setError({ message: data.message, status: data.status });
      } else if (data.replies.length > 0) {
        setInteractionState((prev) => ({
          ...prev,
          repliesLeft: prev.repliesLeft - data.replies.length,
        }));
        setComments!((prev) => [
          ...data.replies.map((reply) => ({
            ...reply,
            root_id: id,
          })),
          ...prev,
        ]);
        setCursor(data.replies[0].created_at);
        return setInteractionState((prev) => ({
          ...prev,
          repliesVisible: true,
        }));
      }
    }
    setInteractionState((prev) => ({
      ...prev,
      repliesVisible: !prev.repliesVisible,
    }));
  };

  return (
    <>
      <div
        className={`flex gap-3 group text-sm ${isModal ? "px-4 py-[6px]" : ""} ${parent_id ? "ml-10" : ""}`}
      >
        {isModal && (
          <Image
            src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
            alt="pfp"
            width={30}
            height={30}
            unoptimized
            className="rounded-full w-[30px] h-[30px]"
          />
        )}
        <div className="flex flex-col gap-1">
          <p className="break-words flex items-center gap-1">
            <Link href={`/${username}`} className="font-bold">
              {username}
            </Link>
            {body?.split(" ").map((word, index) => {
              if (word.startsWith("@")) {
                return (
                  <Link
                    className="text-blue-500 hover:cursor-pointer"
                    href={`/${word.slice(1)}`}
                    key={index}
                  >
                    {word}
                  </Link>
                );
              }
              return word;
            })}
          </p>
          {isModal && (
            <>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{timeAgo(created_at)}</span>
                {interactionState.likeCount > 0 && (
                  <span>{interactionState.likeCount} likes</span>
                )}
                <button onClick={handleReply} className="hover:cursor-pointer">
                  Reply
                </button>
                <button
                  onClick={() => {
                    setInteractionState((prev) => ({
                      ...prev,
                      optionsVisible: !prev.optionsVisible,
                    }));
                  }}
                >
                  <HiDotsHorizontal
                    size={15}
                    className="opacity-0 group-hover:opacity-100 hover:cursor-pointer ml-auto"
                  />
                </button>
              </div>
              {(interactionState.repliesDisplayed > 0 ||
                interactionState.repliesLeft > 0) && (
                <button
                  onClick={handleViewReplies}
                  className="text-xs text-gray-500 hover:cursor-pointer text-left mt-2"
                >
                  {interactionState.repliesVisible &&
                  interactionState.repliesLeft == 0 ? (
                    <span>Hide replies</span>
                  ) : (
                    <span>
                      View{" "}
                      {interactionState.repliesLeft > 0
                        ? interactionState.repliesLeft
                        : interactionState.repliesDisplayed}{" "}
                      replies
                    </span>
                  )}
                </button>
              )}
            </>
          )}
        </div>
        <button
          className={`hover:cursor-pointer ml-auto ${isModal ? "mb-auto mt-4" : ""}`}
          onClick={handleLike}
        >
          {interactionState.isLiked ? (
            <IoMdHeart size={15} />
          ) : (
            <IoMdHeartEmpty size={15} />
          )}
        </button>
      </div>
      {!root_id &&
        comments &&
        interactionState.repliesVisible &&
        comments
          .filter((c) => c.root_id == id)
          .map((c) => (
            <Comment
              key={c.id}
              {...c}
              comments={comments}
              setComments={setComments}
              isModal={isModal}
              setFormData={setFormData}
            />
          ))}
      {interactionState.optionsVisible && (
        <OptionsMenu<InteractionState>
          setInteractionState={setInteractionState}
          items={[
            is_owner
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
            {
              label: "Cancel",
              onClick: () => {
                setInteractionState((prev) => ({
                  ...prev,
                  optionsVisible: false,
                }));
              },
            },
          ]}
        />
      )}
    </>
  );
}
