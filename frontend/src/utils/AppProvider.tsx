"use client";

import { Post, Account, Profile } from "@/utils/types";
import {
  createContext,
  useState,
  useOptimistic,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";

interface AppContextType {
  posts: Post[];
  optimisticPosts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  setOptimisticPosts: Dispatch<SetStateAction<Post[]>>;
  user: Account;
  setUser: Dispatch<SetStateAction<Account>>;
  profile: Profile | null;
  setProfile: Dispatch<SetStateAction<Profile | null>>;
  error: { message: string; status: number } | null;
  setError: Dispatch<
    SetStateAction<{ message: string; status: number } | null>
  >;
}

export const AppContext = createContext<AppContextType>({
  posts: [],
  optimisticPosts: [],
  setPosts: () => {},
  setOptimisticPosts: () => {},
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

export default function AppProvider({
  children,
  user: initialUser,
}: {
  children: React.ReactNode;
  user: Account;
}) {
  const [user, setUser] = useState<Account>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<{
    message: string;
    status: number;
  } | null>(null);
  const [optimisticPosts, setOptimisticPosts] = useOptimistic<Post[]>(posts);

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        posts,
        optimisticPosts,
        setPosts,
        setOptimisticPosts,
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

export function useApp() {
  return useContext(AppContext);
}
