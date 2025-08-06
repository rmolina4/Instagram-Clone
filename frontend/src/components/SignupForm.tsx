"use client";

import Divider from "./Divider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "./Input";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../utils/validation";
import Loader from "./Loader";
import safeFetch from "@/utils/safeFetch";
import { FaGoogle } from "react-icons/fa";
import { APIResponse } from "@/utils/types";

interface RegisterFormData {
  email: string;
  password: string;
  fullName: string;
  username: string;
}

export default function SignupForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    fullName: "",
    username: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleInputChange =
    (field: keyof RegisterFormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const onSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/register`,
      {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          username: formData.username,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (data.success) {
      return router.push("/");
    }
    setError(data.message!);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="mx-10 mt-2 mb-2">
        <button className="w-full flex gap-2 bg-blue-500 text-white hover:cursor-pointer hover:bg-blue-600 p-1 items-center justify-center rounded-lg">
          <FaGoogle />
          Log in with Google
        </button>
      </div>
      <Divider className="mt-[10px] mb-[18px] mx-10" />
      <form className="flex flex-col gap-2 px-10" onSubmit={onSignup}>
        <Input
          placeholder="Mobile Number or Email"
          value={formData.email}
          setValue={handleInputChange("email")}
          validate={() => validateEmail(formData.email)}
          showError={true}
          name="email"
        />
        <Input
          placeholder="Password"
          value={formData.password}
          setValue={handleInputChange("password")}
          validate={() => validatePassword(formData.password)}
          isPrivate={true}
          showError={true}
          name="password"
        />
        <Input
          placeholder="Full Name"
          value={formData.fullName}
          setValue={handleInputChange("fullName")}
          showError={true}
          name="fullName"
        />
        <Input
          placeholder="Username"
          value={formData.username}
          setValue={handleInputChange("username")}
          validate={() => validateUsername(formData.username)}
          showError={true}
          name="username"
        />
        <p className="text-center text-xs text-gray-600 mt-[10px] mb-[6px]">
          By signing up, you agree to our Terms, Privacy Policy and Cookies
          Policy.
        </p>
        {isLoading ? (
          <Loader />
        ) : (
          <button
            type="submit"
            disabled={
              formData.email === "" ||
              formData.username === "" ||
              formData.password.length < 6
            }
            className={`w-full flex gap-2 bg-blue-500 text-white mt-2 mb-2 p-1 items-center justify-center rounded-lg ${
              formData.email === "" ||
              formData.username === "" ||
              formData.password.length < 6
                ? "opacity-50"
                : "hover:cursor-pointer hover:bg-blue-600"
            }`}
          >
            Sign up
          </button>
        )}
        {error && (
          <p className="text-red-500 text-center text-xs mt-2 mb-2">{error}</p>
        )}
      </form>
    </div>
  );
}
