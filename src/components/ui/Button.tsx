import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded bg-accent px-4 py-2 text-base text-bg disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
