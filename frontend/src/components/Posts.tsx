"use client";

import { useEffect, useRef, useState } from "react";
import Post from "./Post";
import { useApp } from "@/utils/AppProvider";
import safeFetch from "@/utils/safeFetch";
import { GetNextPostsResponse, Post as PostProps } from "@/utils/types";
import Loader from "./Loader";
import { useInView } from "@/utils/hooks";
import { timeAgo } from "@/utils/time";

export default function Posts({ initialPosts }: { initialPosts: PostProps[] }) {
  const { setPosts, posts, setError } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const loadMore = useRef(true);
  const ref = useRef(null);
  const isInView = useInView(ref);
  let cursor = posts[posts.length - 1]?.created_at || null;

  useEffect(() => {
    if (initialPosts.length == 0) {
      loadMore.current = false;
    } else {
      setPosts(initialPosts);
      cursor = initialPosts[initialPosts.length - 1].created_at;
    }
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
      {posts.length === 0 && initialPosts.length === 0 && (
        <div className="text-center text-gray-500">No posts found</div>
      )}
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

const estimateTextWidth = (text: string, fontSize: number): number => {
  return Math.floor(text.length * 0.52 * fontSize);
};

const PostSkeleton = (props: PostProps) => {
  return (
    <div className="w-[468px] flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="w-[30px] h-[30px] rounded-full bg-gray-200" />
        <div className="flex gap-1">
          <div
            className="bg-gray-200 rounded"
            style={{
              width: `${estimateTextWidth(props.username + " ", 14)}px`,
            }}
          />
          <div
            className="h-4 bg-gray-200 rounded"
            style={{
              width: `${estimateTextWidth(timeAgo(props.created_at), 14)}px`,
            }}
          />
          {!props.followed_by_me && (
            <div
              className="h-4 bg-gray-200 rounded"
              style={{
                width: `${estimateTextWidth("Follow", 14)}px`,
              }}
            />
          )}
        </div>
        <div className="ml-auto w-4 h-4 bg-gray-200 rounded" />
      </div>
      <div className="w-full h-[585px] relative bg-gray-200" />
      <div className="flex flex-col gap-2">
        <div className="w-full flex gap-3 items-center">
          <div className="w-6 h-[25px] bg-gray-200 rounded" />
          <div className="w-6 h-[25px] bg-gray-200 rounded" />
          <div className="ml-auto w-6 h-[25px] bg-gray-200 rounded" />
        </div>
        <div
          className="h-4 bg-gray-200 rounded"
          style={{
            width: `${estimateTextWidth(`${props.like_count} likes`, 14)}px`,
          }}
        />
        <div className="flex gap-1">
          <div
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${estimateTextWidth(props.username, 14)}px` }}
          />
          {props.body && (
            <div
              className="h-4 bg-gray-200 rounded"
              style={{ width: `${estimateTextWidth(props.body, 14)}px` }}
            />
          )}
        </div>
        {props.comments.length > 0 && (
          <div
            className="h-4 bg-gray-200 rounded"
            style={{
              width: `${estimateTextWidth(`View all ${props.comments.length} comments`, 14)}px`,
            }}
          />
        )}
        <div
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${estimateTextWidth("Add a comment...", 14)}px` }}
        />
      </div>
    </div>
  );
};
