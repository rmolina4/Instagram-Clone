"use client";

import { Sidebar } from "@/components/Sidebar";
import { Post } from "@/components/Post";
import { Story } from "@/components/Story";
import { useEffect, useState } from "react";
import { PostProps } from "@/components/Post";

export default function Home() {
  const [posts, setPosts] = useState<PostProps[]>([]);
  useEffect(() => {
    const fetchPosts = async () => { 
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/next`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        console.log(data.posts);
        setPosts(data.posts);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="flex justify-center h-screen">
      <div className="flex flex-col items-center w-[630px]">
        <Story />
        <div className="flex flex-col gap-5">
          {posts.length === 0 ? (
            <div className="text-center text-gray-500">There are no posts.</div>
          ) : (
            posts.map((post, index) => (
              <div key={index}>
                <Post {...post} />
                <div className="border-t border-gray-300 my-5" />
              </div>
            ))
          )}
        </div>
      </div>
      <Sidebar className="hidden lg:block" />
    </div>
  );
}
