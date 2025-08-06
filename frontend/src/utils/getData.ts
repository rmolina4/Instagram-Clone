"use server";

import { cookies } from "next/headers";
import {
  GetMeResponse,
  GetNextPostsResponse,
  GetPostResponse,
  GetProfileResponse,
} from "./types";
import safeFetch from "./safeFetch";
import { notFound } from "next/navigation";

export const getUser = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const data = await safeFetch<GetMeResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/me`,
    {
      headers: {
        Cookie: cookieHeader,
      },
    }
  );
  return data.user;
};

export const getPosts = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const data = await safeFetch<GetNextPostsResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/post/next`,
    {
      headers: {
        Cookie: cookieHeader,
      },
    }
  );
  return data.posts;
};

export const getProfile = async (username: string) => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const data = await safeFetch<GetProfileResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/user/${username}/profile`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    }
  );
  return data.profile ? data.profile : notFound();
};

export const getPost = async (id: string) => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const data = await safeFetch<GetPostResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/post/${id}`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    }
  );
  return data.post;
};
