import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth-store';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { refreshProfile, createOrUpdateOAuthProfile } = useAuthStore();

  useEffect(() => {
    // Handle the URL parameters from the OAuth callback
    async function handleOAuthCallback() {
      try {
        // Check if we have the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          router.replace('/auth/login');
          return;
        }
        
        if (session) {
          // Create or update profile for OAuth user
          await createOrUpdateOAuthProfile(session.user);
          
          // Fetch the user profile data
          await refreshProfile();
          
          // Navigate to the main app
          router.replace('/(tabs)');
        } else {
          // No session, go back to login
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        router.replace('/auth/login');
      }
    }

    handleOAuthCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: colors.text,
  },
}); 