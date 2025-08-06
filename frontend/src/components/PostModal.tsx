import Image from "next/image";
import Link from "next/link";
import { Post as PostProps } from "@/utils/types";
import { timeAgo } from "../utils/time";
import { useEffect, useState } from "react";
import { usePost } from "./Post";
import Comment from "./Comment";
import PostCarousel from "./PostCarousel";
import { Emoji } from "./Emoji";
import safeFetch from "@/utils/safeFetch";
import { GetNextCommentsResponse } from "@/utils/types";
import { useApp } from "@/utils/AppProvider";
import { motion } from "motion/react";

import { FaLocationArrow } from "react-icons/fa6";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { AiOutlineMessage } from "react-icons/ai";
import { IoBookmark } from "react-icons/io5";
import { IoBookmarkOutline } from "react-icons/io5";
import { HiDotsHorizontal } from "react-icons/hi";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { LuCirclePlus } from "react-icons/lu";

export default function PostModal({
  id,
  body,
  created_at,
  username,
  media,
  comment_count,
  is_owner,
}: PostProps) {
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const { setError } = useApp();
  const {
    interactionState,
    setInteractionState,
    formData,
    setFormData,
    handleLike,
    handleFollow,
    handleBookmark,
    handleCreateComment,
    comments,
    setComments,
    showFollowingBtn,
  } = usePost();
  let cursor = comments[comments.length - 1]?.id || null;
  const [loadMore, setLoadMore] = useState(
    comment_count >
      comments.filter((c) => c.parent_id == null).length +
        comments.reduce((acc, comment) => {
          return acc + (comment.reply_count ?? 0);
        }, 0)
  );

  const handlePlus = async () => {
    if (!loadMore) return;
    const data = await safeFetch<GetNextCommentsResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${id}/comments${
        cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""
      }`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!data.success) {
      return setError({ message: data.message, status: data.status });
    } else if (data.comments.length > 0) {
      setLoadMore(
        comment_count !=
          data.comments.length +
            comments.filter((c) => c.parent_id == null).length +
            data.comments.reduce((acc, comment) => {
              return acc + (comment.reply_count ?? 0);
            }, 0) +
            comments.reduce((acc, comment) => {
              return acc + (comment.reply_count ?? 0);
            }, 0)
      );
      setComments((prev) => [...prev, ...data.comments]);
      cursor = data.comments[data.comments.length - 1].id;
    } else {
      setLoadMore(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "scroll";
    };
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 bg-black opacity-60 z-3"
        onClick={() => {
          setInteractionState((prev) => ({
            ...prev,
            postModalVisible: false,
          }));
          setFormData({ ...formData, parent_id: "" });
        }}
      ></div>
      <div className="fixed inset-0 flex items-center justify-center z-3 pointer-events-none">
        <motion.div
          className="flex flex-col sm:flex-row pointer-events-auto z-3 text-sm w-[350px] sm:w-[88vw] max-w-[1150px] h-[600px] sm:h-[65vw] max-h-[95vh] rounded-md overflow-hidden"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <div className="flex sm:hidden gap-3 px-4 py-3.5 border-b border-gray-200 bg-white dark:bg-neutral-900">
            <Image
              src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
              alt="pfp"
              width={30}
              height={30}
              unoptimized
              className="rounded-full"
            />
            <div className="flex items-center gap-1">
              <Link href={`/${username}`} className="font-bold">
                {username}
              </Link>
              {!interactionState.isFollowing && !is_owner && (
                <>
                  &#x2022;
                  <button className="text-blue-500" onClick={handleFollow}>
                    Follow
                  </button>
                </>
              )}
              {interactionState.isFollowing && showFollowingBtn.current && (
                <>
                  &#x2022;
                  <button
                    className="text-blue-500"
                    onClick={() => {
                      setInteractionState((prev) => ({
                        ...prev,
                        followOptionVisible: true,
                      }));
                    }}
                  >
                    Following
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
          <PostCarousel
            position={interactionState.position}
            setPosition={(position: number) => {
              setInteractionState((prev) => ({
                ...prev,
                position,
              }));
            }}
            media={media}
            className="w-full h-full"
          />
          <div className="relative bg-white dark:bg-neutral-900 flex flex-col w-full sm:w-[700px] sm:h-full">
            <div className="hidden sm:flex gap-3 px-4 py-3.5 border-b border-gray-200">
              <Image
                src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
                alt="pfp"
                width={30}
                height={30}
                unoptimized
                className="rounded-full"
              />
              <div className="flex items-center gap-1">
                <Link href={`/${username}`} className="font-bold">
                  {username}
                </Link>
                {!interactionState.isFollowing && !is_owner && (
                  <>
                    &#x2022;
                    <button className="text-blue-500" onClick={handleFollow}>
                      Follow
                    </button>
                  </>
                )}
                {interactionState.isFollowing && showFollowingBtn.current && (
                  <>
                    &#x2022;
                    <button
                      className="text-blue-500"
                      onClick={() => {
                        setInteractionState((prev) => ({
                          ...prev,
                          followOptionVisible: true,
                        }));
                      }}
                    >
                      Following
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
            <div className="h-full overflow-y-auto hidden sm:flex flex-col">
              {body && (
                <div className="w-full flex gap-3 px-4 py-2">
                  <Image
                    src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
                    alt="pfp"
                    width={30}
                    height={30}
                    unoptimized
                    className="rounded-full w-[30px] h-[30px]"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="flex break-words gap-1">
                      <Link href={`/${username}`} className="font-bold">
                        {username}
                      </Link>
                      {body}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{timeAgo(created_at)}</span>
                    </div>
                  </div>
                </div>
              )}
              {comments.length > 0 ? (
                <>
                  <div className="flex flex-col gap-1">
                    {comments &&
                      comments
                        .filter((c) => c.parent_id == null)
                        .map((comment) => (
                          <Comment
                            key={comment.id}
                            {...comment}
                            isModal={true}
                          />
                        ))}
                  </div>
                  {loadMore && (
                    <button
                      onClick={handlePlus}
                      className="flex justify-center hover:cursor-pointer my-4"
                    >
                      <LuCirclePlus size={25} />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-center text-gray-500">No comments yet</p>
                </div>
              )}
            </div>
            <div className="flex flex-col border-t border-gray-200">
              <div className="flex items-center gap-3 px-[14px] py-2">
                <button
                  className="flex hover:cursor-pointer"
                  onClick={handleLike}
                >
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
                <button className="hover:cursor-pointer">
                  <AiOutlineMessage size={25} />
                </button>
                <button className="hover:cursor-pointer">
                  <FaLocationArrow size={25} />
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
              <div className="flex flex-col gap-3 sm:gap-0 px-4 py-2">
                <button className="font-bold hover:cursor-pointer mr-auto">
                  {interactionState.likeCount} likes
                </button>
                <Link
                  className="text-xs text-gray-500 hover:cursor-pointer"
                  href={`/p/${id}`}
                >
                  {timeAgo(created_at)}
                </Link>
              </div>
              <form
                onSubmit={handleCreateComment}
                className="hidden sm:flex items-center justify-between p-4 border-t border-gray-200"
              >
                <input
                  name="body"
                  className="outline-none w-full"
                  type="text"
                  value={formData.body}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      body: e.target.value,
                    });
                  }}
                  placeholder="Add a comment..."
                />
                <div className="flex items-center gap-2">
                  {formData.body.length > 0 && (
                    <button
                      type="submit"
                      className="text-blue-500 hover:cursor-pointer ml-2"
                    >
                      Post
                    </button>
                  )}
                  <button
                    className="relative hover:cursor-pointer"
                    onClick={() => {
                      setEmojiPickerVisible(!emojiPickerVisible);
                    }}
                  >
                    <MdOutlineEmojiEmotions size={18} />
                    {emojiPickerVisible && (
                      <Emoji
                        className="z-3 bottom-[40px] left-[-160px] md:left-[-180px] lg:left-[-220px]"
                        setBody={(emoji) => {
                          setFormData((prev) => ({
                            ...prev,
                            body: prev.body + emoji,
                          }));
                        }}
                      />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
      <button
        className="fixed top-4 right-4 cursor-pointer z-3"
        onClick={() => {
          setInteractionState((prev) => ({
            ...prev,
            postModalVisible: false,
          }));
          setFormData({ ...formData, parent_id: "" });
        }}
      >
        <RxCross1 color="white" size={24} />
      </button>
    </>
  );
}
