import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { 
  Heart, 
  MessageCircle, 
  User,
  ChevronRight
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { getPublicUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

// Remove hardcoded heart color and use colors.danger for consistency with ActivityCard
// const HEART_COLOR = '#FF3B30'; // Apple's red color

export default function DiscussionItem({ discussion = {}, onRefresh }) {
  // Add null checks for missing discussion object
  if (!discussion || !discussion.id) {
    console.log('Invalid discussion data:', discussion);
    return null;
  }
  
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [repliesCount, setRepliesCount] = useState(discussion.replies_count || 0);
  
  // Use the correct field names from the data structure with null checks
  const authorName = discussion.authorName || 'Community Member';
  const authorId = discussion.authorId;
  
  // Process avatar URL
  const getAvatarUrl = () => {
    const rawAvatarUrl = discussion.authorImage;
    
    // If no avatar_url, generate a UI avatar with the first letter of the name
    if (!rawAvatarUrl) {
      const firstLetter = (authorName || 'U').charAt(0);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=6C5CE7&color=fff`;
    }
    
    // If it's a storage path (not a full URL), get the public URL
    if (rawAvatarUrl && !rawAvatarUrl.startsWith('http')) {
      return getPublicUrl(rawAvatarUrl);
    }
    
    // Return as is if it's already a valid URL
    return rawAvatarUrl;
  };
  
  const avatarUrl = getAvatarUrl();
  
  // Format the date - using the correct field name (createdAt)
  const formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }
    
    try {
      const formattedDate = new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      return formattedDate;
    } catch (e) {
      console.warn('Error formatting date:', e);
      return '';
    }
  };
  
  // Use createdAt instead of created_at
  const formattedDate = formatDate(discussion.createdAt);

  // Helper function to fetch likes count
  const fetchLikesCount = async () => {
    if (!discussion.id) return;
    
    try {
      // Count the likes directly from the discussion_likes table
      const { count, error } = await supabase
        .from('discussion_likes')
        .select('id', { count: 'exact', head: true })
        .eq('discussion_id', discussion.id);
      
      if (error) {
        console.error('Error fetching likes count:', error);
        return;
      }
      
      console.log(`Fetched likes count for discussion ${discussion.id}: ${count}`);
      setLikesCount(count || 0);
    } catch (error) {
      console.error('Error in fetchLikesCount:', error);
    }
  };
  
  // Check if the current user has liked this discussion and get likes count
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !discussion.id) return;
      
      try {
        // Check if user has liked this discussion
        const { data, error } = await supabase
          .from('discussion_likes')
          .select('id')
          .eq('discussion_id', discussion.id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking like status:', error);
          return;
        }
        
        setIsLiked(!!data);
        
        // Also fetch the total likes count
        await fetchLikesCount();
      } catch (error) {
        console.error('Error in like status check:', error);
      }
    };
    
    checkLikeStatus();
  }, [discussion.id, user]);

  const handleViewProfile = (playerId) => {
    if (!playerId) return;
    router.push(`/player/${playerId}`);
  };
  
  const handleLike = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You need to be logged in to like discussions.');
      router.push('/auth/login');
      return;
    }
    
    if (!discussion.id) {
      console.error('Discussion ID is missing');
      return;
    }
    
    try {
      console.log('Current like state:', isLiked, 'Current like count:', likesCount);
      
      if (isLiked) {
        // Unlike the discussion
        const { error } = await supabase
          .from('discussion_likes')
          .delete()
          .eq('discussion_id', discussion.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        console.log('Successfully unliked');
        setIsLiked(false);
        
        // Fetch the updated likes count
        await fetchLikesCount();
      } else {
        // Like the discussion
        const { error } = await supabase
          .from('discussion_likes')
          .insert({
            discussion_id: discussion.id,
            user_id: user.id
          });
          
        if (error) throw error;
        
        console.log('Successfully liked');
        setIsLiked(true);
        
        // Fetch the updated likes count
        await fetchLikesCount();
      }
      
      // Refresh the parent component
      if (onRefresh) {
        console.log('Triggering refresh after like action');
        onRefresh();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like status.');
    }
  };
  
  const handleViewDiscussion = () => {
    if (!discussion.id) {
      console.error('Discussion ID is missing');
      return;
    }
    router.push(`/community/discussion/${discussion.id}`);
  };

  return (
    <Pressable style={styles.discussionContainer} onPress={handleViewDiscussion}>
      <View style={styles.authorContainer}>
        <Pressable onPress={() => handleViewProfile(authorId)}>
          {avatarUrl ? (
          <Image 
              source={{ uri: avatarUrl }} 
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
          {authorName ? (
            <Pressable onPress={() => handleViewProfile(authorId)}>
              <Text style={styles.authorName}>{authorName}</Text>
          </Pressable>
          ) : (
            <Text style={styles.authorName}>Community Member</Text>
          )}
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>

      <Text style={styles.discussionTitle}>{discussion.title}</Text>

      <View style={styles.actionsContainer}>
        <Pressable 
          style={styles.actionButton}
          onPress={handleLike}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Heart 
            size={20} 
            color={isLiked ? colors.danger : colors.textLight}
            fill={isLiked ? colors.danger : 'none'}
          />
          <Text 
            style={[
              styles.actionText, 
              isLiked && { color: colors.danger }
            ]}
          >
            {likesCount}
          </Text>
        </Pressable>

        <Pressable 
          style={styles.actionButton} 
          onPress={handleViewDiscussion}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <MessageCircle size={20} color={colors.textLight} />
          <Text style={styles.actionText}>
            {repliesCount}
          </Text>
        </Pressable>
        
        <ChevronRight size={20} color={colors.textLight} style={styles.rightArrow} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  discussionContainer: {
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8, // Add spacing between posts
    borderRadius: 12,
    borderWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    shadowColor: 'transparent',
    elevation: 0,
    zIndex: 1,
    position: 'relative',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorImagePlaceholder: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: colors.textLight,
  },
  discussionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingTop: 4,
    alignItems: 'center', // Align items vertically
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  rightArrow: {
    marginLeft: 'auto', // This pushes the arrow to the right side
  },
});