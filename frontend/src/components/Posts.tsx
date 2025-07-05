"use client";

import { useEffect, useRef, useState } from "react";
import Post from "./Post";
import { useApp } from "@/utils/AppProvider";
import safeFetch from "@/utils/safeFetch";
import { GetNextPostsResponse, Post as PostProps } from "@/utils/types";
import { useInView } from "react-intersection-observer";
import Loader from "./Loader";
import PostSkeleton from "./PostSkeleton";

export default function Posts({ initialPosts }: { initialPosts: PostProps[] }) {
  const { setPosts, optimisticPosts, setError } = useApp();
  const [cursor, setCursor] = useState<string | null>(null);
  const { ref, inView } = useInView({
    threshold: 0,
  });
  const loadMore = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setPosts(initialPosts);
    console.log(initialPosts);
    setCursor(initialPosts[initialPosts.length - 1].created_at);
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
        loadMore.current = false;
        setIsLoading(false);
        return;
      }
      console.log(data.posts);
      setPosts((prev) => [...prev, ...data.posts]);
      setCursor(data.posts[data.posts.length - 1].created_at);
      setIsLoading(false);
    };

    if (loadMore.current && inView) {
      getNextPosts();
    }
  }, [inView, cursor, loadMore, setPosts, setError]);

  if (!hasHydrated) {
    return (
      <>
        {initialPosts.map((post, index) => (
          <div key={index}>
            <PostSkeleton {...post} />
            <div className="border-t border-gray-300 my-5" />
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        {optimisticPosts.length === 0
          ? null
          : optimisticPosts.map((post) => (
              <div key={post.id}>
                <Post {...post} />
                <div className="border-t border-gray-300 my-5" />
              </div>
            ))}
      </div>
      <div ref={ref} />
      {isLoading && <Loader className="pb-4" />}
    </>
  );
}
