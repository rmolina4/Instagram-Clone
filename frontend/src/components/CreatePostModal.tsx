"use client";

import { useState, useRef, startTransition } from "react";
import { useApp } from "@/utils/AppProvider";
import { GetPostResponse } from "@/utils/types";
import safeFetch from "@/utils/safeFetch";
import OptionsMenu from "./OptionsMenu";

import { RxCross1 } from "react-icons/rx";
import { MdOutlinePermMedia } from "react-icons/md";
import { LiaLongArrowAltLeftSolid } from "react-icons/lia";
import PostCarousel from "./PostCarousel";

interface CreatePostModalProps {
  setCreatePostModalVisible: (open: boolean) => void;
}

interface InteractionState {
  position: number;
  optionsVisible: boolean;
}

enum Stage {
  Upload,
  Crop,
  Edit,
  Share,
}

export default function CreatePostModal({
  setCreatePostModalVisible,
}: CreatePostModalProps) {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const { setPosts, setOptimisticPosts, optimisticPosts, user, setError } =
    useApp();
  const [media, setMedia] = useState<File[]>([]);
  const [interactionState, setInteractionState] = useState<InteractionState>({
    position: 0,
    optionsVisible: false,
  });
  const [stage, setStage] = useState<Stage>(Stage.Upload);
  const exit = useRef<boolean>(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        setMedia((prev) => [...prev, file]);
      }
    }
    setIsDragOver(false);
    setStage(Stage.Crop);
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
    const formData = new FormData();
    formData.append("body", "test");
    media.forEach((file) => {
      formData.append("media", file);
    });

    const optimisticPost = {
      id: crypto.randomUUID(),
      body: "test",
      username: user.username,
      created_at: new Date().toISOString(),
      like_count: 0,
      liked_by_me: false,
      bookmarked_by_me: false,
      comments: [],
      media_urls: media.map((file) => URL.createObjectURL(file)),
      is_owner: true,
      account_id: user.id,
      followed_by_me: false,
      entity_id: crypto.randomUUID(),
    };

    startTransition(async () => {
      setOptimisticPosts((prev) => [optimisticPost, ...prev]);
      const data = await safeFetch<GetPostResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/post`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      if (!data.success) {
        return setError({ message: data.message, status: data.status });
      }
      setPosts((prev) => [data.post, ...prev]);
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 opacity-60 z-3"
        onClick={(e) => {
          e.preventDefault();
          exit.current = true;
          stage === Stage.Upload
            ? setCreatePostModalVisible(false)
            : setInteractionState((prev) => ({
                ...prev,
                optionsVisible: true,
              }));
        }}
      ></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-3 rounded-xl overflow-hidden bg-white dark:bg-black">
        <div className="flex items-center justify-between font-bold h-[50px] border-b border-gray-300 dark:border-gray-700 px-3">
          {stage === Stage.Upload ? (
            <span className="w-full text-center"> Create new post</span>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  exit.current = false;
                  setInteractionState((prev) => ({
                    ...prev,
                    optionsVisible: true,
                  }));
                }}
              >
                <LiaLongArrowAltLeftSolid size={35} />
              </button>
              <span>
                {stage === Stage.Share ? "Create new post" : Stage[stage]}
              </span>
              <button
                className="text-blue-500 text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  if (stage < Stage.Share) {
                    return setStage(stage + 1);
                  }
                  return handleShare();
                }}
              >
                {stage < Stage.Share ? "Next" : "Share"}
              </button>
            </>
          )}
        </div>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-[60vw] min-w-[400px] max-w-[700px] aspect-[1/1] flex flex-col items-center justify-center text-xl gap-4 ${
            isDragOver && "bg-gray-200"
          }`}
        >
          {stage === Stage.Upload ? (
            <>
              <MdOutlinePermMedia size={40} />
              Drag photos and videos here
              <button
                className="bg-blue-500 text-white px-4 py-1 text-[16px] rounded-md"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                Select from computer
              </button>
            </>
          ) : (
            <PostCarousel
              className="w-full h-full"
              media_urls={media.map((file) => URL.createObjectURL(file))}
            />
          )}
        </div>
      </div>
      <button
        className="fixed top-4 right-4 cursor-pointer z-3"
        onClick={(e) => {
          e.preventDefault();
          exit.current = true;
          setInteractionState((prev) => ({
            ...prev,
            optionsVisible: true,
          }));
        }}
      >
        <RxCross1 color="white" size={24} />
      </button>
      {interactionState.optionsVisible && (
        <OptionsMenu
          setInteractionState={setInteractionState}
          items={[
            {
              label: "Discard",
              onClick: () => {
                setMedia([]);
                setInteractionState((prev) => ({
                  ...prev,
                  optionsVisible: false,
                }));
                setStage(Stage.Upload);
                if (exit.current) setCreatePostModalVisible(false);
              },
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
