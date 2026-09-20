import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${sizeClass} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-200"
      >
        <defs>
          <radialGradient id="smoke-glass-grad" cx="45%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#86868B" />
            <stop offset="65%" stopColor="#6E6E73" />
            <stop offset="100%" stopColor="#56565A" />
          </radialGradient>
        </defs>

        {/* Smoked glass inner circle with bold dark outer ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="url(#smoke-glass-grad)"
          stroke="#0A0A0F"
          strokeWidth="9"
        />

        {/* Crisp solid white play triangle */}
        <path
          d="M42 34.5L66 50L42 65.5Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
