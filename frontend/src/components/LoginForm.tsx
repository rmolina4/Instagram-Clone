"use client";

import { FaGoogle } from "react-icons/fa";
import Divider from "./Divider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "./Input";
import { Loader } from "./Loader";
import safeFetch from "@/utils/safeFetch";
import { APIResponse } from "@/utils/types";

interface LoginFormData {
  identifier: string;
  password: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleInputChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/login`,
      {
        method: "POST",
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    if (data!.success) {
      return router.push("/");
    }
    setError(data!.message!);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col w-full mt-6">
      <form className="flex flex-col gap-2 px-10" onSubmit={onSubmit}>
        <Input
          placeholder="Mobile Number or Email"
          value={formData.identifier}
          setValue={handleInputChange("identifier")}
          name="identifier"
        />
        <Input
          placeholder="Password"
          value={formData.password}
          setValue={handleInputChange("password")}
          isPrivate={true}
          name="password"
        />
        {isLoading ? (
          <Loader />
        ) : (
          <button
            type="submit"
            disabled={
              formData.identifier === "" || formData.password.length < 6
            }
            className={`w-full flex gap-2 bg-blue-500 text-white mt-2 mb-2 p-1 items-center justify-center rounded-lg ${
              formData.identifier === "" || formData.password.length < 6
                ? "opacity-50"
                : "hover:cursor-pointer hover:bg-blue-600"
            }`}
          >
            Log in
          </button>
        )}
        {error && (
          <p className="text-red-500 text-center text-xs mt-2 mb-2">{error}</p>
        )}
      </form>
      <Divider className="mt-[14px] mb-[22px] mx-10" />
      <button
        className="w-full flex gap-2 text-blue-500 hover:cursor-pointer mt-2 mb-2 items-center justify-center rounded-lg"
        onClick={() => {}}
      >
        <FaGoogle />
        Log in with Google
      </button>
    </div>
  );
}
