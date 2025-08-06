"use client";

import { Post, User, Profile } from "@/utils/types";
import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";

interface AppContextType {
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  profile: Profile | null;
  setProfile: Dispatch<SetStateAction<Profile | null>>;
  error: { message: string; status: number } | null;
  setError: Dispatch<
    SetStateAction<{ message: string; status: number } | null>
  >;
}

const AppContext = createContext<AppContextType>({
  posts: [],
  setPosts: () => {},
  user: {
    username: "",
    name: "",
    id: "",
    email: "",
  },
  setUser: () => {},
  profile: null,
  setProfile: () => {},
  error: null,
  setError: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

export default function AppProvider({
  children,
  user: initialUser,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [user, setUser] = useState<User>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<{
    message: string;
    status: number;
  } | null>(null);

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        posts,
        setPosts,
        setUser,
        setProfile,
        error,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
