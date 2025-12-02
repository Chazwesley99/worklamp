'use client';

import React from 'react';
import { SocketProvider } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';

/**
 * Wrapper component that connects SocketProvider with AuthContext
 * Passes the access token to SocketProvider for authentication
 */
export function SocketProviderWrapper({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();

  return (
    <SocketProvider token={accessToken}>
      {children}
      <ConnectionStatus />
    </SocketProvider>
  );
}
