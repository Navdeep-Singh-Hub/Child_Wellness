import React from 'react';
import { Platform } from 'react-native';

let AuthProvider: React.FC<{children:React.ReactNode}>;
let useAuth: any;

if (Platform.OS === 'web') {
  // @ts-ignore
  const web = require('../../src/auth/AuthProvider.web.tsx');
  AuthProvider = web.AuthProvider;
  useAuth = web.useAuth;
} else {
  // @ts-ignore
  const native = require('../../src/auth/AuthProvider.native.tsx');
  AuthProvider = native.AuthProvider;
  useAuth = native.useAuth;
}

export { AuthProvider, useAuth };
// Expo Router expects route files to have a default export. This file is
// used as a platform proxy for the actual AuthProvider implementations.
// Provide a default export so the router doesn't warn about a missing
// default export when scanning `app/providers`.
export default AuthProvider;

