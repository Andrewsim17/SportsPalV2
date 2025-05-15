import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  ChevronUp, 
  ChevronDown,
  Send,
  User
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { communitiesApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth-store';
import { getPublicUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

// Helper to format dates (can be moved to a utils file)
const formatDate = (dateString, options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', options);
  } catch (e) {
    console.warn('Error formatting date:', e);
    return dateString;
  }
};

// Process avatar URL helper function for consistency with other components
const getAvatarUrl = (rawAvatarUrl, name = 'U') => {
  // If no avatar_url, generate a UI avatar with the first letter of the name
  if (!rawAvatarUrl) {
    const firstLetter = (name || 'U').charAt(0);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=6C5CE7&color=fff`;
  }
  
  // If it's a storage path (not a full URL), get the public URL
  if (rawAvatarUrl && !rawAvatarUrl.startsWith('http')) {
    return getPublicUrl(rawAvatarUrl);
  }
  
  // Return as is if it's already a valid URL
  return rawAvatarUrl;
};

// Reply item component for rendering individual replies
const ReplyItem = ({ reply, onViewProfile, onLike, isLiked }) => {
  const authorName = reply.user?.name || 'Unknown User';
  const authorImage = getAvatarUrl(reply.user?.avatar_url, authorName);
  const replyDate = formatDate(reply.created_at);
  const likeCount = reply.likes_count || 0;

  return (
    <View style={styles.replyItem}>
      <View style={styles.replyAuthorContainer}>
        <Pressable onPress={() => onViewProfile(reply.user?.id)}>
          {authorImage ? (
            <Image 
              source={{ uri: authorImage }} 
              style={styles.replyAuthorImage}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.replyAuthorImage, styles.authorImagePlaceholder]}>
              <User size={16} color={colors.textLight} />
            </View>
          )}
        </Pressable>
        <View style={styles.replyAuthorInfo}>
          <Pressable onPress={() => onViewProfile(reply.user?.id)}>
            <Text style={styles.replyAuthorName}>{authorName}</Text>
          </Pressable>
          <Text style={styles.replyDateText}>{replyDate}</Text>
        </View>
      </View>
      <Text style={styles.replyContent}>{reply.content}</Text>
      
      <View style={styles.replyActionsContainer}>
        <Pressable 
          style={styles.replyActionButton}
          onPress={() => onLike(reply.id)}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Heart 
            size={16} 
            color={isLiked ? colors.danger : colors.textLight}
            fill={isLiked ? colors.danger : 'none'} 
          />
          <Text style={[
            styles.replyActionText,
            isLiked && { color: colors.danger }
          ]}>
            {likeCount}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

// Create separate component for the discussion header
const DiscussionHeader = ({ discussion, authorName, authorImage, discussionDate, likeCount, replyCount, onViewProfile, onLikeDiscussion, isLiked }) => {
  return (
    <>
      <View style={styles.discussionContainer}>
        <View style={styles.authorContainer}>
          <Pressable onPress={() => onViewProfile(discussion.user?.id)}>
            {authorImage ? (
              <Image 
                source={{ uri: authorImage }} 
                style={styles.authorImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={[styles.authorImage, styles.authorImagePlaceholder]}>
                <User size={24} color={colors.textLight} />
              </View>
            )}
          </Pressable>
          <View style={styles.authorInfo}>
            <Pressable onPress={() => onViewProfile(discussion.user?.id)}>
              <Text style={styles.authorName}>{authorName}</Text>
            </Pressable>
            <Text style={styles.dateText}>{discussionDate}</Text>
          </View>
        </View>

        <Text style={styles.discussionTitle}>{discussion.title}</Text>
        <Text style={styles.discussionContent}>{discussion.content}</Text>

        <View style={styles.actionsContainer}>
          <Pressable 
            style={[styles.actionButton]}
            onPress={onLikeDiscussion}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Heart 
              size={20} 
              color={isLiked ? colors.danger : colors.textLight}
              fill={isLiked ? colors.danger : 'none'}
            />
            <Text style={[
              styles.actionText,
              isLiked && { color: colors.danger }
            ]}>
              {likeCount}
            </Text>
          </Pressable>

          <View style={styles.actionButton}>
            <MessageCircle size={20} color={colors.textLight} />
            <Text style={styles.actionText}>{replyCount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.repliesHeader}>
        <Text style={styles.repliesTitle}>Replies</Text>
      </View>
    </>
  );
};

export default function DiscussionDetailScreen() {
  const { id: discussionId } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();

  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [likedReplies, setLikedReplies] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserLikes = useCallback(async (repliesList) => {
    if (!currentUser || !repliesList || repliesList.length === 0) return;

    try {
      const likeStatusMap = {};
      
      // Check each reply to see if the current user has liked it
      for (const reply of repliesList) {
        const isLiked = await communitiesApi.checkIfUserLikedReply(reply.id, currentUser.id);
        likeStatusMap[reply.id] = isLiked;
      }
      
      setLikedReplies(likeStatusMap);
    } catch (err) {
      console.error('Failed to fetch user like status:', err);
    }
  }, [currentUser]);

  const fetchDiscussionLikeStatus = useCallback(async () => {
    if (!currentUser || !discussionId) return;
    
    try {
      const isLiked = await communitiesApi.checkIfUserLikedDiscussion(discussionId, currentUser.id);
      setIsLiked(isLiked);
    } catch (err) {
      console.error('Failed to fetch discussion like status:', err);
    }
  }, [currentUser, discussionId]);

  // Add a dedicated function to fetch like count directly from the database
  const fetchLikesCount = useCallback(async (discussId) => {
    if (!discussId) return 0;
    
    try {
      // Count likes directly from the discussion_likes table
      const { count, error } = await supabase
        .from('discussion_likes')
        .select('id', { count: 'exact', head: true })
        .eq('discussion_id', discussId);
      
      if (error) {
        console.error('Error fetching likes count:', error);
        return 0;
      }
      
      console.log(`Fetched real-time likes count for discussion ${discussId}: ${count}`);
      return count || 0;
    } catch (error) {
      console.error('Error in fetchLikesCount:', error);
      return 0;
    }
  }, []);

  const fetchDiscussion = useCallback(async () => {
    if (!discussionId) {
      setError("Discussion ID not provided.");
      setIsLoading(false);
      return;
    }
    console.log('Fetching discussion with ID:', discussionId);
    setIsLoading(true);
    try {
      const fetchedDiscussion = await communitiesApi.getCommunityDiscussion(discussionId);
      if (!fetchedDiscussion) {
        throw new Error('Discussion not found.');
      }
      console.log('Fetched Discussion Data:', JSON.stringify(fetchedDiscussion, null, 2));
      
      // Get real-time likes count
      const currentLikesCount = await fetchLikesCount(discussionId);
      
      // Update discussion with real-time like count
      const updatedDiscussion = {
        ...fetchedDiscussion,
        likes_count: currentLikesCount
      };
      
      setDiscussion(updatedDiscussion);
      
      // Check if the current user has liked this discussion
      fetchDiscussionLikeStatus();
      
      // Fetch replies for this discussion
      try {
        console.log('Fetching replies for discussion ID:', discussionId);
        const fetchedReplies = await communitiesApi.getDiscussionReplies(discussionId);
        console.log('Fetched Replies:', JSON.stringify(fetchedReplies, null, 2));
        setReplies(fetchedReplies || []);
        
        // Fetch user's like status for each reply
        if (fetchedReplies && fetchedReplies.length > 0) {
          fetchUserLikes(fetchedReplies);
        }
      } catch (repliesError) {
        console.error('Failed to fetch replies:', repliesError);
        // Don't fail the whole screen just because replies failed
        setReplies([]);
      }
    } catch (err) {
      console.error('Failed to fetch discussion:', err);
      setError(err.message || 'Could not load discussion.');
    } finally {
      setIsLoading(false);
    }
  }, [discussionId, fetchUserLikes, fetchDiscussionLikeStatus, fetchLikesCount]);

  // Use useFocusEffect to refresh data when returning to the screen
  useFocusEffect(
    useCallback(() => {
      console.log('Discussion detail screen in focus, refreshing data...');
      fetchDiscussion();
    }, [fetchDiscussion])
  );

  // Keep the initial load effect for first render
  useEffect(() => {
    fetchDiscussion();
  }, [fetchDiscussion]);

  const handleLikeDiscussion = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'You need to be logged in to like discussions.');
      router.push('/auth/login');
      return;
    }
    
    try {
      if (isLiked) {
        // Unlike the discussion
        await communitiesApi.unlikeDiscussion(discussion.id, currentUser.id);
        setIsLiked(false);
        
        // Get updated like count directly from the database
        const updatedCount = await fetchLikesCount(discussion.id);
        setDiscussion(prev => ({
          ...prev,
          likes_count: updatedCount
        }));
      } else {
        // Like the discussion
        await communitiesApi.likeDiscussion(discussion.id, currentUser.id);
        setIsLiked(true);
        
        // Get updated like count directly from the database
        const updatedCount = await fetchLikesCount(discussion.id);
        setDiscussion(prev => ({
          ...prev,
          likes_count: updatedCount
        }));
      }
    } catch (error) {
      console.error('Error toggling discussion like:', error);
      Alert.alert('Error', 'Failed to update like status.');
    }
  };
  
  const handleLikeReply = async (replyId) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'You need to be logged in to like replies.');
      router.push('/auth/login');
      return;
    }
    
    try {
      if (likedReplies[replyId]) {
        // Unlike the reply
        await communitiesApi.unlikeReply(replyId, currentUser.id);
        
        // Update the UI
        setLikedReplies(prev => ({
          ...prev,
          [replyId]: false
        }));
        
        // Update the like count in the replies list
        setReplies(prevReplies => 
          prevReplies.map(reply => 
            reply.id === replyId 
              ? { ...reply, likes_count: Math.max((reply.likes_count || 0) - 1, 0) } 
              : reply
          )
        );
      } else {
        // Like the reply
        await communitiesApi.likeReply(replyId, currentUser.id);
        
        // Update the UI
        setLikedReplies(prev => ({
          ...prev,
          [replyId]: true
        }));
        
        // Update the like count in the replies list
        setReplies(prevReplies => 
          prevReplies.map(reply => 
            reply.id === replyId 
              ? { ...reply, likes_count: (reply.likes_count || 0) + 1 } 
              : reply
          )
        );
      }
    } catch (err) {
      console.error('Failed to like/unlike reply:', err);
      Alert.alert('Error', 'Failed to update like status. Please try again.');
    }
  };

  const handleSubmitReply = async () => {
    if (newReply.trim() === '') return;
    if (!currentUser) {
      Alert.alert('Login Required', 'You need to be logged in to reply to discussions.');
      router.push('/auth/login');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Submitting reply for discussion:', discussion?.id, 'Reply:', newReply);
      const replyData = await communitiesApi.addReplyToDiscussion(
        discussionId,
        currentUser.id,
        newReply.trim()
      );
      
      console.log('Reply submitted successfully:', replyData);
      
      // Add the new reply to the list
      setReplies((prevReplies) => [...prevReplies, replyData]);
      
      // Clear the input
      setNewReply('');
      
      // Update discussion replies count
      setDiscussion((prev) => ({
        ...prev,
        replies_count: (prev.replies_count || 0) + 1
      }));
    } catch (err) {
      console.error('Failed to submit reply:', err);
      Alert.alert(
        'Error', 
        `Failed to submit your reply. ${err.message || 'Please try again.'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewProfile = (profileId) => {
    if (profileId) {
      router.push(`/player/${profileId}`);
    } else {
      console.warn("Profile ID is undefined, cannot navigate.");
    }
  };
  
  const renderListHeader = useCallback(() => {
    if (!discussion) return null;
    
    const authorName = discussion.user?.name || 'Unknown Author';
    const authorImage = discussion.user?.avatar_url;
    const discussionDate = formatDate(discussion.created_at);
    const likeCount = discussion.likes_count || 0;
    const replyCount = discussion.replies_count || replies.length || 0;
    
    return (
      <DiscussionHeader 
        discussion={discussion}
        authorName={authorName}
        authorImage={authorImage}
        discussionDate={discussionDate}
        likeCount={likeCount}
        replyCount={replyCount}
        onViewProfile={handleViewProfile}
        onLikeDiscussion={handleLikeDiscussion}
        isLiked={isLiked}
      />
    );
  }, [discussion, replies.length, isLiked]);
  
  const renderEmptyReplies = useCallback(() => {
    return (
      <Text style={styles.emptyText}>No replies yet. Be the first to reply!</Text>
    );
  }, []);
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Discussion...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={fetchDiscussion} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!discussion) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ title: 'Discussion Not Found' }} />
        <Text style={styles.notFoundText}>Discussion not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Discussion',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerRight: () => (
            <Pressable 
              style={styles.headerButton} 
              onPress={() => console.log('Share discussion ID:', discussion.id)}
            >
              <Share2 size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />
      
      <View style={styles.contentContainer}>
        {renderListHeader()}
        
        {replies.length > 0 ? (
          <FlatList
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            data={replies}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ReplyItem 
                reply={item} 
                onViewProfile={handleViewProfile}
                onLike={handleLikeReply}
                isLiked={likedReplies[item.id] || false}
              />
            )}
            ListEmptyComponent={renderEmptyReplies}
          />
        ) : (
          <View style={styles.emptyRepliesContainer}>
            {renderEmptyReplies()}
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            placeholderTextColor={colors.textLight}
            value={newReply}
            onChangeText={setNewReply}
            multiline
            editable={!isSubmitting}
          />
          <Pressable 
            style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
            onPress={handleSubmitReply}
            disabled={isSubmitting || newReply.trim() === ''}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Send size={24} color={newReply.trim() === '' ? colors.textLight : colors.primary} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 20,
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
  notFoundText: {
    fontSize: 18,
    color: colors.textLight,
  },
  headerButton: {
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 16,
  },
  discussionContainer: {
    backgroundColor: colors.card,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: colors.border,
  },
  authorImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dateText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  discussionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  discussionContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textLight,
  },
  repliesHeader: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  replyInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    marginRight: 12,
  },
  sendButton: {
    padding: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  // Reply styles
  replyItem: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  replyAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyAuthorImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: colors.border,
  },
  replyAuthorInfo: {
    flex: 1,
  },
  replyAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  replyDateText: {
    fontSize: 10,
    color: colors.textLight,
  },
  replyContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  replyActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
  },
  replyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 4,
  },
  replyActionText: {
    marginLeft: 6,
    fontSize: 12,
    color: colors.textLight,
  },
  contentContainer: {
    flex: 1,
  },
  emptyRepliesContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});