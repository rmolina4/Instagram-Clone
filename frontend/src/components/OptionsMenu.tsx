import { useEffect } from "react";
import Link from "next/link";

export interface OptionsMenuItem {
  label: string;
  href?: string;
  isLink?: boolean;
  onClick?: () => void | Promise<void>;
  red?: boolean;
}

export default function OptionsMenu({
  items,
  setOptionsVisible,
}: {
  items: OptionsMenuItem[];
  setOptionsVisible: (visible: boolean) => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "scroll";
    };
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black opacity-60 z-4`}
        onClick={() => {
          setOptionsVisible(false);
        }}
      ></div>
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-800 shadow-md w-[400px] rounded-xl flex flex-col text-sm z-4`}
      >
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
              onClick={() => {
                setOptionsVisible(false);
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
