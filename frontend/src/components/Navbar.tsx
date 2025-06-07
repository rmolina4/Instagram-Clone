"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import { NavItem } from "./NavItem";
import { IconType } from "react-icons";
import OptionsMenu from "./OptionsMenu";
import CreatePostModal from "./CreatePostModal";

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

export interface NavItem {
  label: string;
  href?: string;
  icon: IconType | string;
  activeIcon?: IconType;
  isButton: boolean;
  onClick?: () => void;
  alignEnd?: boolean;
  childOpen?: boolean;
}

const itemStyles =
  "w-full flex items-center hover:bg-gray-100 rounded-lg hover:cursor-pointer";
const iconContainerStyles =
  "w-[48px] h-[48px] min-w-[48px] flex justify-center items-center p-3";

export default function Navbar() {
  const [searchVisible, setSearchVisible] = useState<boolean>(false);
  const [notificationsVisible, setNotificationsVisible] = useState<boolean>(false);
  const [createPostModalVisible, setCreatePostModalVisible] = useState<boolean>(false);
  const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
  const { user } = useContext(AuthContext);

  const NavItems: NavItem[] = [
    {
      label: "Home",
      href: "/",
      icon: GoHome,
      activeIcon: GoHomeFill,
      isButton: false,
      onClick: () => {
        setSearchVisible(false);
        setNotificationsVisible(false);
        setCreatePostModalVisible(false);
        setOptionsVisible(false);
      },
    },
    {
      label: "Search",
      href: "/search",
      icon: MdOutlineSearch,
      activeIcon: MdOutlineSearch,
      isButton: true,
      onClick: () => {
        setNotificationsVisible(false);
        setCreatePostModalVisible(false);
        setOptionsVisible(false);
        setSearchVisible(!searchVisible);
      },
      childOpen: searchVisible,
    },
    {
      label: "Explore",
      href: "/explore",
      icon: MdOutlineExplore,
      activeIcon: MdExplore,
      isButton: false,
      onClick: () => {
        setSearchVisible(false);
        setNotificationsVisible(false);
        setCreatePostModalVisible(false);
        setOptionsVisible(false);
      },
    },
    {
      label: "Reels",
      href: "/reels",
      icon: RiClapperboardLine,
      activeIcon: RiClapperboardFill,
      isButton: false,
      onClick: () => {
        setSearchVisible(false);
        setNotificationsVisible(false);
        setCreatePostModalVisible(false);
        setOptionsVisible(false);
      },
    },
    {
      label: "Inbox",
      href: "/direct/inbox",
      icon: AiOutlineMessage,
      activeIcon: AiFillMessage,
      isButton: false,
      onClick: () => {
        setSearchVisible(false);
        setNotificationsVisible(false);
        setCreatePostModalVisible(false);
        setOptionsVisible(false);
      },
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: IoMdHeartEmpty,
      activeIcon: IoMdHeart,
      isButton: true,
      onClick: () => {
        setSearchVisible(false);
        setCreatePostModalVisible(false);
        setOptionsVisible(false);
        setNotificationsVisible(!notificationsVisible);
      },
      childOpen: notificationsVisible,
    },
    {
      label: "Create",
      icon: AiOutlinePlusSquare,
      isButton: true,
      onClick: () => {
        setCreatePostModalVisible(true);
      },
    },
    {
      label: "Profile",
      href: `/${user?.username}`,
      icon: "https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg",
      isButton: false,
    },
    {
      label: "More",
      href: "/more",
      icon: RxHamburgerMenu,
      isButton: true,
      onClick: () => {
        setOptionsVisible(!optionsVisible);
      },
      alignEnd: true,
    },
  ];

  return (
    <nav className="fixed h-screen">
      <div
        className={`absolute h-full w-[73px] ${
          searchVisible || notificationsVisible ? "" : "xl:w-[245px]"
        } z-20 bg-white border-r border-gray-300 transition-[width] ease-in-out duration-300 pt-2 pb-5 px-3 gap-2 flex flex-col`}
      >
        <div className="relative h-16">
          <Logo
            className={`absolute text-2xl opacity-0 ${
              searchVisible || notificationsVisible ? "" : "xl:opacity-100 "
            } transition-opacity ease-in-out duration-300 pointer-events-none mt-6 pl-3`}
          />
          <Link
            href="/"
            className={`absolute opacity-100 ${itemStyles} ${
              searchVisible || notificationsVisible ? "" : "xl:opacity-0 "
            } transition-opacity ease-in-out duration-300 mt-4`}
            onClick={() => {
              setSearchVisible(false);
              setNotificationsVisible(false);
              setCreatePostModalVisible(false);
              setOptionsVisible(false);
            }}
          >
            <div className={iconContainerStyles}>
              <FaInstagram size={24} />
            </div>
          </Link>
        </div>
        <div className="flex flex-col flex-grow gap-2 mt-6 pb-4 relative">
          {NavItems.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              href={item.href || ""}
              icon={item.icon}
              activeIcon={item.activeIcon}
              popupOpen={searchVisible || notificationsVisible}
              isButton={item.isButton}
              onClick={item.onClick}
              childOpen={item.childOpen}
              alignEnd={item.alignEnd}
            />
          ))}
          {optionsVisible && (
            <div className="absolute bottom-[80px]">
              <OptionsMenu />
            </div>
          )}
          {createPostModalVisible && <CreatePostModal setCreatePostModalVisible={setCreatePostModalVisible} />}
        </div>
      </div>
      <div
        className={`absolute h-full z-10 bg-white w-[400px] rounded-r-3xl shadow-[2px_0_10px_-3px_rgba(0,0,0,0.4)] ${
          searchVisible ? "left-[73px]" : "left-[-400px]"
        } transition-[left] ease-in-out duration-300`}
      >
        Search
      </div>
      <div
        className={`absolute h-full z-10 bg-white w-[400px] rounded-r-3xl shadow-[2px_0_10px_-3px_rgba(0,0,0,0.4)] ${
          notificationsVisible ? "left-[73px]" : "left-[-400px]"
        } transition-[left] ease-in-out duration-300`}
      >
        Notifications
      </div>
    </nav>
  );
}
