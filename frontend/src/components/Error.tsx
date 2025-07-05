"use client";

import { useApp } from "@/utils/AppProvider";

export default function Error({ children }: { children: React.ReactNode }) {
  const { error, setError } = useApp();

  return error ? (
    <div className="text-sm flex gap-5 justify-center items-center h-screen">
      <span className="text-2xl font-medium">{error.status}</span>
      <span className="w-px h-14 bg-gray-400" />
      <span>
        {error.message}.{" "}
        <button
          className="text-blue-500 hover:cursor-pointer hover:underline"
          onClick={() => setError(null)}
        >
          Try again!
        </button>
      </span>
    </div>
  ) : (
    children
  );
}
