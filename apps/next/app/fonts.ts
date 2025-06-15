import { Inter } from 'next/font/google';

// Define the Inter font with the same weights used in Expo
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
  variable: '--font-inter',
});
