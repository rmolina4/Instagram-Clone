"use client";

import Image from "next/image";
import {
  useState,
  useRef,
  createContext,
  Dispatch,
  SetStateAction,
  RefObject,
  useContext,
} from "react";
import Link from "next/link";
import { timeAgo } from "../utils/time";
import Comment from "./Comment";
import safeFetch from "@/utils/safeFetch";
import {
  APIResponse,
  CreateResourceResponse,
  Post as PostProps,
  Comment as CommentType,
} from "@/utils/types";
import PostModal from "./PostModal";
import { useApp } from "@/utils/AppProvider";
import OptionsMenu, { OptionsMenuItem } from "./OptionsMenu";
import PostCarousel from "./PostCarousel";
import { Emoji } from "./Emoji";
import { motion } from "motion/react";

import { HiDotsHorizontal } from "react-icons/hi";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { AiOutlineMessage } from "react-icons/ai";
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";
import { MdOutlineEmojiEmotions } from "react-icons/md";

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
  emojiPickerVisible: boolean;
}

interface PostContextType {
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  formData: CommentFormData;
  setFormData: Dispatch<SetStateAction<CommentFormData>>;
  comments: CommentType[];
  setComments: Dispatch<SetStateAction<CommentType[]>>;
  showFollowingBtn: RefObject<boolean>;
  handleLike: () => void;
  handleBookmark: () => void;
  handleDelete: () => void;
  handleFollow: () => void;
  handleCreateComment: (e: React.FormEvent<HTMLFormElement>) => void;
}

const PostContext = createContext<PostContextType>({
  interactionState: {
    isLiked: false,
    isBookmarked: false,
    likeCount: 0,
    position: 0,
    isFollowing: false,
    optionsVisible: false,
    postModalVisible: false,
    followOptionVisible: false,
    emojiPickerVisible: false,
  },
  setInteractionState: () => {},
  formData: {
    body: "",
    parent_id: "",
  },
  setFormData: () => {},
  comments: [],
  setComments: () => {},
  showFollowingBtn: { current: false },
  handleLike: () => {},
  handleBookmark: () => {},
  handleDelete: () => {},
  handleFollow: () => {},
  handleCreateComment: () => {},
});

