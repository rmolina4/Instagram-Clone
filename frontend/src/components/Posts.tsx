"use client";

import { useEffect, useRef, useState } from "react";
import Post from "./Post";
import { useApp } from "@/utils/AppProvider";
import safeFetch from "@/utils/safeFetch";
import { GetNextPostsResponse, Post as PostProps } from "@/utils/types";
import Loader from "./Loader";
import PostSkeleton from "./PostSkeleton";
import { useInView } from "@/utils/hooks";

export default function Posts({ initialPosts }: { initialPosts: PostProps[] }) {
  const { setPosts, posts, setError } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const loadMore = useRef(true);
  const ref = useRef(null);
  const isInView = useInView(ref);
  let cursor = posts[posts.length - 1]?.created_at || null;

  useEffect(() => {
    if (initialPosts.length == 0) loadMore.current = false;
    setPosts(initialPosts);
    cursor = initialPosts[initialPosts.length - 1].created_at;
    setHasHydrated(true);
  }, [initialPosts, setPosts]);

  useEffect(() => {
    const getNextPosts = async () => {
      setIsLoading(true);
      const data = await safeFetch<GetNextPostsResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/post/next${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!data.success) {
        return setError({ message: data.message, status: data.status });
      } else if (data.posts.length === 0) {
        setIsLoading(false);
        loadMore.current = false;
        return;
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
        cursor = data.posts[data.posts.length - 1].created_at;
        setIsLoading(false);
      }
    };
    if (loadMore.current && isInView && !isLoading) {
      getNextPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return (
    <>
      {hasHydrated ? (
        <div className="flex flex-col">
          {posts.length === 0
            ? null
            : posts.map((post) => (
                <div key={post.id}>
                  <Post {...post} />
                  <div className="border-t border-gray-300 my-5" />
                </div>
              ))}
        </div>
      ) : (
        initialPosts.map((post, index) => (
          <div key={index}>
            <PostSkeleton {...post} />
            <div className="border-t border-gray-300 my-5" />
          </div>
        ))
      )}
      <div ref={ref} className="flex justify-center min-h-5 w-full">
        {isLoading && <Loader />}
      </div>
    </>
  );
}
