import { setTokenProvider } from '@/utils/api';
import { useAuth } from '@clerk/clerk-expo';
import React, { useEffect } from 'react';

export default function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    setTokenProvider(async () => {
      try {
        // Only try to get token if user is signed in
        if (!isSignedIn) {
          return undefined;
        }
        const token = await getToken();
        return token ?? undefined;
      } catch {
        return undefined;
      }
    });
  }, [getToken, isSignedIn]);

  return <>{children}</>;
}


