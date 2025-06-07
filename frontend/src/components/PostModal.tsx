import Image from "next/image";
import { RxCross1 } from "react-icons/rx";
import Link from "next/link";
import { HiDotsHorizontal } from "react-icons/hi";
import { Post as PostProps } from "@/utils/types";
import { Comment } from "./Comment";
import { timeAgo } from "../utils/time";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { AiOutlineMessage } from "react-icons/ai";
import { IoBookmark } from "react-icons/io5";
import { IoBookmarkOutline } from "react-icons/io5";
import { FaLocationArrow } from "react-icons/fa6";
import { Loader } from "./Loader";
import { useState, useEffect } from "react";

interface PostModalProps extends PostProps {
  setPostModalVisible: (open: boolean) => void;
  setShowOptions: (open: boolean) => void;
  isLiked: boolean;
  handleLike: () => void;
  handleBookmark: () => void;
  isBookmarked: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formData: {
    body: string;
    parent_id: string;
  };
  setFormData: (data: { body: string; parent_id: string }) => void;
  likeCount: number;
}

export default function PostModal({
  id,
  caption,
  created_at,
  username,
  comments,
  media_urls,
  setPostModalVisible,
  setShowOptions,
  isLiked,
  handleLike,
  handleBookmark,
  isBookmarked,
  handleSubmit,
  formData,
  setFormData,
  likeCount,
}: PostModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-20 opacity-60"
        onClick={(e) => {
          e.preventDefault();
          setPostModalVisible(false);
          setFormData({ ...formData, parent_id: "" });
        }}
      ></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex w-[85vw] max-w-[1215px] aspect-[4/3] max-h-[95vh] min-h-[150px] ">
        <div className="relative w-[58%] h-full bg-black flex items-center justify-center">
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
        <div className="relative w-[42%] min-w-[405px] h-full bg-white flex flex-col h-full">
          <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200">
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
              &#x2022;
              <button className="text-blue-500">Follow</button>
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
          </div>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center gap-3 px-4 py-2">
                <Image
                  src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
                  alt="pfp"
                  width={30}
                  height={30}
                  unoptimized
                  className="rounded-full"
                />
                <div className="flex flex-col gap-1">
                  <p className="break-words flex gap-1">
                    <Link href={`/${username}`} className="font-bold">
                      {username}
                    </Link>
                    {caption}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{timeAgo(created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {comments &&
                  comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      {...comment}
                      isModal={true}
                      setFormData={setFormData}
                    />
                  ))}
              </div>
            </div>
            <div className="flex flex-col border-t border-gray-200">
              <div className="flex items-center gap-3 px-[14px] py-2">
                <button className="hover:cursor-pointer" onClick={handleLike}>
                  {isLiked ? (
                    <IoMdHeart size={25} />
                  ) : (
                    <IoMdHeartEmpty size={25} />
                  )}
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
                  {isBookmarked ? (
                    <IoBookmark size={25} />
                  ) : (
                    <IoBookmarkOutline size={25} />
                  )}
                </button>
              </div>
              <div className="flex flex-col px-4 py-2">
                <button className="font-bold hover:cursor-pointer mr-auto">
                  {likeCount} likes
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
                className="flex items-center justify-between p-4 border-t border-gray-200"
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
                {isLoading ? (
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
      </div>
      <button
        className="fixed top-4 right-4 z-30 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          setPostModalVisible(false);
          setFormData({ ...formData, parent_id: "" });
        }}
      >
        <RxCross1 color="white" size={24} />
      </button>
    </>
  );
}
