import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PubStation - Free Classic Literature',
  description: 'Access thousands of free public domain e-books in multiple languages',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
