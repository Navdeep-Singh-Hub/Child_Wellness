import { Stack } from 'expo-router';

export default function Level1Session1Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="game1" />
      <Stack.Screen name="game2" />
      <Stack.Screen name="game3" />
      <Stack.Screen name="game4" />
      <Stack.Screen name="task" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
