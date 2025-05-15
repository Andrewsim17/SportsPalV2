import { Stack } from 'expo-router';
import { colors } from '../../constants/colors';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        }
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          title: 'Settings'
        }}
      />
      <Stack.Screen 
        name="notifications"
        options={{
          title: 'Notifications'
        }}
      />
      <Stack.Screen 
        name="privacy"
        options={{
          title: 'Privacy & Security'
        }}
      />
      <Stack.Screen 
        name="help"
        options={{
          title: 'Help Center'
        }}
      />
      <Stack.Screen 
        name="terms"
        options={{
          title: 'Terms & Policies'
        }}
      />
    </Stack>
  );
} 