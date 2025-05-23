import { useRouter } from "next/navigation";
import { CiBookmark } from "react-icons/ci";

export default function OptionsMenu() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: "POST", 
        credentials: "include",
      });
    } catch {
      router.push("/500");
    }
    router.push("/accounts/login");
  }

  return (
    <div className="absolute bottom-full mb-2 w-[270px] flex flex-col text-sm shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] bg-white rounded-xl">
      <div className="p-1">
        <button className="w-full flex items-center gap-2 p-3 hover:bg-gray-100 rounded-lg">
          <CiBookmark size={20} />
          Saved
        </button>
      </div>
      <div className="border-t border-gray-100" />
      <div className="p-1">
        <button className="w-full flex items-center p-3 hover:bg-gray-100 rounded-lg">
          Switch accounts
        </button>
      </div>
      <div className="border-t border-gray-100" />
      <div className="p-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 hover:bg-gray-100 rounded-lg"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
