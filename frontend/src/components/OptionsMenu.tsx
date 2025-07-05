import { Dispatch, SetStateAction } from "react";
import Link from "next/link";

interface InteractionState {
  optionsVisible: boolean;
}

export interface OptionsMenuItem {
  label: string;
  href?: string;
  isLink?: boolean;
  onClick?: () => void | Promise<void>;
  red?: boolean;
}

export default function OptionsMenu<T extends InteractionState>({
  setInteractionState,
  items,
  field,
}: {
  setInteractionState: Dispatch<SetStateAction<T>>;
  items: OptionsMenuItem[];
  field?: keyof T;
}) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 opacity-60 z-3"
        onClick={(e) => {
          e.preventDefault();
          setInteractionState((prev) => ({
            ...prev,
            [field ?? "optionsVisible"]: false,
          }));
        }}
      ></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-800 shadow-md w-[400px] rounded-xl flex flex-col z-3 text-sm">
        {items.map((item, index) =>
          item.isLink ? (
            <Link
              key={item.label}
              href={item.href || ""}
              className={`w-full flex justify-center p-3 hover:cursor-pointer dark:border-neutral-700 ${index !== items.length - 1 ? " border-b border-gray-200" : ""}`}
            >
              {item.label}
            </Link>
          ) : (
            <button
              key={item.label}
              onClick={(e) => {
                e.preventDefault();
                item.onClick?.();
              }}
              className={`w-full p-3 hover:cursor-pointer dark:border-neutral-700 ${
                item.red ? "font-bold text-red-500" : ""
              } ${index !== items.length - 1 ? "border-b border-gray-200" : ""}`}
            >
              {item.label}
            </button>
          )
        )}
      </div>
    </>
  );
}
