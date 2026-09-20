import React from 'react';
import { motion } from 'framer-motion';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  className,
  disabled = false,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 select-none cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      onClick={() => !disabled && onChange(!checked)}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 border transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F14]",
          checked
            ? "bg-violet-600 border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.35)]"
            : "bg-white/10 hover:bg-white/15 border-white/10"
        )}
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.2)]"
          initial={false}
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                checked ? "text-white" : "text-white/70 group-hover:text-white/90"
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
