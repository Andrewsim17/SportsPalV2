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
      console.log('Auth callback received with params:', params);
      
      try {
        console.log('Getting session from supabase...');
        // Check if we have the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message, error);
          router.replace('/auth/login');
          return;
        }
        
        if (session) {
          console.log('Session found, user ID:', session.user.id);
          // Create or update profile for OAuth user
          const profileResult = await createOrUpdateOAuthProfile(session.user);
          console.log('Profile creation/update result:', profileResult ? 'success' : 'failed');
          
          // Fetch the user profile data
          await refreshProfile();
          console.log('Profile refreshed, navigating to main app');
          
          // Navigate to the main app
          router.replace('/(tabs)');
        } else {
          console.warn('No session found in callback');
          // No session, go back to login
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('OAuth callback error:', error.message, error);
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