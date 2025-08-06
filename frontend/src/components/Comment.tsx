"use client";

import Link from "next/link";
import { Comment as CommentType, GetRepliesResponse } from "@/utils/types";
import { useState, Fragment } from "react";
import Image from "next/image";
import { timeAgo } from "../utils/time";
import safeFetch from "@/utils/safeFetch";
import { APIResponse } from "@/utils/types";
import { usePost } from "./Post";
import { useApp } from "@/utils/AppProvider";
import OptionsMenu from "./OptionsMenu";
import { AnimatePresence, motion } from "motion/react";

import { HiDotsHorizontal } from "react-icons/hi";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";

export interface CommentProps extends CommentType {
  isModal?: boolean;
}

interface InteractionState {
  optionsVisible: boolean;
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
  isModal,
  parent_id,
  root_id,
  like_count,
  liked_by_me,
}: CommentProps) {
  const { setFormData, comments, setComments } = usePost();
  const [interactionState, setInteractionState] = useState<InteractionState>({
    optionsVisible: false,
    repliesVisible: false,
  });
  const { setPosts, setError } = useApp();
  let cursor =
    comments.filter((c) => c.root_id == id && !c.recent)[0]?.created_at || null;
  const repliesLeft = reply_count
    ? reply_count - comments.filter((c) => c.root_id == id && !c.recent).length
    : 0;
  const repliesDisplayed = comments.filter((c) => c.root_id == id).length;

  const handleLike = async () => {
    if (!setComments) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              liked_by_me: !c.liked_by_me,
              like_count: c.liked_by_me ? c.like_count - 1 : c.like_count + 1,
            }
          : c
      )
    );
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${entity_id}/action`,
      {
        method: "PUT",
        credentials: "include",
      }
    );
    if (data.success) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              liked_by_me: !c.liked_by_me,
              like_count: c.liked_by_me ? c.like_count - 1 : c.like_count + 1,
            }
          : c
      )
    );
  };

  const handleReply = () => {
    setFormData?.({
      body: `@${username} `,
      parent_id: `${id}`,
      root_id: parent_id === null ? id : root_id,
    });
  };

  const handleDelete = async () => {
    if (!setComments) return;
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${entity_id}/action`,
      { method: "DELETE", credentials: "include" }
    );
    if (!data.success)
      return setError({ message: data.message, status: data.status });
    setComments((prev) => prev.filter((c) => c.id !== id));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === entity_id ? { ...p, comment_count: p.comment_count - 1 } : p
      )
    );
  };

  const handleViewReplies = async () => {
    if (!setComments) return;
    if (repliesLeft && repliesLeft > 0) {
      const data = await safeFetch<GetRepliesResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/post/comments/${id}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!data.success)
        return setError({ message: data.message, status: data.status });
      if (data.replies.length > 0) {
        setComments((prev) => [
          ...data.replies.map((reply) => ({
            ...reply,
            root_id: id,
          })),
          ...prev,
        ]);
        cursor = data.replies[0].created_at;
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
        className={`flex gap-3 group text-sm ${isModal ? "px-4 py-[10px]" : ""} ${parent_id ? "ml-10" : ""}`}
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
        <div className="min-w-0 flex flex-col gap-1">
          <div className="break-all hyphens-auto items-center">
            <Link href={`/${username}`} className="font-bold">
              {username}{" "}
            </Link>
            {body?.split(" ").map((word, index) => {
              if (word.startsWith("@")) {
                return (
                  <Link
                    className="text-blue-500 hover:cursor-pointer"
                    href={`/${word.slice(1)}`}
                    key={index}
                  >
                    {word}{" "}
                  </Link>
                );
              }
              return <Fragment key={index}>{word + " "}</Fragment>;
            })}
          </div>
          {isModal && (
            <>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{timeAgo(created_at)}</span>
                {like_count > 0 && (
                  <AnimatePresence>
                    <motion.span
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {like_count} likes
                    </motion.span>
                  </AnimatePresence>
                )}
                <motion.button
                  onClick={handleReply}
                  className="hover:cursor-pointer"
                  layout
                >
                  Reply
                </motion.button>
                <motion.button
                  onClick={() => {
                    setInteractionState((prev) => ({
                      ...prev,
                      optionsVisible: true,
                    }));
                  }}
                  layout
                >
                  <HiDotsHorizontal
                    size={15}
                    className="opacity-0 group-hover:opacity-100 hover:cursor-pointer ml-auto"
                  />
                </motion.button>
              </div>
              {(repliesLeft > 0 || repliesDisplayed > 0) && (
                <button
                  onClick={handleViewReplies}
                  className="text-xs text-gray-500 hover:cursor-pointer text-left mt-2"
                >
                  {interactionState.repliesVisible && repliesLeft == 0 ? (
                    <span>Hide replies</span>
                  ) : (
                    <span>
                      View {repliesLeft > 0 ? repliesLeft : repliesDisplayed}{" "}
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
          <motion.div
            initial={{ scale: 1 }}
            whileTap={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {liked_by_me ? (
              <IoMdHeart size={15} color="red" />
            ) : (
              <IoMdHeartEmpty size={15} />
            )}
          </motion.div>{" "}
        </button>
      </div>
      {!root_id &&
        interactionState.repliesVisible &&
        comments
          .filter((c) => c.root_id == id)
          .map((c) => <Comment key={c.id} {...c} isModal={isModal} />)}
      {interactionState.optionsVisible && (
        <OptionsMenu
          setOptionsVisible={(visible) =>
            setInteractionState((prev) => ({
              ...prev,
              optionsVisible: visible,
            }))
          }
          items={[
            is_owner
              ? {
                  label: "Delete",
                  onClick: handleDelete,
                  red: true,
                }
              : {
                  label: "Report",
                  red: true,
                },
            {
              label: "Cancel",
            },
          ]}
        />
      )}
    </>
  );
}
