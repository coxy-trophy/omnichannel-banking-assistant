import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-on-primary",
    secondary: "bg-success-mint text-on-success-mint",
    outline: "border border-outline bg-transparent text-on-surface hover:bg-surface-container",
    danger: "bg-error text-on-error",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}
