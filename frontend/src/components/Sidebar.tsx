"use client";

import { useApp } from "@/utils/AppProvider";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
  const { user } = useApp();
  return (
    <div className="flex flex-col mt-9 pl-16 hidden lg:block">
      <div className="flex items-center gap-2 w-[320px] px-4">
        <Link href={`/${user.username}`}>
          <Image
            src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
            alt="pfp"
            width={45}
            height={45}
            unoptimized
            className="rounded-full"
          />
        </Link>
        <div className="flex flex-col">
          <Link
            href={`/${user.username}`}
            className="text-sm font-bold leading-none"
          >
            {user.username}
          </Link>
          <p className="text-xs text-gray-500 leading-none">{user.name}</p>
        </div>
        <button className="ml-auto text-xs text-blue-500 hover:cursor-pointer">
          Switch
        </button>
      </div>
      <div className="flex my-5 px-4">
        <span className="text-gray-500 text-sm font-bold">
          Suggested for you
        </span>
        <button className="ml-auto text-xs font-bold hover:cursor-pointer">
          See all
        </button>
      </div>
      <div className="flex items-center gap-2 px-4">
        <Link href={`/`}>
          <Image
            src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
            alt="pfp"
            width={45}
            height={45}
            unoptimized
            className="rounded-full"
          />
        </Link>
        <div className="flex flex-col">
          <Link href={`/`} className="text-sm font-bold leading-none">
            John Doe
          </Link>
          <p className="text-xs text-gray-500 leading-none">
            Suggested for you
          </p>
        </div>
        <button className="text-xs ml-auto text-blue-500 hover:cursor-pointer">
          Follow
        </button>
      </div>
    </div>
  );
}
