import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'SYAD MARKET — Digital Store', template: '%s • SYAD MARKET' },
  description: 'Marketplace digital SYAD MARKET dengan sistem order, pembayaran, dan fulfilment manual oleh admin.',
  icons: { icon: '/assets/logo.jpg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#070506',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
