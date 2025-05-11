"use client";

import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import { FaRegCircleCheck } from "react-icons/fa6";

interface InputProps {
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  className?: string;
  validate?: () => Promise<string | null>;
  isPrivate?: boolean;
  showError?: boolean;
}

export default function Input({
  placeholder,
  value: externalValue,
  setValue: setExternalValue,
  className,
  validate,
  showError,
  isPrivate,
}: InputProps) {
  const [error, setError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [isBlurred, setIsBlurred] = useState<boolean>(false);
  const [showValue, setShowValue] = useState<boolean>(
    isPrivate == undefined ? true : !isPrivate
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExternalValue(e.target.value);
    if (!isTouched) {
      setIsTouched(true);
    }
    setIsBlurred(false);
  };
  const handleBlur = async () => {
    if (!isTouched) return;
    if (!validate) return setIsBlurred(true);
    const errorMessage = await validate();
    setError(errorMessage);
    setIsBlurred(true);
  };

  return (
    <div className="w-full">
      <div className={`relative flex justify-between items-center gap-2 ${className}`}>
        <input
          type={showValue ? "text" : "password"}
          value={externalValue}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          className={` left-2 w-full focus:outline-none placeholder:text-sm ${externalValue ? "top-0" : ""}`}
        />
        {error && isBlurred && showError && (
          <VscError className="text-red-500" />
        )}
        {showError && !error && isBlurred && (
          <FaRegCircleCheck className="text-gray-500" />
        )}
        {isPrivate && !showValue && externalValue && (
          <button
            className="hover:cursor-pointer"
            key="show"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowValue(true);
            }}
          >
            Show
          </button>
        )}
        {isPrivate && showValue && externalValue && (
          <button
            className="hover:cursor-pointer"
            key="hide"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowValue(false);
            }}
          >
            Hide
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
