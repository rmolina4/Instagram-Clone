"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { NavItem as NavItemType } from "./Navbar";
import { AnimatePresence, motion } from "motion/react";

const itemStyles =
  "w-full flex items-center hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg hover:cursor-pointer";
const iconContainerStyles =
  "w-[48px] h-[48px] min-w-[48px] flex justify-center items-center p-3 rounded-md";

interface NavItemProps extends NavItemType {
  popupOpen: boolean;
}

export default function NavItem({
  label,
  href,
  icon,
  activeIcon,
  isLink,
  onClick,
  popupOpen,
  childOpen,
  className,
}: NavItemProps) {
  const pathname = usePathname();
  return !isLink ? (
    <div className={className}>
      <button className={itemStyles} onClick={onClick}>
        <div
          className={`${iconContainerStyles} ${
            childOpen ? "border border-gray-300" : ""
          }`}
        >
          {typeof icon === "string" ? (
            <Image
              src={icon}
              alt={label}
              width={24}
              height={24}
              className="rounded-full"
              unoptimized
            />
          ) : (
            icon({ size: 24 })
          )}
        </div>
        <AnimatePresence>
          {!popupOpen && (
            <motion.span
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              className={`hidden xl:block ml-4 ${pathname === href ? "font-bold" : ""}`}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  ) : (
    <Link href={href!} className={itemStyles} onClick={onClick}>
      <div className={iconContainerStyles}>
        {typeof icon === "string" ? (
          <Image
            src={icon}
            alt={label}
            width={24}
            height={24}
            className={`rounded-full ${
              pathname === href ? "border-2 border-black dark:border-white" : ""
            }`}
            unoptimized
          />
        ) : (
          (pathname == href && activeIcon?.({ size: 24 })) || icon({ size: 24 })
        )}
      </div>
      <AnimatePresence>
        {!popupOpen && (
          <motion.span
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className={`hidden xl:block ml-4 ${pathname === href ? "font-bold" : ""}`}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
