import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../constants/colors';
import DiscussionForm from '../../../components/DiscussionForm';
import { communitiesApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth-store';

export default function CreateCommunityDiscussionScreen() {
  const { id: communityId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (discussionData) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a discussion.');
      router.push('/auth/login');
      return;
    }

    if (!communityId) {
      Alert.alert('Error', 'Community ID is missing.');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Creating discussion:', {
        ...discussionData,
        communityId
      });
      
      const newDiscussion = await communitiesApi.createDiscussion(
        {
          ...discussionData,
          communityId
        },
        user.id
      );
      
      console.log('Discussion created successfully:', newDiscussion);
      
      // Show success message and navigate back to the community
      Alert.alert(
        'Success',
        'Your discussion has been posted!',
        [
          {
            text: 'View Discussion',
            onPress: () => router.push(`/community/discussion/${newDiscussion.id}`)
          },
          {
            text: 'Back to Community',
            onPress: () => router.push(`/community/${communityId}`)
          }
        ]
      );
    } catch (error) {
      console.error('Failed to create discussion:', error);
      Alert.alert(
        'Error',
        `Failed to post your discussion: ${error.message || 'Please try again later.'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Create Discussion',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
        }}
      />

      {isSubmitting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <DiscussionForm 
          onSubmit={handleSubmit}
          communityId={communityId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 