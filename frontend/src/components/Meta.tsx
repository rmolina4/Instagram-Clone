import { InteractionState, PostFormData } from "./CreatePostModal";
import { Dispatch, SetStateAction, useRef } from "react";
import Image from "next/image";
import { GetUsernamesResponse } from "@/utils/types";
import safeFetch from "@/utils/safeFetch";
import { Emoji } from "./Emoji";
import { useApp } from "@/utils/AppProvider";

import { FaRegUser } from "react-icons/fa";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineLocationOn } from "react-icons/md";

export default function Meta({
  interactionState,
  setInteractionState,
  postFormData,
  setPostFormData,
}: {
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  postFormData: PostFormData;
  setPostFormData: Dispatch<SetStateAction<PostFormData>>;
}) {
  const { user } = useApp();
  const locationInputRef = useRef<HTMLInputElement>(null);
  const collaboratorsInputRef = useRef<HTMLInputElement>(null);

  const handleCollaboratorsBlur = () => {
    setInteractionState((prev) => ({
      ...prev,
      addCollaboratorsVisible: false,
    }));
    setPostFormData((prev) => ({
      ...prev,
      collaborators: postFormData.collaborators.filter(
        (user) => user.collaborator
      ),
    }));
    if (collaboratorsInputRef.current) {
      collaboratorsInputRef.current.value = "";
    }
  };

  const handleSearchCollaborators = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.value.length == 0) return;
    const data = await safeFetch<GetUsernamesResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/user/search?prefix=${e.target.value}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!data.success) return;
    setPostFormData((prev) => ({
      ...prev,
      collaborators: [
        ...prev.collaborators,
        ...data.users
          .filter(
            (user) =>
              !prev.collaborators.some(
                (collaborator) => collaborator.id === user.id
              )
          )
          .map((user) => ({
            ...user,
            collaborator: false,
          })),
      ],
    }));
  };

  const handleCollaboratorsChange = (user: {
    id: string;
    username: string;
    name: string;
    collaborator: boolean;
  }) => {
    setPostFormData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.map((u) =>
        u.id === user.id
          ? {
              ...u,
              collaborator: !u.collaborator,
            }
          : u
      ),
    }));
  };

  const handleCollaboratorsDone = () => {
    setPostFormData((prev) => ({
      ...prev,
      collaborators: postFormData.collaborators.filter(
        (user) => user.collaborator
      ),
    }));
    setInteractionState((prev) => ({
      ...prev,
      addCollaboratorsVisible: false,
    }));
    if (collaboratorsInputRef.current) {
      collaboratorsInputRef.current.value = "";
      collaboratorsInputRef.current.blur();
    }
  };

  return (
    <>
      <div className="w-full flex items-center gap-3 px-4 py-2">
        <Image
          src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
          alt="pfp"
          width={28}
          height={28}
          unoptimized
          className="rounded-full"
        />
        <span className="font-bold">{user.username}</span>
      </div>
      <textarea
        className="w-full p-4 outline-none rounded-md min-h-[200px] resize-none flex-shrink-0"
        value={postFormData.body}
        maxLength={300}
        onChange={(e) =>
          setPostFormData((prev) => ({
            ...prev,
            body: e.target.value.slice(0, 300),
          }))
        }
      />
      <div className="relative px-4 py-2 flex justify-between border-b border-gray-300 dark:border-gray-700">
        <button
          onClick={() => {
            setInteractionState((prev) => ({
              ...prev,
              emojiPickerVisible: !prev.emojiPickerVisible,
            }));
          }}
        >
          <MdOutlineEmojiEmotions size={20} />
        </button>
        <span
          className={`${
            postFormData.body.length >= 300 ? "text-red-500" : "text-gray-500 "
          }`}
        >
          {postFormData.body.length}/300
        </span>
        {interactionState.emojiPickerVisible && (
          <Emoji
            setBody={(emoji) => {
              setPostFormData((prev) => ({
                ...prev,
                body: prev.body + emoji,
              }));
              setInteractionState((prev) => ({
                ...prev,
                emojiPickerVisible: false,
              }));
            }}
            className="bottom-[40px]"
          />
        )}
      </div>
      <div className="px-4 flex py-2">
        <input
          ref={locationInputRef}
          className="w-full outline-none text-md"
          placeholder="Add location"
          value={postFormData.location}
          onChange={(e) =>
            setPostFormData((prev) => ({
              ...prev,
              location: e.target.value,
            }))
          }
        />
        <button
          onClick={() => {
            if (postFormData.location.length == 0) {
              return locationInputRef.current?.focus();
            }
            setPostFormData((prev) => ({
              ...prev,
              location: "",
            }));
          }}
        >
          {postFormData.location.length == 0 ? (
            <MdOutlineLocationOn color="black" size={20} />
          ) : (
            <RxCross1 size={20} />
          )}
        </button>
      </div>
      <div className="px-4 flex py-2">
        <div className="w-full relative">
          <input
            ref={collaboratorsInputRef}
            className={`w-full outline-none text-md ${
              postFormData.collaborators.length > 0 &&
              !interactionState.addCollaboratorsVisible
                ? "placeholder:text-black placeholder:font-bold"
                : ""
            }`}
            placeholder={
              postFormData.collaborators.length == 0 ||
              interactionState.addCollaboratorsVisible
                ? "Add collaborators"
                : postFormData.collaborators.length == 1
                  ? postFormData.collaborators[0].username
                  : `${postFormData.collaborators.length} people`
            }
            onFocus={() => {
              setInteractionState((prev) => ({
                ...prev,
                addCollaboratorsVisible: true,
              }));
            }}
            onBlur={handleCollaboratorsBlur}
            onChange={handleSearchCollaborators}
          />
          {interactionState.addCollaboratorsVisible && (
            <div
              className="absolute bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] w-full h-[200px] mt-2 rounded-md overflow-y-auto"
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              {collaboratorsInputRef.current &&
              (collaboratorsInputRef.current.value?.length > 0 ||
                postFormData.collaborators.length > 0) ? (
                <>
                  <div className="flex flex-col h-[70%]">
                    {postFormData.collaborators.map((user) => (
                      <div
                        className="flex w-full px-4 py-2 gap-2 items-center"
                        key={user.id}
                      >
                        <Image
                          src="https://i.pinimg.com/474x/25/1c/e1/251ce139d8c07cbcc9daeca832851719.jpg"
                          alt="pfp"
                          width={28}
                          height={28}
                          unoptimized
                          className="rounded-full"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold">{user.username}</span>
                          <span className="text-xs text-gray-500">
                            {user.name}
                          </span>
                        </div>
                        <input
                          className="ml-auto hover:cursor-pointer"
                          type="checkbox"
                          checked={user.collaborator}
                          onChange={() => {
                            handleCollaboratorsChange(user);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center h-[30%]">
                    <button
                      className="font-bold w-[90%] bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-md"
                      onClick={handleCollaboratorsDone}
                    >
                      Done
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1 justify-center items-center h-full">
                  <FaRegUser size={20} />
                  <span className="text-sm font-medium">Add Collaborators</span>
                  <span className="text-xs text-gray-500 text-center px-6">
                    If they accept, their username will be added to the post. It
                    will be shared with their followers and shown on their
                    profile.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (postFormData.collaborators.length == 0) {
              return collaboratorsInputRef.current?.focus();
            }
            setPostFormData((prev) => ({
              ...prev,
              collaborators: [],
            }));
          }}
        >
          {postFormData.collaborators.length == 0 ? (
            <FaRegUser size={20} />
          ) : (
            <RxCross1 size={20} />
          )}
        </button>
      </div>
      <button
        onClick={() => {
          setInteractionState((prev) => ({
            ...prev,
            advancedSettingsVisible: !prev.advancedSettingsVisible,
          }));
        }}
        className={`hover:cursor-pointer flex items-center justify-between px-4 py-2 ${!interactionState.advancedSettingsVisible ? " border-b border-gray-300 dark:border-gray-700" : "font-bold"} text-md`}
      >
        Advanced settings
        {interactionState.advancedSettingsVisible ? (
          <MdOutlineKeyboardArrowUp size={20} />
        ) : (
          <MdOutlineKeyboardArrowDown size={20} />
        )}
      </button>
      {interactionState.advancedSettingsVisible && (
        <>
          <div className="px-4 py-2 flex flex-wrap">
            <span className="flex-1 break-words">
              Hide like and view counts on this post
            </span>
            <input
              className="w-5 h-5"
              type="checkbox"
              checked={postFormData.hideMetrics}
              onChange={(e) =>
                setPostFormData((prev) => ({
                  ...prev,
                  hideMetrics: e.target.checked,
                }))
              }
            />
          </div>
          <div className="px-4 py-2 flex flex-wrap">
            <span className="flex-1 break-words">Turn off commenting</span>
            <input
              className="w-5 h-5"
              type="checkbox"
              checked={postFormData.disableComments}
              onChange={(e) =>
                setPostFormData((prev) => ({
                  ...prev,
                  disableComments: e.target.checked,
                }))
              }
            />
          </div>
        </>
      )}
    </>
  );
}
