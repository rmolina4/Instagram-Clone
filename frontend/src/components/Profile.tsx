"use client";

import { useState } from "react";
import Image from "next/image";
import { Profile as ProfileProps } from "@/utils/types";
import { Post as PostProps } from "@/utils/types";

export const Profile = ({
}: ProfileProps) => {
  const [posts, setPosts] = useState<PostProps[]>([]);
  return (
    <>
      <div className="grid grid-cols-3">
        {posts.map((post) => (
          <Image
            key={post.id}
            src={post.media_urls[0]}
            alt={post.caption}
            fill
            className="object-cover"
          />
        ))}

      </div>
    </>
  );
};
