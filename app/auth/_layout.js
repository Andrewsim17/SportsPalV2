import { Stack } from 'expo-router';
 
// This layout defines the stack navigator for screens within the /auth group.
// Typically, auth screens might not show a header.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
} 