import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useAuthStore } from "../store/auth-store";

export const unstable_settings = {
  initialRouteName: "landing",
};

SplashScreen.preventAutoHideAsync();

function useProtectedRoute(isAuthenticated) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    const isLandingPage = segments[0] === 'landing';
    const isOnboarding = segments[0] === 'onboarding';
    
    if (!isAuthenticated && !inAuthGroup && !isLandingPage && !isOnboarding) {
      // Redirect to the landing page if not authenticated and not in auth group
      router.replace('/landing');
    } else if (isAuthenticated && (inAuthGroup || isLandingPage)) {
      // Redirect to the home page if authenticated and trying to access auth or landing pages
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { isAuthenticated } = useAuthStore();
  
  // Use the custom hook to protect routes
  useProtectedRoute(isAuthenticated);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <Slot />;
  }

  return (
    <ErrorBoundary>
      <Stack>
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: true }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: true }} />
        <Stack.Screen name="settings" options={{ headerShown: true }} />
        <Stack.Screen name="game" options={{ headerShown: false }} />
        <Stack.Screen name="venue" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: true }} />
        <Stack.Screen name="activity" options={{ headerShown: true }} />
        <Stack.Screen name="player" options={{ headerShown: true }} />
        <Stack.Screen name="community" options={{ headerShown: true }} />
      </Stack>
    </ErrorBoundary>
  );
}