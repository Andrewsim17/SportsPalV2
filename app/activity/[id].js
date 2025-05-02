import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Heart, MessageCircle, Share2, MapPin, Clock, Activity as ActivityIcon, Send, AlertCircle, Mountain } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { activitiesApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const { id: activityId } = useLocalSearchParams();
  const { user } = useAuthStore();

  const [activity, setActivity] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const fetchActivityDetails = useCallback(async () => {
    if (!activityId) {
      setError("Activity ID not provided.");
      setIsLoading(false);
      return;
    }
    console.log(`Fetching details for activity ID: ${activityId}`);
    setIsLoading(true);
    setError(null);
    try {
      const fetchedActivity = await activitiesApi.getActivity(activityId);
      console.log("Fetched activity details:", fetchedActivity);

      if (!fetchedActivity) {
        throw new Error("Activity not found.");
      }

      setActivity(fetchedActivity);

      const adaptedComments = fetchedActivity.comments?.map(c => ({
        id: c.id,
        userId: c.user?.id,
        userName: c.user?.name || 'Unknown User',
        userAvatar: c.user?.avatar_url || `https://ui-avatars.com/api/?name=${c.user?.name?.charAt(0) || 'U'}&background=cccccc&color=fff`,
        text: c.content,
        time: c.created_at,
      })) || [];
      setComments(adaptedComments);

      if (user && fetchedActivity.likes?.some(like => like.user_id === user.id)) {
        setIsLiked(true);
      } else {
        setIsLiked(false);
      }

    } catch (err) {
      console.error("Failed to fetch activity details:", err);
      setError(err.message || 'Failed to load activity details.');
    } finally {
      setIsLoading(false);
    }
  }, [activityId, user]);

  useEffect(() => {
    fetchActivityDetails();
  }, [fetchActivityDetails]);

  const handleToggleLike = async () => {
    if (!user || isLiking || !activity) return;

    setIsLiking(true);
    const currentlyLiked = isLiked;
    const originalLikes = activity.likes || [];
    
    setIsLiked(!currentlyLiked);
    setActivity(prev => {
      if (!prev) return null;
      const currentLikeCount = prev.likes?.length || 0;
      return {
        ...prev,
        likes: !currentlyLiked
          ? [...originalLikes, { user_id: user.id }]
          : originalLikes.filter(like => like.user_id !== user.id),
      };
    });

    try {
      if (currentlyLiked) {
        await activitiesApi.unlikeActivity(activity.id, user.id);
        console.log('Activity unliked');
      } else {
        await activitiesApi.likeActivity(activity.id, user.id);
        console.log('Activity liked');
      }
      fetchActivityDetails();
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setIsLiked(currentlyLiked);
      setActivity(prev => ({ ...prev, likes: originalLikes }));
      Alert.alert('Error', 'Could not update like status.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !activity || isCommenting) return;

    setIsCommenting(true);
    const commentContent = newComment;
    setNewComment('');

    const tempComment = {
      id: `temp-${Date.now()}`,
      userId: user.id,
      userName: user.name || 'You',
      userAvatar: user.avatar_url || `https://ui-avatars.com/api/?name=Y&background=${colors.primary.substring(1)}&color=fff`,
      text: commentContent,
      time: new Date().toISOString(),
      isTemporary: true
    };
    setComments(prev => [...prev, tempComment]);

    try {
      const savedComment = await activitiesApi.addCommentToActivity(activity.id, user.id, commentContent);
      console.log('Comment added:', savedComment);

      setComments(prev => prev.map(c => 
        c.id === tempComment.id ? { 
           id: savedComment.id,
           userId: savedComment.user?.id,
           userName: savedComment.user?.name || 'Unknown User',
           userAvatar: savedComment.user?.avatar_url || `https://ui-avatars.com/api/?name=${savedComment.user?.name?.charAt(0) || 'U'}&background=cccccc&color=fff`,
           text: savedComment.content,
           time: savedComment.created_at,
        } : c
      ));
    } catch (err) {
      console.error("Failed to add comment:", err);
      Alert.alert('Error', 'Could not post comment.');
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
    } finally {
      setIsCommenting(false);
    }
  };

  const formatTimeAgo = (dateString) => {
     if (!dateString) return '';
     try {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
     } catch (e) {
        return 'Just now';
     }
  };

  const renderStats = () => {
    const details = activity?.details;
    const sport = activity?.sport;

    if (!activity) return null;

    if (sport === 'badminton') {
      return (
        <>
          <View style={styles.statItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.statValue}>{details?.duration_min?.toFixed(0) || 'N/A'} min</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <ActivityIcon size={20} color={colors.primary} />
            <Text style={styles.statValue}>{details?.matches || 'N/A'}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statItem}>
            <ActivityIcon size={20} color={colors.primary} />
            <Text style={styles.statValue}>{details?.wins || 'N/A'}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
        </>
      );
    } else if (sport === 'basketball') {
      return (
        <>
          <View style={styles.statItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.statValue}>{details?.duration_min?.toFixed(0) || 'N/A'} min</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <ActivityIcon size={20} color={colors.primary} />
            <Text style={styles.statValue}>{details?.points || 'N/A'}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <ActivityIcon size={20} color={colors.primary} />
            <Text style={styles.statValue}>{details?.assists || 'N/A'}</Text>
            <Text style={styles.statLabel}>Assists</Text>
          </View>
          <View style={styles.statItem}>
            <ActivityIcon size={20} color={colors.primary} />
            <Text style={styles.statValue}>{details?.rebounds || 'N/A'}</Text>
            <Text style={styles.statLabel}>Rebounds</Text>
          </View>
        </>
      );
    } else {
      return (
        <>
          <View style={styles.statItem}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.statValue}>{details?.distance_km?.toFixed(2) || 'N/A'} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.statValue}>{details?.duration_min?.toFixed(0) || 'N/A'} min</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <ActivityIcon size={20} color={colors.primary} />
            <Text style={styles.statValue}>{details?.pace_min_km || 'N/A'} /km</Text>
            <Text style={styles.statLabel}>Pace</Text>
          </View>
          <View style={styles.statItem}>
            <Mountain size={20} color={colors.primary} />
            <Text style={styles.statValue}>{details?.elevation_m || 'N/A'} m</Text>
            <Text style={styles.statLabel}>Elevation</Text>
          </View>
        </>
      );
    }
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={40} color={colors.danger} />
        <Text style={styles.errorText}>Error loading activity:</Text>
        <Text style={styles.errorDetails}>{error}</Text>
        <Pressable onPress={fetchActivityDetails} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }
  
  if (!activity) {
     return (
      <View style={styles.errorContainer}>
         <Text style={styles.errorText}>Activity not found.</Text>
      </View>
     );
  }

  const likeCount = activity.likes?.length || 0;
  const commentCount = comments.length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerTintColor: colors.card,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.card} />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <Image
          source={activity.details?.image_url || 'https://via.placeholder.com/600x400.png?text=Activity'}
          style={styles.coverImage}
          contentFit="cover"
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={activity.user?.avatar_url || `https://ui-avatars.com/api/?name=${activity.user?.name?.charAt(0) || 'U'}&background=6C5CE7&color=fff`}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.headerText}>
              <Text style={styles.userName}>{activity.user?.name || 'Unknown User'}</Text>
              <Text style={styles.activityDate}>{formatTimeAgo(activity.created_at)} • {activity.sport || activity.type}</Text>
            </View>
          </View>

          <Text style={styles.title}>{activity.content}</Text>

          {activity.details?.description ? (
            <Text style={styles.description}>{activity.details.description}</Text>
          ) : null}

          {activity.details?.location_name && (
          <View style={styles.locationContainer}>
            <MapPin size={16} color={colors.textLight} />
              <Text style={styles.locationText}>{activity.details.location_name}</Text>
          </View>
          )}

          <View style={styles.statsContainer}>
            {renderStats()}
          </View>

          <View style={styles.actionsContainer}>
            <Pressable 
              style={[styles.actionButton, isLiking && styles.disabledButton]}
              onPress={handleToggleLike}
              disabled={isLiking || !user}
            >
              <Heart 
                size={24} 
                color={isLiked ? colors.danger : colors.text}
                fill={isLiked ? colors.danger : 'none'}
              />
              <Text style={styles.actionText}>{likeCount} Likes</Text>
            </Pressable>

            <Pressable style={styles.actionButton}>
              <MessageCircle size={24} color={colors.text} />
              <Text style={styles.actionText}>{commentCount} Comments</Text>
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Share2 size={24} color={colors.text} />
              <Text style={styles.actionText}>Share</Text>
            </Pressable>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments</Text>
            
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image
                  source={comment.userAvatar}
                  style={styles.commentAvatar}
                  contentFit="cover"
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUserName}>{comment.userName}</Text>
                    <Text style={styles.commentTime}>{formatTimeAgo(comment.time)}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            ))}
            {commentCount === 0 && (
               <Text style={styles.noCommentsText}>Be the first to comment!</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {user && (
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
             placeholderTextColor={colors.textLight}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <Pressable 
             style={[styles.sendButton, (!newComment.trim() || isCommenting) && styles.sendButtonDisabled]}
          onPress={handleAddComment}
             disabled={!newComment.trim() || isCommenting}
        >
             {isCommenting ? 
               <ActivityIndicator size="small" color={colors.card} /> : 
          <Send size={20} color={colors.card} />
             }
        </Pressable>
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.danger,
    textAlign: 'center',
    marginTop: 16,
  },
  errorDetails: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
     backgroundColor: colors.primary,
     paddingVertical: 10,
     paddingHorizontal: 20,
     borderRadius: 8,
  },
  retryButtonText: {
     color: colors.card,
     fontSize: 16,
     fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 300,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.card,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  activityDate: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
  commentsSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 80,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  commentTime: {
    fontSize: 12,
    color: colors.textLight,
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
   noCommentsText: {
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: 20,
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.primaryLight,
  },
  disabledButton: {
    opacity: 0.5,
  },
});