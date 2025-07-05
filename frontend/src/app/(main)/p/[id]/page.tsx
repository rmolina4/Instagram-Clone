import PostView from "@/components/PostView";
import { getPost } from "@/utils/getData";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  return <PostView {...post} />;
}
