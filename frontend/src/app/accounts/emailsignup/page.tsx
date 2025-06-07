"use client";

import Link from "next/link";
import SignupForm from "@/components/SignupForm";
import Logo from "@/components/Logo";

export default function EmailSignup() {
  return (
    <div className="flex flex-col items-center min-h-screen justify-center">
      <div className="flex flex-col items-center border-1 border-gray-300 w-[350px] mb-[10px] py-[10px]">
        <Logo className="mt-9 mb-3 text-5xl flex justify-center" />
        <h2 className="text-center text-gray-500 font-semibold mx-10 mb-[10px]">
          Sign up to see photos and videos from your friends.
        </h2>
        <SignupForm />
      </div>
      <div className="flex flex-col items-center border-1 border-gray-300 w-[350px] py-[25px] leading-none">
        <p className="text-sm">Have an account?</p>
        <Link href="/accounts/login" className="text-blue-500 text-sm">
          Log in
        </Link>
      </div>
    </div>
  );
}
