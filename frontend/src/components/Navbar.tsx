"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useState } from "react";
import { useApp } from "@/utils/AppProvider";
import NavItem from "./NavItem";
import { IconType } from "react-icons";
import CreatePostModal from "./CreatePostModal";
import safeFetch from "@/utils/safeFetch";
import { APIResponse } from "@/utils/types";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import { MdOutlineSearch, MdExplore, MdOutlineExplore } from "react-icons/md";
import { GoHomeFill, GoHome } from "react-icons/go";
import { RiClapperboardFill, RiClapperboardLine } from "react-icons/ri";
import {
  AiFillMessage,
  AiOutlineMessage,
  AiOutlinePlusSquare,
} from "react-icons/ai";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaInstagram } from "react-icons/fa";
import { IoBookmarkOutline } from "react-icons/io5";

export interface NavItem {
  label: string;
  icon: IconType | string;
  isLink?: boolean;
  href?: string;
  activeIcon?: IconType;
  onClick?: () => void;
  childOpen?: boolean;
  className?: string;
}

export type Active = "search" | "notifications" | null;

interface InteractionState {
  active: Active;
  createPostModalVisible: boolean;
  optionsVisible: boolean;
}

const itemStyles =
  "w-full flex items-center hover:bg-gray-100 rounded-lg hover:cursor-pointer";
const iconContainerStyles =
  "w-[48px] h-[48px] min-w-[48px] flex justify-center items-center p-3";

export default function Navbar() {
  const [interactionState, setInteractionState] = useState<InteractionState>({
    active: null,
    createPostModalVisible: false,
    optionsVisible: false,
  });
  const { user, setError } = useApp();
  const router = useRouter();

  const closeAll = () => {
    setInteractionState((prev) => ({
      ...prev,
      active: null,
      optionsVisible: false,
    }));
  };

  const handleLogout = async () => {
    const data = await safeFetch<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!data.success)
      return setError({ message: data.message, status: data.status });
    router.push("/accounts/login");
  };

  const NavItems: NavItem[] = [
    {
      label: "Home",
      href: "/",
      icon: GoHome,
      activeIcon: GoHomeFill,
      isLink: true,
      onClick: closeAll,
    },
    {
      label: "Search",
      href: "/search",
      icon: MdOutlineSearch,
      activeIcon: MdOutlineSearch,
      onClick: () => {
        setInteractionState((prev) => ({
          ...prev,
          active: prev.active === "search" ? null : "search",
        }));
      },
      childOpen: interactionState.active === "search",
    },
    {
      label: "Explore",
      href: "/explore",
      icon: MdOutlineExplore,
      activeIcon: MdExplore,
      isLink: true,
      onClick: closeAll,
    },
    {
      label: "Reels",
      href: "/reels",
      icon: RiClapperboardLine,
      activeIcon: RiClapperboardFill,
      isLink: true,
      onClick: closeAll,
    },
    {
      label: "Inbox",
      href: "/direct/inbox",
      icon: AiOutlineMessage,
      activeIcon: AiFillMessage,
      isLink: true,
      onClick: closeAll,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: IoMdHeartEmpty,
      activeIcon: IoMdHeart,
      onClick: () => {
        setInteractionState((prev) => ({
          ...prev,
          active: prev.active === "notifications" ? null : "notifications",
        }));
      },
      childOpen: interactionState.active === "notifications",
    },
    {
      label: "Create",
      icon: AiOutlinePlusSquare,
      onClick: () => {
        setInteractionState((prev) => ({
          ...prev,
          createPostModalVisible: true,
        }));
      },
    },
    {
      label: "Profile",
      href: `/${user?.username}`,
      icon: "https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg",
      isLink: true,
      onClick: closeAll,
    },
    {
      label: "More",
      href: "/more",
      icon: RxHamburgerMenu,
      onClick: () => {
        setInteractionState((prev) => ({
          ...prev,
          optionsVisible: !prev.optionsVisible,
        }));
      },
      className: "mt-auto",
    },
  ];

  return (
    <>
      <nav className="fixed h-screen z-1">
        <div
          className={`absolute h-full w-[73px] ${
            interactionState.active != null ? "" : "xl:w-[245px]"
          } bg-white dark:bg-black border-r border-gray-300 dark:border-neutral-800 transition-[width] ease-in-out duration-300 pt-2 pb-5 px-3 gap-2 flex flex-col z-2 group`}
        >
          <div className="relative h-16">
            <Logo
              className={`absolute text-2xl opacity-0 ${
                interactionState.active != null ? "" : "xl:opacity-100 "
              } transition-opacity ease-in-out duration-300 pointer-events-none mt-6 pl-3`}
            />
            <Link
              href="/"
              className={`absolute opacity-100 ${itemStyles} ${
                interactionState.active != null ? "" : "xl:opacity-0 "
              } transition-opacity ease-in-out duration-300 mt-4`}
              onClick={closeAll}
            >
              <div className={iconContainerStyles}>
                <FaInstagram size={24} />
              </div>
            </Link>
          </div>
          <div className="flex flex-col flex-grow gap-2 mt-6 pb-4 relative z-2">
            {NavItems.map((item) => (
              <NavItem
                key={item.label}
                label={item.label}
                href={item.href || ""}
                icon={item.icon}
                activeIcon={item.activeIcon}
                popupOpen={interactionState.active != null}
                isLink={item.isLink}
                onClick={item.onClick}
                childOpen={item.childOpen}
                className={item.className}
              />
            ))}
            {interactionState.optionsVisible && (
              <div className="absolute w-[270px] flex flex-col text-sm shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] bg-white dark:bg-neutral-800 rounded-xl bottom-[80px]">
                <div className="p-1">
                  <button className="w-full flex items-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg">
                    <IoBookmarkOutline size={20} />
                    Saved
                  </button>
                </div>
                <div className="border-t border-gray-100 dark:border-neutral-700" />
                <div className="p-1">
                  <button className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg">
                    Switch accounts
                  </button>
                </div>
                <div className="border-t border-gray-100 dark:border-neutral-700" />
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <AnimatePresence>
          {interactionState.active === "search" && (
            <motion.div
              initial={{ left: "-400px" }}
              animate={{
                left: "73px",
              }}
              exit={{ left: "-400px" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute h-full bg-white dark:bg-black w-[400px] rounded-r-3xl shadow-[2px_0_10px_-3px_rgba(0,0,0,0.4)] dark:border-r dark:border-neutral-800 flex flex-col"
            >
              <h1 className="text-2xl font-bold">Search</h1>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {interactionState.active === "notifications" && (
            <motion.div
              initial={{ left: "-400px" }}
              animate={{
                left: "73px",
              }}
              exit={{ left: "-400px" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute h-full bg-white dark:bg-black w-[400px] rounded-r-3xl shadow-[2px_0_10px_-3px_rgba(0,0,0,0.4)] dark:border-r dark:border-neutral-800"
            >
              <h1 className="text-2xl font-bold">Notifications</h1>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {interactionState.createPostModalVisible && (
        <CreatePostModal
          setCreatePostModalVisible={() => {
            setInteractionState((prev) => ({
              ...prev,
              createPostModalVisible: false,
            }));
          }}
        />
      )}
    </>
  );
}
