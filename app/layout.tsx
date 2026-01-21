import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ekubo Pool Slippage Dashboard',
  description: 'Real-time slippage monitoring for Ekubo protocol pools on Starknet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
