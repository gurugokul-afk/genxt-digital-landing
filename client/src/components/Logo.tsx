import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'h-6 text-xl',
    md: 'h-8 text-2xl',
    lg: 'h-12 text-4xl',
    xl: 'h-16 text-5xl',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center gap-1 font-extrabold tracking-tight select-none ${sizes[size]} ${className}`}>
      <span className="text-white font-black">Gen</span>
      {/* GenXt Signature Electric Chevron Icon */}
      <span className="inline-flex items-center justify-center relative mx-[1px]">
        <svg
          className={`${iconSizes[size]} text-[#6d5dfc]`}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Chevron pointing downward */}
          <path
            d="M8 12 L20 23 L32 12"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bottom Chevron pointing upward */}
          <path
            d="M8 28 L20 17 L32 28"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-white font-black">t</span>
    </div>
  );
};
