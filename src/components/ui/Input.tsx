import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`rounded border border-muted bg-bg px-4 py-2 text-base text-text ${className}`}
      {...props}
    />
  );
}
