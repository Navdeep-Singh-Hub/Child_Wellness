// Root path "/" must be handled by the public landing (auth check, redirect to app or login).
// Without this file, Expo Router can match (admin)/index first and send everyone to admin dashboard.
export { default } from './(public)/index';
