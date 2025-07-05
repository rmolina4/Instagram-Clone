"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="text-sm flex gap-5 justify-center items-center h-screen">
      <span className="text-2xl font-medium">500</span>
      <span className="w-px h-14 bg-gray-400" />
      <span>
        {error.message}.{" "}
        <button
          className="text-blue-500 hover:cursor-pointer hover:underline"
          onClick={() => reset()}
        >
          Try again!
        </button>
      </span>
    </div>
  );
}
