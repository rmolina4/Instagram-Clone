"use client";

import { FaGoogle } from "react-icons/fa";
import Divider from "./Divider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "./Input";
import { validateEmail, validatePassword, validateUsername } from "../utils/validation";

interface FormData {
  email: string;
  password: string;
  fullName: string;
  username: string;
}

const initialFormData: FormData = {
  email: "",
  password: "",
  fullName: "",
  username: "",
};

export default function SignupForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8080/register`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      router.push("/");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const inputStyles = "w-full bg-gray-100 rounded-sm border-1 border-gray-200 p-[7px] placeholder:text-sm";
  const buttonStyles = "flex items-center justify-center gap-2 bg-blue-500 text-white rounded-lg w-full p-1 my-2";

  return (
    <div>
      <div className="mx-10 my-2">
        <button
          className={buttonStyles}
          onClick={() => {}}
        >
          <FaGoogle />
          <span>Log in with Google</span>
        </button>
      </div>
      <Divider />
      <form className="flex flex-col gap-2 px-10" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Mobile Number or Email"
          className={inputStyles}
          value={formData.email}
          setValue={handleInputChange("email")}
          validate={() => validateEmail(formData.email)}
        />
        <Input
          type="text"
          placeholder="Password"
          className={inputStyles}
          value={formData.password}
          setValue={handleInputChange("password")}
          validate={() => validatePassword(formData.password)}
        />
        <Input
          type="text"
          placeholder="Full Name"
          className={inputStyles}
          value={formData.fullName}
          setValue={handleInputChange("fullName")}
        />
        <Input
          type="text"
          placeholder="Username"
          className={inputStyles}
          value={formData.username}
          setValue={handleInputChange("username")}
          validate={() => validateUsername(formData.username)}
        />
        <p className="text-center text-xs text-gray-600 my-[6px]">
          By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
        </p>
        <button
          type="submit"
          disabled={formData.email === "" || formData.password === "" || formData.username === ""}
          className={`${buttonStyles} ${formData.email === "" || formData.password === "" || formData.username === "" ? "opacity-50" : ""}`}
        >
          Sign up
        </button>
        {error && (
          <p className="text-red-500 text-center text-xs my-2">{error}</p>
        )}
      </form>
    </div>
  );
}
