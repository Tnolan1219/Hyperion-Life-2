import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { FirebaseProvider } from '@/firebase/provider';
import { auth, firestore, firebaseApp } from '@/firebase';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-base',
});

export const metadata: Metadata = {
  title: 'Base 44',
  description: 'Personal finance dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        <FirebaseProvider
          auth={auth}
          firestore={firestore}
          firebaseApp={firebaseApp}
        >
          <FirebaseErrorListener />
          {children}
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
