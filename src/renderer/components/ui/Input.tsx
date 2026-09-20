import React from 'react';
import { motion } from 'framer-motion';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, error, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 text-white/40 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-white/40 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all',
            !!leftIcon && 'pl-10',
            !!rightIcon && 'pr-10',
            error && 'border-red-500/50 focus:ring-red-500/50',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-white/40">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
