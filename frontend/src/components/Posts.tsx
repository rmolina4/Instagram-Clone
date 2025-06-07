"use client";

import { useContext, useState } from "react";
import { Post } from "./Post";
import { PostContext } from "@/utils/PostProvider";
import { Loader } from "./Loader";
import {Post as PostProps } from "@/utils/types"

export const Posts = ({ initialPosts }: { initialPosts: PostProps[] }) => {
  const { posts } = useContext(PostContext);
  const [nextPosts, setNextPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {posts.length === 0
        ? null
        : posts.map((post, index) => (
            <div key={index}>
              <Post {...post} />
              <div className="border-t border-gray-300 my-5" />
            </div>
          ))}
      {initialPosts.length === 0 ? (
        <div className="text-center text-gray-500">There are no posts.</div>
      ) : (
        initialPosts.map((post, index) => (
          <div key={index}>
            <Post {...post} />
            <div className="border-t border-gray-300 my-5" />
          </div>
        ))
      )}
      {nextPosts.map((post, index) => (
        <div key={index}>
          <Post {...post} />
          <div className="border-t border-gray-300 my-5" />
        </div>
      ))}
      {isLoading && <Loader />}
    </div>
  );
};
