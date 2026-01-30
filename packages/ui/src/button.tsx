"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "Primary" | "Outlined" | "Underlined";
  size?: "lg" | "sm" | "md"
}


export const Button = ({ size, className, variant, children }: ButtonProps) => {
  const variantStyles =
    variant === "Primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : variant === "Outlined"
      ? "text-gray-600 hover:text-gray-900 transition"
      :variant === "Underlined"
      ? "bg-white text-blue-600 hover:bg-gray-100"
      : "border border-blue-600 text-blue-600 hover:bg-blue-50"; 


  const sizeStyles =
    size === "lg"
      ? "px-6 py-3 text-lg"
      : size === "sm"
      ? "px-3 py-1 text-sm"
      : "px-4 py-2 text-base";

  return (
    <button className={`${className} ${variantStyles} ${sizeStyles} rounded-md font-medium transition-all`}>
      {children}
    </button>
  );
};
