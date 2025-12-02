import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ToastProvider } from '@/lib/contexts/ToastContext';
import { ProjectProvider } from '@/lib/contexts/ProjectContext';

export const metadata: Metadata = {
  title: 'Worklamp - Project Management for Developers',
  description: 'Comprehensive project management and collaboration platform for development teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <ProjectProvider>{children}</ProjectProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
