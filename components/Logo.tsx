'use client';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      
      <path
        d="M20 50 Q30 40, 40 50 T60 50 T80 50"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        className="dark:opacity-80"
      />
      <path
        d="M20 60 Q30 70, 40 60 T60 60 T80 60"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        className="dark:opacity-80"
      />
      
      <path
        d="M15 35 L25 35 M20 30 L15 35 L20 40"
        stroke="url(#arrowGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      <path
        d="M85 65 L75 65 M80 60 L85 65 L80 70"
        stroke="url(#arrowGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      <circle
        cx="50"
        cy="25"
        r="8"
        fill="url(#logoGradient)"
        className="dark:opacity-90"
      />
      <path
        d="M50 20 L50 30 M45 20 L55 20 M45 30 L55 30"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
