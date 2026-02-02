import React from 'react';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  variant?: 'default' | 'truck' | 'box';
}

export const Logo: React.FC<LogoProps> = ({
  collapsed = false,
  className = '',
  variant = 'default'
}) => {
  if (variant === 'truck') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Truck Icon SVG */}
        <svg
          viewBox="0 0 48 48"
          className={`${collapsed ? 'w-10 h-10' : 'w-12 h-12'}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Truck body */}
          <rect x="4" y="18" width="24" height="12" rx="2" fill="#422AFB" />
          {/* Truck cabin */}
          <path
            d="M28 18h8l4 6v6h-12v-12z"
            fill="#422AFB"
          />
          {/* Window */}
          <rect x="30" y="20" width="6" height="4" rx="1" fill="#E9E3FF" />
          {/* Wheels */}
          <circle cx="12" cy="32" r="4" fill="#1B254B" />
          <circle cx="12" cy="32" r="2" fill="#E9E3FF" />
          <circle cx="34" cy="32" r="4" fill="#1B254B" />
          <circle cx="34" cy="32" r="2" fill="#E9E3FF" />
          {/* Details */}
          <rect x="8" y="22" width="16" height="2" rx="1" fill="#E9E3FF" opacity="0.5" />
        </svg>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-xl font-bold text-navy-700 dark:text-white leading-none">
              Transport
            </span>
            <span className="text-sm font-medium text-brand-500 dark:text-brand-400 leading-none">
              Management System
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'box') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Delivery Box Icon SVG */}
        <svg
          viewBox="0 0 48 48"
          className={`${collapsed ? 'w-10 h-10' : 'w-12 h-12'}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Box */}
          <path
            d="M24 8L8 16v16l16 8 16-8V16L24 8z"
            fill="#422AFB"
          />
          {/* Box top face */}
          <path
            d="M24 8L8 16l16 8 16-8L24 8z"
            fill="#7551FF"
          />
          {/* Box front edge */}
          <path
            d="M24 24v16l-16-8V16l16 8z"
            fill="#5B3FFF"
          />
          {/* Tape */}
          <rect x="22" y="16" width="4" height="20" fill="#FFD666" />
          <rect x="12" y="22" width="24" height="3" fill="#FFD666" />
        </svg>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-xl font-bold text-navy-700 dark:text-white leading-none">
              Transport
            </span>
            <span className="text-sm font-medium text-brand-500 dark:text-brand-400 leading-none">
              Management System
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default - TMS Badge Logo
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {collapsed ? (
        // Collapsed: Circular badge with TMS
        <div className="relative w-12 h-12">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer circle */}
            <circle cx="24" cy="24" r="22" fill="url(#gradient)" />
            {/* Inner circle */}
            <circle cx="24" cy="24" r="18" fill="#1B254B" />
            {/* TMS Text */}
            <text
              x="24"
              y="28"
              fontSize="14"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
              fontFamily="Poppins, sans-serif"
            >
              TMS
            </text>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#7551FF" />
                <stop offset="100%" stopColor="#422AFB" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ) : (
        // Expanded: Badge with full text
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Shield/Badge shape */}
              <path
                d="M24 4L8 10v12c0 10 6 18 16 20 10-2 16-10 16-20V10L24 4z"
                fill="url(#badge-gradient)"
              />
              {/* Inner accent */}
              <path
                d="M24 8L12 12v10c0 8 4.5 14 12 16 7.5-2 12-8 12-16V12L24 8z"
                fill="#1B254B"
              />
              {/* TMS letters */}
              <text
                x="24"
                y="28"
                fontSize="12"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
                fontFamily="Poppins, sans-serif"
              >
                TMS
              </text>
              <defs>
                <linearGradient id="badge-gradient" x1="0" y1="0" x2="48" y2="48">
                  <stop offset="0%" stopColor="#7551FF" />
                  <stop offset="100%" stopColor="#422AFB" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-navy-700 dark:text-white leading-tight">
              Transport
            </span>
            <span className="text-xs font-medium text-brand-500 dark:text-brand-400 leading-tight">
              Management System
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
