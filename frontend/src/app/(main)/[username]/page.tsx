import ProfileView from "@/components/ProfileView";
import { getProfile } from "@/utils/getData";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfile(username);
  return <ProfileView {...profile} />;
}
