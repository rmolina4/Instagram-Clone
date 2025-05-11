"use client";

import { ReactNode } from "react";

interface ButtonProps {
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}

export default function Button({ children, className, onClick, type, disabled}: ButtonProps) {
    return (
        <button type={type} disabled={disabled} className={`w-full flex items-center justify-center gap-2 rounded-lg ${className}`} onClick={onClick}>
            {children}
        </button>
    )
}