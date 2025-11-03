import { useAuth } from '@/app/_layout';
import { setAuth0UserInfo, setTokenProvider } from '@/utils/api';
import React, { useEffect } from 'react';

export default function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { session, getAccessToken } = useAuth();

  useEffect(() => {
    if (getAccessToken) {
      setTokenProvider(getAccessToken);
    }
    
    // Set Auth0 user info for API headers
    if (session?.profile) {
      const auth0Id = session.profile.sub || session.profile.user_id || '';
      const email = session.profile.email || '';
      const name = session.profile.name || session.profile.nickname || '';
      setAuth0UserInfo({ auth0Id, email, name });
    } else {
      setAuth0UserInfo(null);
    }
  }, [getAccessToken, session]);

  return <>{children}</>;
}


