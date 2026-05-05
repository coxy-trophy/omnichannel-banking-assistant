import React from 'react';
import { cn } from './Button';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm", className)} 
      {...props}
    >
      {children}
    </div>
  );
}
