import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export interface CardProps extends HTMLMotionProps<"div"> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', hoverEffect = false, children, ...props }, ref) => {
    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { y: -3, scale: 1.005, transition: { duration: 0.2 } } : undefined}
        className={cn(
          "bg-[#151424]/60 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden text-white transition-all duration-300",
          hoverEffect && "hover:border-violet-500/40 hover:shadow-[0_12px_35px_-10px_rgba(139,92,246,0.25)]",
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';
