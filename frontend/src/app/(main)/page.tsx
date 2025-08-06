import Sidebar from "@/components/SuggestionsBar";
import Story from "@/components/Story";
import Posts from "@/components/Posts";
import { getPosts } from "@/utils/getData";

export default async function Home() {
  const posts = await getPosts();
  return (
    <div className="flex justify-center h-screen">
      <div className="flex flex-col items-center w-[630px]">
        <Story />
        <Posts initialPosts={posts} />
      </div>
      <Sidebar />
    </div>
  );
}
