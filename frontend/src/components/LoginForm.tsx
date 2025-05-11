"use client";

import { FaGoogle } from "react-icons/fa";
import Divider from "./Divider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "./Input";
import { Loader } from "./Loader";
import Button from "./Button";

interface FormData {
  identifier: string;
  password: string;
}

const initialFormData: FormData = {
  identifier: "",
  password: "",
};

const inputStyles =
  "w-full bg-gray-100 rounded-sm border-1 border-gray-200 p-[7px] placeholder:text-sm";

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetch(`http://localhost:8080/login`, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          setError(res.statusText);
        }
        router.push("/");
      })
      .catch(() => {
        setError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      });
  };

  return (
    <div className="flex flex-col w-full mt-6">
      <form className="flex flex-col gap-2 px-10" onSubmit={handleSubmit}>
        <Input
          placeholder="Mobile Number or Email"
          className={inputStyles}
          value={formData.identifier}
          setValue={handleInputChange("identifier")}
        />
        <Input
          placeholder="Password"
          className={inputStyles}
          value={formData.password}
          setValue={handleInputChange("password")}
          isPrivate={true}
        />
        {isLoading ? (
          <Loader />
        ) : (
          <Button
            type="submit"
            disabled={
              formData.identifier === "" || formData.password.length < 6
            }
            className={`bg-blue-500 text-white mt-2 mb-2 p-1 ${
              formData.identifier === "" || formData.password.length < 6
                ? "opacity-50"
                : "hover:cursor-pointer hover:bg-blue-600"
            }`}
          >
            Log in
          </Button>
        )}
        {error && (
          <p className="text-red-500 text-center text-xs mt-2 mb-2">{error}</p>
        )}
      </form>
      <Divider className="mt-[14px] mb-[22px] mx-10"/>
      <Button
        className="text-blue-500 hover:cursor-pointer mt-2 mb-2`"
        onClick={() => {}}
      >
        <FaGoogle />
        Log in with Google
      </Button>
    </div>
  );
}
