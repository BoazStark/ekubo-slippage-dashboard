'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 72 }: LogoProps) {
  return (
    <Image
      src="/ekubo-logo.png"
      alt="Ekubo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
