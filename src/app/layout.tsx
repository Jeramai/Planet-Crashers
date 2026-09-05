import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { assetPrefix } from './game/assets';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Planet Crashers',
  description: 'Launch planets into a gravity well and merge them all the way up to a star. A 3D take on the merge puzzle.',
  applicationName: 'Planet Crashers',
  openGraph: {
    type: 'website',
    title: 'Planet Crashers',
    description: 'Launch planets into a gravity well and merge them all the way up to a star.'
  }
};

export const viewport: Viewport = {
  themeColor: '#03040a',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className='h-full w-full'>
      <head>
        <link rel='icon' href={`${assetPrefix}favi/favicon.ico`} sizes='any' />
        <link rel='apple-touch-icon' href={`${assetPrefix}favi/apple-touch-icon.png`} />
        <link rel='manifest' href={`${assetPrefix}site.webmanifest`} />
      </head>
      <body className={`h-full w-full ${inter.className}`}>{children}</body>
    </html>
  );
}
