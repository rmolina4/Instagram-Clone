"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PostContext } from "@/utils/PostProvider";
import { routerFetch } from "@/utils/safeFetch";
import { GetPostResponse } from "@/utils/types";

import { RxCross1 } from "react-icons/rx";
import { MdOutlinePermMedia } from "react-icons/md";
import { FaArrowLeftLong } from "react-icons/fa6";

interface CreatePostModalProps {
  setCreatePostModalVisible: (open: boolean) => void;
}

export default function CreatePostModal({
  setCreatePostModalVisible,
}: CreatePostModalProps) {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [media, setMedia] = useState<File[]>([]);
  const { posts, setPosts } = useContext(PostContext);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        setMedia((prev) => [...prev, file]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleShare = async () => {
    setCreatePostModalVisible(false);
    let formData = new FormData();
    media.forEach((file) => {
      formData.append("media", file);
    });
    formData.append("caption", "test");

    const data = await routerFetch<GetPostResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/post`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
      router,
    );
    setPosts([data!.post, ...posts]);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-20 opacity-60"
        onClick={(e) => {
          e.preventDefault();
          setCreatePostModalVisible(false);
        }}
      ></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
        <div className="flex items-center justify-between font-bold p-2 bg-white rounded-t-xl">
          <button>
            <FaArrowLeftLong size={24} />
          </button>
          <span>Create new post</span>
          <button className="text-blue-500 text-sm" onClick={handleShare}>
            Share
          </button>
        </div>
        <div className="border-t border-gray-200" />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-[60vw] max-w-[700px] aspect-[1/1] flex flex-col items-center justify-center p-4 text-xl gap-4 rounded-b-xl ${
            isDragOver ? "bg-gray-200" : "bg-white"
          }`}
        >
          {media.length === 0 ? (
            <>
              <MdOutlinePermMedia size={40} />
              Drag photos and videos here
              <button className="rounded-lg bg-blue-500 text-white px-4 py-1 text-[16px]">
                Select from computer
              </button>
            </>
          ) : (
            media.map((file) => (
              <Image
                key={file.name}
                src={URL.createObjectURL(file)}
                alt="media"
                fill
                unoptimized
                className="object-cover"
              />
            ))
          )}
        </div>
      </div>
      <button
        className="fixed top-4 right-4 z-30 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          setCreatePostModalVisible(false);
        }}
      >
        <RxCross1 color="white" size={24} />
      </button>
    </>
  );
}
