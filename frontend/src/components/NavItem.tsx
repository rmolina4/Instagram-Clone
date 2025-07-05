"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { NavItem as NavItemType } from "./Navbar";

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
  isButton,
  onClick,
  popupOpen,
  childOpen,
  alignEnd,
}: NavItemProps) {
  const pathname = usePathname();
  return isButton ? (
    <div className={`${alignEnd ? "mt-auto" : ""}`}>
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
        {!popupOpen && (
          <span
            className={`hidden xl:block ${
              pathname === href ? "font-bold" : ""
            }`}
          >
            {label}
          </span>
        )}
      </button>
    </div>
  ) : (
    <Link href={href!} className={itemStyles} onClick={onClick}>
      <div className={iconContainerStyles}>
        {pathname === href && !popupOpen ? (
          typeof icon === "string" ? (
            <Image
              src={icon}
              alt={label}
              width={24}
              height={24}
              className="border-2 border-black dark:border-white rounded-full"
              unoptimized
            />
          ) : activeIcon ? (
            activeIcon({ size: 24 })
          ) : (
            icon({ size: 24 })
          )
        ) : typeof icon === "string" ? (
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
      {!popupOpen && (
        <span
          className={`hidden xl:block ${pathname === href ? "font-bold" : ""}`}
        >
          {label}
        </span>
      )}
    </Link>
  );
}
