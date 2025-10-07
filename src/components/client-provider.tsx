'use client';

import { useState, ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { SSRProvider } from 'react-bootstrap';

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SSRProvider>
      <SessionProvider
        refetchInterval={5 * 60}
        refetchOnWindowFocus={true}
      >
            {children}
      </SessionProvider>
    </SSRProvider>
  );
};