export function usePost() {
  return useContext(PostContext);
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
    emojiPickerVisible: false,
  });
  const [formData, setFormData] = useState<CommentFormData>({
    body: "",
    parent_id: "",
  });
  const { posts, setPosts, setError, user } = useApp();
  const [comments, setComments] = useState<CommentType[]>(
    props.comments.map((comment) => ({
      ...comment,
    }))
  );
  const showFollowingBtn = useRef<boolean>(false);

  const handleCreateComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const optimisticComment = {
      id: crypto.randomUUID(),
      body: formData.body,
      username: user.username,
      created_at: new Date().toISOString(),
      entity_id: crypto.randomUUID(),
      like_count: 0,
      liked_by_me: false,
      is_owner: true,
      parent_id: formData.parent_id === "" ? null : formData.parent_id,
      reply_count: 0,
      root_id: formData.root_id,
      recent: true,
    };
    setComments((prev) => [...prev, optimisticComment]);
    setPosts(
      posts.map((post) =>
        post.id === props.id
          ? { ...post, comment_count: post.comment_count + 1 }
          : post
      )
    );

    const data = await safeFetch<CreateResourceResponse>(
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
      setComments((prev) =>
        prev.filter((comment) => comment.id !== optimisticComment.id)
      );
      setPosts(
        posts.map((post) =>
          post.id === props.id
            ? { ...post, comment_count: post.comment_count - 1 }
            : post
        )
      );
    }
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === optimisticComment.id
          ? { ...comment, id: data.id, entity_id: data.entity_id }
          : comment
      )
    );
    setFormData({ body: "", parent_id: "" });
  };

  const handleLike = async () => {
    setInteractionState((prev) => ({
      ...prev,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
      isLiked: !prev.isLiked,
    }));
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${props.entity_id}/action`,
      {
        method: "PUT",
        credentials: "include",
      }
    );
    if (data.success) return;
    setInteractionState((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    }));
  };

  const handleBookmark = async () => {
    setInteractionState((prev) => ({
      ...prev,
      optionsVisible: false,
      isBookmarked: !prev.isBookmarked,
    }));
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${props.entity_id}/action`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (data.success) return;
    setInteractionState((prev) => ({
      ...prev,
      isBookmarked: !prev.isBookmarked,
    }));
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
    showFollowingBtn.current = true;
  };

  return (
    <PostContext.Provider
      value={{
        interactionState,
        setInteractionState,
        formData,
        setFormData,
        comments,
        setComments,
        showFollowingBtn,
        handleLike,
        handleBookmark,
        handleDelete,
        handleFollow,
        handleCreateComment,
      }}
    >
      <div className="w-[468px] flex flex-col gap-1 text-sm">
        <div className="flex items-center gap-2">
          <Image
            src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
            alt="pfp"
            width={30}
            height={30}
            unoptimized
            className="rounded-full w-[30px] h-[30px] hover:cursor-pointer"
          />
          <div className="flex gap-1">
            <Link href={`/${props.username}`} className="font-bold">
              {props.username}
            </Link>
            &#x2022;
            <Link href={`/p/${props.id}`} className="text-gray-500">
              {timeAgo(props.created_at)}
            </Link>
          </div>
          {!interactionState.isFollowing && !props.is_owner && (
            <button
              className="text-blue-500 hover:cursor-pointer"
              onClick={handleFollow}
            >
              Follow
            </button>
          )}
          {interactionState.isFollowing && showFollowingBtn.current && (
            <button
              className="text-blue-500 hover:cursor-pointer"
              onClick={() => {
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
        <PostCarousel
          media={props.media}
          className="w-full h-[585px]"
          position={interactionState.position}
          setPosition={(position: number) => {
            setInteractionState((prev) => ({
              ...prev,
              position,
            }));
          }}
        />
        <div className="w-full flex gap-3 items-center">
          <button className="hover:cursor-pointer" onClick={handleLike}>
            <motion.div
              initial={{ scale: 1 }}
              whileTap={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {interactionState.isLiked ? (
                <IoMdHeart size={25} color="red" />
              ) : (
                <IoMdHeartEmpty size={25} />
              )}
            </motion.div>
          </button>
          <button
            className="hover:cursor-pointer"
            onClick={() => {
              setInteractionState((prev) => ({
                ...prev,
                emojiPickerVisible: false,
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
              onClick={() => {
                setInteractionState((prev) => ({
                  ...prev,
                  postModalVisible: true,
                }));
              }}
            >
              View all {props.comment_count} comments
            </button>
          </div>
        )}
        {comments
          .filter(
            (comment) =>
              comment.parent_id === null && comment.is_owner && comment.recent
          )
          .slice(-2)
          .map((comment) => (
            <Comment key={comment.id} {...comment} isModal={false} />
          ))}
        <form
          onSubmit={handleCreateComment}
          className="flex items-center justify-between p-0"
        >
          <input
            name="body"
            className="outline-none rounded w-full"
            type="text"
            value={formData.body}
            onChange={(e) => {
              setFormData({ ...formData, body: e.target.value });
            }}
            placeholder="Add a comment..."
          />
          <div className="flex items-center gap-2">
            {formData.body.length > 0 && (
              <button
                type="submit"
                className="text-blue-500 hover:cursor-pointer"
              >
                Post
              </button>
            )}
            <button
              className="relative hover:cursor-pointer"
              onClick={() => {
                setInteractionState((prev) => ({
                  ...prev,
                  emojiPickerVisible: !prev.emojiPickerVisible,
                }));
              }}
            >
              <MdOutlineEmojiEmotions size={18} />
              {interactionState.emojiPickerVisible && (
                <Emoji
                  setBody={(emoji) => {
                    setFormData((prev) => ({
                      ...prev,
                      body: prev.body + emoji,
                    }));
                  }}
                  className="z-2 bottom-[40px] left-[-160px] md:left-[-180px] lg:left-[0px]"
                />
              )}
            </button>
          </div>
        </form>
      </div>
      {interactionState.postModalVisible && <PostModal {...props} />}
      {interactionState.optionsVisible && (
        <OptionsMenu
          setOptionsVisible={(visible) =>
            setInteractionState((prev) => ({
              ...prev,
              optionsVisible: visible,
            }))
          }
          items={
            [
              props.is_owner
                ? {
                    label: "Delete",
                    onClick: handleDelete,
                    red: true,
                  }
                : {
                    label: "Report",
                    red: true,
                  },
              interactionState.isFollowing && {
                label: "Unfollow",
                onClick: handleFollow,
                red: true,
              },
              {
                label: interactionState.isBookmarked
                  ? "Remove from favorites"
                  : "Add to favorites",
                onClick: handleBookmark,
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
              },
            ].filter(Boolean) as OptionsMenuItem[]
          }
        />
      )}
      {interactionState.followOptionVisible && (
        <OptionsMenu
          setOptionsVisible={(visible) =>
            setInteractionState((prev) => ({
              ...prev,
              followOptionVisible: visible,
            }))
          }
          items={[
            {
              label: "Unfollow",
              onClick: handleFollow,
              red: true,
            },
            {
              label: "Cancel",
            },
          ]}
        />
      )}
    </PostContext.Provider>
  );
}
