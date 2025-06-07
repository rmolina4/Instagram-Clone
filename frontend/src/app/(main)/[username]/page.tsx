import { Profile } from "@/components/Profile";
import { cookies } from "next/headers";
import { redirectFetch } from "@/utils/safeFetch";
import { GetProfileResponse } from "@/utils/types";

const getProfile = async (username: string) => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const data = await redirectFetch<GetProfileResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/user/${username}/profile`,
    {
      headers: {
        Cookie: cookieHeader,
      },
    },
  );
  return data.profile;
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const profile = await getProfile((await params).username);
  return <Profile {...profile} />;
}
