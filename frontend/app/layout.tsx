import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ToastProvider } from '@/lib/contexts/ToastContext';
import { ProjectProvider } from '@/lib/contexts/ProjectContext';
import { SocketProviderWrapper } from '@/lib/providers/SocketProviderWrapper';
import { ThemeInitializer } from '@/components/theme/ThemeInitializer';

export const metadata: Metadata = {
  title: 'Worklamp - Project Management for Developers',
  description: 'Comprehensive project management and collaboration platform for development teams',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInitializer />
      </head>
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            <SocketProviderWrapper>
              <ToastProvider>
                <ProjectProvider>{children}</ProjectProvider>
              </ToastProvider>
            </SocketProviderWrapper>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
