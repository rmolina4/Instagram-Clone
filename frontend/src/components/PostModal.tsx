import Image from "next/image";
import Link from "next/link";
import { Post as PostProps, Comment as CommentType } from "@/utils/types";
import { timeAgo } from "../utils/time";
import Loader from "./Loader";
import { Dispatch, RefObject, SetStateAction } from "react";
import { InteractionState } from "./Post";
import Comment from "./Comment";
import { CommentFormData } from "./Post";
import PostCarousel from "./PostCarousel";

import { FaLocationArrow } from "react-icons/fa6";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
  IoMdHeart,
  IoMdHeartEmpty,
} from "react-icons/io";
import { AiOutlineMessage } from "react-icons/ai";
import { IoBookmark } from "react-icons/io5";
import { IoBookmarkOutline } from "react-icons/io5";
import { HiDotsHorizontal } from "react-icons/hi";
import { RxCross1 } from "react-icons/rx";

interface PostModalProps extends PostProps {
  handleLike: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleFollow: (key?: keyof InteractionState) => void;
  handleBookmark: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formData: CommentFormData;
  setFormData: (data: CommentFormData) => void;
  comments: CommentType[];
  setComments: Dispatch<SetStateAction<CommentType[]>>;
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  showFollowingBtn: RefObject<boolean>;
}

export default function PostModal({
  id,
  body,
  created_at,
  username,
  media_urls,
  handleLike,
  handleFollow,
  handleBookmark,
  handleSubmit,
  formData,
  setFormData,
  is_owner,
  comments,
  setComments,
  interactionState,
  setInteractionState,
  showFollowingBtn,
}: PostModalProps) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 opacity-60 z-3"
        onClick={(e) => {
          e.preventDefault();
          setInteractionState((prev) => ({
            ...prev,
            postModalVisible: false,
          }));
          setFormData({ ...formData, parent_id: "" });
        }}
      ></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col sm:flex-row z-3 text-sm w-[350px] sm:w-[88vw] max-w-[1150px] h-[600px] sm:h-[65vw] max-h-[95vh] rounded-md overflow-hidden">
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
                <button
                  className="text-blue-500"
                  onClick={(e) => {
                    e.preventDefault();
                    handleFollow();
                  }}
                >
                  Follow
                </button>
              </>
            )}
            {interactionState.isFollowing && showFollowingBtn.current && (
              <>
                &#x2022;
                <button
                  className="text-blue-500"
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
              </>
            )}
          </div>
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
        <PostCarousel media_urls={media_urls} className="w-full h-full" />
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
                  <button
                    className="text-blue-500"
                    onClick={(e) => {
                      e.preventDefault();
                      handleFollow();
                    }}
                  >
                    Follow
                  </button>
                </>
              )}
              {interactionState.isFollowing && showFollowingBtn.current && (
                <>
                  &#x2022;
                  <button
                    className="text-blue-500"
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
                </>
              )}
            </div>
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
          <div className="flex flex-col h-full overflow-y-auto hidden sm:block">
            {body && (
              <div className="flex gap-3 px-4 py-2">
                <Image
                  src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
                  alt="pfp"
                  width={30}
                  height={30}
                  unoptimized
                  className="rounded-full w-[30px] h-[30px]"
                />
                <div className="flex flex-col gap-1">
                  <p className="break-words flex gap-1">
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
              <div className="flex flex-col gap-1">
                {comments &&
                  comments
                    .filter((c) => c.parent_id == null)
                    .map((comment) => (
                      <Comment
                        key={comment.id}
                        {...comment}
                        isModal={true}
                        setFormData={setFormData}
                        comments={comments}
                        setComments={setComments}
                      />
                    ))}
              </div>
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
              onSubmit={handleSubmit}
              className="hidden sm:flex items-center justify-between p-4 border-t border-gray-200"
            >
              <input
                name="body"
                className="outline-none w-full"
                type="text"
                value={formData.body}
                onChange={(e) => {
                  e.preventDefault();
                  setFormData({
                    ...formData,
                    body: e.target.value,
                  });
                }}
                placeholder="Add a comment..."
              />
              {interactionState.isLoading ? (
                <Loader />
              ) : (
                formData.body.length > 0 && (
                  <button
                    type="submit"
                    className="text-blue-500 hover:cursor-pointer ml-2"
                  >
                    Post
                  </button>
                )
              )}
            </form>
          </div>
        </div>
      </div>
      <button
        className="fixed top-4 right-4 cursor-pointer z-3"
        onClick={(e) => {
          e.preventDefault();
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
