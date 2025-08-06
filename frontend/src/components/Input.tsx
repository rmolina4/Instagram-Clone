"use client";

import { useState } from "react";
import { APIResponse } from "@/utils/types";

import { VscError } from "react-icons/vsc";
import { FaRegCircleCheck } from "react-icons/fa6";

interface InputProps {
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  validate?: () => Promise<APIResponse>;
  isPrivate?: boolean;
  showError?: boolean;
  name: string;
}

export default function Input({
  placeholder,
  value,
  setValue,
  validate,
  showError,
  isPrivate,
  name,
}: InputProps) {
  const [error, setError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [isBlurred, setIsBlurred] = useState<boolean>(false);
  const [showValue, setShowValue] = useState<boolean>(
    isPrivate == undefined ? true : !isPrivate
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsTouched(true);
    setIsBlurred(false);
  };

  const handleBlur = async () => {
    if (!isTouched) return;
    if (validate) {
      const result = await validate();
      setError(result.success ? null : result.message);
    }
    setIsBlurred(true);
  };

  return (
    <div className="w-full">
      <div
        className={`flex bg-gray-100 rounded-sm border-1 justify-between items-center gap-2 p-[7px] ${
          error ? "border-red-500" : "border-gray-200"
        }`}
      >
        <input
          type={showValue ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full outline-none placeholder:text-sm`}
          name={name}
        />
        {error && isBlurred && showError && (
          <VscError className="text-red-500" />
        )}
        {showError && !error && isBlurred && (
          <FaRegCircleCheck className="text-gray-500" />
        )}
        {isPrivate && (
          <button
            type="button"
            className="hover:cursor-pointer"
            onClick={() => {
              setShowValue(!showValue);
            }}
          >
            {showValue ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && isBlurred && showError && (
        <p className="text-red-500 text-center text-xs mx-10 mt-2 mb-2">
          {error}
        </p>
      )}
    </div>
  );
}
