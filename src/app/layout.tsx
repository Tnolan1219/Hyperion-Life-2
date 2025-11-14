import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { FirebaseProvider } from '@/firebase/provider';
import { auth, firestore, firebaseApp } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from '@/components/AppShell';


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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.variable} font-sans antialiased animated-background`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseProvider
            auth={auth}
            firestore={firestore}
            firebaseApp={firebaseApp}
          >
            <FirebaseErrorListener />
              <AppShell>{children}</AppShell>
            <Toaster />
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
