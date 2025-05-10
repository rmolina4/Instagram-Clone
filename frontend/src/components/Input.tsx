"use client";

import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import { FaRegCircleCheck } from "react-icons/fa6";

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  className: string;
  validate?: () => Promise<string | null>;
}

export default function Input({
  type,
  placeholder,
  value: externalValue,
  setValue: setExternalValue,
  className,
  validate,
}: InputProps) {
  const [error, setError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

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
      <div
        className={`flex justify-between items-center gap-2 ${className}`}
      >
        <input
          type={type}
          placeholder={placeholder}
          value={externalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full focus:outline-none"
        />
        {error && isBlurred && <VscError className="text-red-500" />}
        {!error && isBlurred && (
          <FaRegCircleCheck className="text-gray-500" />
        )}
      </div>
      {error && isBlurred && (
        <p className="text-red-500 text-center text-xs mx-10 my-2">{error}</p>
      )}
    </div>
  );
}
