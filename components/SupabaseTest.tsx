import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../constants/supabase';

export const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test the connection by fetching the current user
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          setConnectionStatus('Connection failed');
          return;
        }

        if (data.session) {
          setConnectionStatus('Connected successfully!');
        } else {
          setConnectionStatus('Connected to Supabase, but no active session');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setConnectionStatus('Connection failed');
      }
    };

    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.status}>Connection Status: {connectionStatus}</Text>
      {error && <Text style={styles.error}>Error: {error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 10,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    fontSize: 14,
  },
}); 