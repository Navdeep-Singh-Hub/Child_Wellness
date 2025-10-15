import { setTokenProvider } from '@/utils/api';
import { useAuth } from '@clerk/clerk-expo';
import React, { useEffect } from 'react';

export default function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenProvider(async () => {
      try {
        const token = await getToken();
        return token ?? undefined;
      } catch {
        return undefined;
      }
    });
  }, [getToken]);

  return <>{children}</>;
}


