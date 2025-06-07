"use server";

import { cookies } from "next/headers";
import safeFetch from "./safeFetch";
import { GetMeResponse } from "@/utils/types";

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
  return data.account;
};