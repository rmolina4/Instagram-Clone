import { Sidebar } from "@/components/Sidebar";
import { Story } from "@/components/Story";
import { Posts } from "@/components/Posts";
import { cookies } from "next/headers";
import { redirectFetch } from "@/utils/safeFetch";
import { GetNextPostsResponse } from "@/utils/types";

const getInitialPosts = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const data = await redirectFetch<GetNextPostsResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/post/next`,
    {
      headers: {
        Cookie: cookieHeader,
      },
    },
  );
  return data.posts;
};

export default async function Home() {
  const initialPosts = await getInitialPosts();
  return (
    <div className="flex justify-center h-screen">
      <div className="flex flex-col items-center w-[630px]">
        <Story />
        <Posts initialPosts={initialPosts} />
      </div>
      <Sidebar className="hidden lg:block" />
    </div>
  );
}
