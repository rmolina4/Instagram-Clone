"use client";

import { Post as PostProps } from "@/utils/types";
import { createContext, useState} from "react";

interface PostContextType {
    posts: PostProps[];
    setPosts: (posts: PostProps[]) => void;
    addPost: (post: PostProps) => void;
    updatePost: (postId: string, updatedPost: Partial<PostProps>) => void;
    deletePost: (postId: string) => void;
}

export const PostContext = createContext<PostContextType>({
    posts: [],
    setPosts: () => {},
    addPost: () => {},
    updatePost: () => {},
    deletePost: () => {},
});

export const PostProvider = ({
    children,
    posts: initialPosts,
}: {
    children: React.ReactNode;
    posts: PostProps[];
}) => {
    const [posts, setPosts] = useState<PostProps[]>(initialPosts);

    const addPost = (post: PostProps) => {
        setPosts(prev => [post, ...prev]);
    };

    const updatePost = (postId: string, updatedPost: Partial<PostProps>) => {
        setPosts(prev => prev.map(post => 
            post.id === postId ? { ...post, ...updatedPost } : post
        ));
    };

    const deletePost = (postId: string) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
    };

    return (
        <PostContext.Provider value={{ 
            posts, 
            setPosts, 
            addPost, 
            updatePost, 
            deletePost 
        }}>
            {children}
        </PostContext.Provider>
    );
};