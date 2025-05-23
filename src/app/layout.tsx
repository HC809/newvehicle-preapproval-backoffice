import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import './globals.css';
// El NotificationProvider y ChatProvider ya están en client-providers.tsx

export const metadata: Metadata = {
  title: 'COFISA',
  description: 'COFISA'
};

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${lato.className}`} suppressHydrationWarning>
      <body className={'overflow-hidden'}>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem={false}
        >
          <NextTopLoader showSpinner={false} />
          <NuqsAdapter>
            <Toaster />
            {children}
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
