'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid unsubscribe link');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/newsletter/unsubscribe`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('You have been successfully unsubscribed from our newsletter.');
        } else {
          setStatus('error');
          setMessage(data.error?.message || 'Failed to unsubscribe');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Newsletter Unsubscribe</h1>
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Processing your request...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="text-center">
            <div className="text-green-600 dark:text-green-400 text-5xl mb-4">✓</div>
            <p className="text-gray-700 dark:text-gray-300">{message}</p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              You will no longer receive emails from Worklamp.
            </p>
          </div>
        )}
        {status === 'error' && (
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-5xl mb-4">✗</div>
            <p className="text-gray-700 dark:text-gray-300">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
