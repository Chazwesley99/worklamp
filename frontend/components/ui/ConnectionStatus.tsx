'use client';

import React from 'react';
import { useSocket } from '@/lib/contexts/SocketContext';

export function ConnectionStatus() {
  const { connectionStatus, isConnected } = useSocket();

  // Don't show anything when connected (normal state)
  if (isConnected) {
    return null;
  }

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          text: 'Connecting...',
          pulse: true,
        };
      case 'disconnected':
        return {
          color: 'bg-gray-500',
          text: 'Disconnected',
          pulse: false,
        };
      case 'error':
        return {
          color: 'bg-red-500',
          text: 'Connection Error',
          pulse: false,
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'Unknown',
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${config.color}`} />
          {config.pulse && (
            <div
              className={`absolute inset-0 w-2 h-2 rounded-full ${config.color} animate-ping opacity-75`}
            />
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{config.text}</span>
      </div>
    </div>
  );
}
