import React from 'react';
import { motion } from 'framer-motion';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  showLabels?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  showLabels = false,
  className,
  ...props
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full flex items-center gap-4", className)}>
      {showLabels && <span className="text-xs text-white/40">{min}</span>}
      <div className="relative flex-1 h-2 bg-white/10 rounded-full">
        <div
          className="absolute h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          {...props}
        />
        <motion.div
          className="absolute top-1/2 -mt-2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] pointer-events-none"
          style={{ left: `calc(${percentage}% - 8px)` }}
          whileHover={{ scale: 1.2 }}
        />
      </div>
      {showLabels && <span className="text-xs text-white/40">{max}</span>}
    </div>
  );
};
