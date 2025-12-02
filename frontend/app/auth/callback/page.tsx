'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        router.push(`/?error=${error}`);
        return;
      }

      if (!token) {
        console.error('No token received');
        router.push('/?error=no_token');
        return;
      }

      try {
        console.log('[OAUTH CALLBACK DEBUG] Received token, storing and refreshing user');
        // Store the access token
        localStorage.setItem('accessToken', token);

        // Refresh user data from the auth context
        await refreshUser();
        console.log('[OAUTH CALLBACK DEBUG] User refreshed successfully, redirecting to dashboard');

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('[OAUTH CALLBACK DEBUG] Auth callback error:', error);
        localStorage.removeItem('accessToken');
        router.push('/?error=callback_failed');
      }
    };

    handleCallback();
  }, [searchParams, router, refreshUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
