import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Planet Crashers',
  description: 'Crash planets into eachother and try to get the highest score.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const imgPrefix = process.env.NODE_ENV === 'production' ? '/Planet-Crashers/' : '/';

  return (
    <html lang='en' className='h-full w-full'>
      <head>
        <link rel='icon' href={`${imgPrefix}favi/favicon.ico`} sizes='any' />
      </head>
      <body className={`w-full h-full ${inter.className}`}>{children}</body>
    </html>
  );
}
