import { Redirect } from 'expo-router';

/** Only used when user navigates to /(admin). Root "/" is handled by app/index.tsx (public landing). */
export default function AdminIndex() {
  return <Redirect href="/(admin)/dashboard" />;
}
