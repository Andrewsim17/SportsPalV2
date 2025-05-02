import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, Pressable, Share, Alert, Modal, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Clock, TrendingUp, Activity as ActivityIcon, Heart, MessageCircle, Share2, Bell, MessageSquare, Plus, Video, Edit, MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { chatApi, notificationsApi } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth-store';
import { formatTimeAgo } from '../../utils/date';

function ActivityCard({ activity, onToggleLike, onComment, onPress, onShare }) {
  const getSportSpecificStats = () => {
    switch (activity.sport) {
      case 'badminton':
        return (
          <>
            <View style={styles.statGridItem}>
              <Text style={styles.statGridValue}>{activity.stats.duration}min</Text>
              <Text style={styles.statGridLabel}>Duration</Text>
            </View>
            <View style={styles.statGridItem}>
              <Text style={styles.statGridValue}>{activity.stats.matches}</Text>
              <Text style={styles.statGridLabel}>Matches</Text>
            </View>
            <View style={styles.statGridItem}>
              <Text style={styles.statGridValue}>{activity.stats.wins}</Text>
              <Text style={styles.statGridLabel}>Wins</Text>
            </View>
          </>
        );
      case 'basketball':
        return (
          <>
            <View style={styles.statGridItem}>
              <Text style={styles.statGridValue}>{activity.stats.points}</Text>
              <Text style={styles.statGridLabel}>Points</Text>
            </View>
            <View style={styles.statGridItem}>
              <Text style={styles.statGridValue}>{activity.stats.assists}</Text>
              <Text style={styles.statGridLabel}>Assists</Text>
            </View>
            <View style={styles.statGridItem}>
              <Text style={styles.statGridValue}>{activity.stats.rebounds}</Text>
              <Text style={styles.statGridLabel}>Rebounds</Text>
            </View>
          </>
        );
      default:
        return (
          <>
            <View style={styles.statGridItem}>
              <Text style={styles.statGridValue}>{activity.stats.distance}km</Text>
              <Text style={styles.statGridLabel}>Distance</Text>
            </View>
            <View style={styles.statGridItem}>
              <Text style={styles.statGridValue}>{activity.stats.pace}</Text>
              <Text style={styles.statGridLabel}>Avg Pace</Text>
            </View>
            <View style={styles.statGridItem}>
              <Text style={styles.statGridValue}>{activity.stats.elevation}m</Text>
              <Text style={styles.statGridLabel}>Elevation</Text>
            </View>
          </>
        );
    }
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Image
          source={activity.userAvatar}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.headerText}>
          <Text style={styles.userName}>{activity.userName}</Text>
          <Text style={styles.activityDate}>{formatTimeAgo(activity.date)} • {activity.sport}</Text>
        </View>
      </View>

      <Text style={styles.title}>{activity.title}</Text>
      
      <Image
        source={activity.image}
        style={styles.image}
        contentFit="cover"
      />

      <View style={styles.statsGrid}>
        {getSportSpecificStats()}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.actionButtonsLeft}>
          <Pressable 
            style={styles.actionButton} 
            onPress={() => onToggleLike(activity.id)}
          >
            <Heart 
              size={20} 
              color={activity.liked ? colors.danger : colors.textLight} 
              fill={activity.liked ? colors.danger : 'none'} 
            />
            <Text style={styles.actionText}>{activity.kudos}</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => onComment(activity.id)}
          >
            <MessageCircle size={20} color={colors.textLight} />
            <Text style={styles.actionText}>{activity.comments}</Text>
          </Pressable>
        </View>

        <Pressable 
          style={styles.shareButton}
          onPress={() => onShare(activity)}
        >
          <Share2 size={20} color={colors.textLight} />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function FeedScreen() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const router = useRouter();
  const { user } = useAuthStore();

  const fetchActivities = useCallback(async () => {
    console.log("Fetching personalized activities...");
    if (!user?.id) {
      console.log("User not logged in, cannot fetch feed.");
      setIsLoading(false);
      setRefreshing(false);
      setActivities([]); // Clear activities if user logs out
      return;
    }
    if (!refreshing) {
        setIsLoading(true);
    }
    setError(null);
    try {
      // 1. Get IDs of users the current user follows
      const { data: followingData, error: followingError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followingError) {
        throw followingError; // Throw error to be caught by catch block
      }

      // Extract just the IDs into an array and add the current user's ID
      const followingIds = followingData.map(f => f.following_id);
      followingIds.push(user.id); // Include user's own activities

      console.log("Fetching activities for user IDs:", followingIds);

      // 2. Fetch activities from the 'activities' table where user_id is in the list
      // Also fetch related profile info (username, avatar_url)
      // Fetch likes count and comments count using rpc might be more efficient later
      // For now, fetch likes array and comments count directly
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          *,
          user:user_id ( name, avatar_url ),
          likes:activity_likes ( user_id ),
          comments:activity_comments ( count )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(20); // Add a limit for pagination later

      if (activitiesError) {
        throw activitiesError; // Throw error to be caught by catch block
      }

      console.log("Fetched raw activities:", activitiesData.length);

      // 3. Adapt the fetched data to the format expected by ActivityCard
      const adaptedActivities = activitiesData.map(act => {
        const likesList = act.likes || [];
        const currentUserLiked = likesList.some(like => like.user_id === user.id);
        const likeCount = likesList.length;
        
        // Ensure comments count is accessed correctly (it's an array with one object)
        const commentsCount = act.comments && act.comments.length > 0 ? act.comments[0].count : 0;

        return {
          id: act.id,
          userId: act.user?.id, // user_id from the activities table
          userName: act.user?.name || 'Unknown User',
          userAvatar: act.user?.avatar_url || 'https://ui-avatars.com/api/?name=U&background=6C5CE7&color=fff',
          sport: act.type,
          title: act.content,
          stats: act.details || {}, // Assuming 'details' field holds stats
          date: act.created_at,
          kudos: likeCount,
          comments: commentsCount,
          image: null, // TODO: Populate image if available in 'act' (e.g., act.image_url)
          liked: currentUserLiked,
          description: null, // TODO: Populate description if available in 'act'
        };
      });
      
      console.log("Adapted activities:", adaptedActivities.length);
      setActivities(adaptedActivities);

    } catch (err) {
      console.error("Failed to fetch personalized activities:", err);
      setError(err.message || 'Failed to load activities');
      setActivities([]); // Clear activities on error
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      console.log("Finished fetching personalized activities.");
    }
  }, [refreshing, user?.id]);

  // Function to fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching initial unread message count...');
      const count = await chatApi.getUnreadMessageCount(user.id);
      console.log('Initial unread count:', count);
      setUnreadMessageCount(count);
    } catch (error) {
      console.error('Error fetching initial unread count:', error);
    }
  }, [user?.id]);

  // Function to fetch unread notification count
  const fetchUnreadNotificationCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching initial unread notification count...');
      const count = await notificationsApi.getUnreadNotificationCount(user.id);
      console.log('Initial unread notification count:', count);
      setUnreadNotificationCount(count);
    } catch (error) {
      console.error('Error fetching initial unread notification count:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchActivities();
    fetchUnreadCount();
    fetchUnreadNotificationCount();

    // --- Realtime Chat Subscription Setup ---
    if (!user?.id) return; // Need user ID for subscriptions
    console.log('Setting up realtime subscription for ALL new messages...');
    const chatChannel = supabase.channel('public:messages:all')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          console.log('New message detected (any chat):', payload);
          fetchUnreadCount(); // Refetch chat count
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime ALL message subscription established!');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Realtime subscription error:', status, err);
        } else if (status === 'CLOSED') {
          console.log('Realtime message subscription closed.');
        }
      });

    // --- Realtime Notification Subscription Setup ---
    console.log('Setting up realtime subscription for new notifications...');
    const notificationChannel = supabase.channel('public:notifications:user') // Unique channel name
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${user.id}` // Filter for user's notifications
        }, 
        (payload) => {
          console.log('New notification received:', payload);
          // Refetch the count when a new notification arrives for the user
          fetchUnreadNotificationCount(); 
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime notification subscription established!');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Realtime notification subscription error:', status, err);
        } else if (status === 'CLOSED') {
          console.log('Realtime notification subscription closed.');
        }
      });

    // --- Cleanup Function ---
    return () => {
      console.log('Removing realtime subscriptions...');
      supabase.removeChannel(chatChannel).catch(error => console.error('Error removing chat channel:', error));
      supabase.removeChannel(notificationChannel).catch(error => console.error('Error removing notification channel:', error));
    };
    
  }, [fetchActivities, fetchUnreadCount, fetchUnreadNotificationCount, user?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchActivities(); // Refetch on pull-to-refresh
  }, [fetchActivities]);

  const handleToggleLike = async (activityId) => { // Make async
    if (!user) {
      Alert.alert('Login Required', 'Please log in to like activities.');
      return;
    }

    // Find the current state before toggling
    const originalActivities = [...activities];
    const activityIndex = activities.findIndex(act => act.id === activityId);
    if (activityIndex === -1) return;
    
    const activity = activities[activityIndex];
    const wasLiked = activity.liked;
    const newLiked = !wasLiked;
    const newKudos = newLiked ? activity.kudos + 1 : activity.kudos - 1;

    // 1. Optimistic UI Update
    setActivities(currentActivities => 
      currentActivities.map(act => 
        act.id === activityId 
          ? { ...act, liked: newLiked, kudos: Math.max(0, newKudos) }
          : act
      )
    );

    // 2. API Call
    try {
      if (newLiked) {
        console.log(`API: Liking activity ${activityId} for user ${user.id}`);
        await activitiesApi.likeActivity(activityId, user.id);
        console.log(`API: Liked activity ${activityId} successfully.`);
      } else {
        console.log(`API: Unliking activity ${activityId} for user ${user.id}`);
        await activitiesApi.unlikeActivity(activityId, user.id);
        console.log(`API: Unliked activity ${activityId} successfully.`);
      }
    } catch (error) {
      console.error(`Failed to ${newLiked ? 'like' : 'unlike'} activity ${activityId}:`, error);
      
      // Check if it's a duplicate key error during a LIKE attempt
      const isDuplicateLikeError = newLiked && error?.code === '23505';
      
      if (isDuplicateLikeError) {
        // It's already liked in the DB, which matches our optimistic UI update.
        // Log it, but don't revert or show a generic error alert.
        console.log(`Info: Activity ${activityId} already liked by user ${user.id}. UI state consistent.`);
      } else {
        // For any other error, or errors during UNLIKE, show alert and revert UI.
        Alert.alert('Error', `Could not ${newLiked ? 'like' : 'unlike'} the activity. Please try again.`);
        // Revert UI on Error
        setActivities(originalActivities); 
      }
    }
  };

  const handleComment = (activityId) => {
    router.push(`/activity/${activityId}`);
  };

  const handleActivityPress = (activityId) => {
    router.push(`/activity/${activityId}`);
  };

  const handleShareActivity = async (activity) => {
    try {
      const result = await Share.share({
        message: `Check out ${activity.userName}'s ${activity.sport} activity: ${activity.title}`,
        title: 'Share Activity',
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleOpenNotifications = () => {
    router.push('/notifications');
  };

  const handleOpenChat = () => {
    router.push('/chat');
  };

  const handleAddActivity = () => {
    setShowAddMenu(!showAddMenu);
  };

  const handleRecordActivity = () => {
    setShowAddMenu(false);
    router.push('/activity/record');
  };

  const handleRecordLiveActivity = () => {
    setShowAddMenu(false);
    router.push('/activity/record-live');
  };

  const handleQuickPost = () => {
    setShowAddMenu(false);
    router.push('/activity/record');
  };

  const renderContent = () => {
    if (isLoading && activities.length === 0) {
      return <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />;
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Pressable onPress={fetchActivities}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <FlatList
        data={activities}
        renderItem={({ item }) => (
          <ActivityCard 
            activity={item} 
            onToggleLike={handleToggleLike}
            onComment={handleComment}
            onPress={() => handleActivityPress(item.id)}
            onShare={handleShareActivity}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No activities found in your feed yet.</Text>
              <Pressable onPress={onRefresh}>
                 <Text style={styles.retryText}>Refresh Feed</Text>
              </Pressable>
            </View>
          )
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Home',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable 
                style={styles.headerButton}
                onPress={handleAddActivity}
              >
                 <Plus size={24} color={colors.primary} /> 
              </Pressable>
              
              <Pressable 
                style={styles.headerButton}
                onPress={handleOpenNotifications}
              >
                <Bell size={24} color={colors.primary} />
                {unreadNotificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </Text>
                </View>
                )}
              </Pressable>
              
              <Pressable 
                style={styles.headerButton}
                onPress={handleOpenChat}
              >
                <MessageSquare size={24} color={colors.primary} />
                {unreadMessageCount > 0 && (
                <View style={styles.chatBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                    </Text>
                </View>
                )}
              </Pressable>
            </View>
          ),
        }} 
      />
      
      {showAddMenu && (
        <Modal
          transparent={true}
          visible={showAddMenu}
          animationType="fade"
          onRequestClose={() => setShowAddMenu(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowAddMenu(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.addMenuContainer}>
                <Pressable 
                  style={styles.addMenuItem}
                  onPress={handleRecordActivity}
                >
                  <View style={[styles.addMenuIcon, { backgroundColor: colors.primary }]}>
                    <Edit size={20} color={colors.card} />
                  </View>
                  <View style={styles.addMenuTextContainer}>
                    <Text style={styles.addMenuTitle}>Record Activity</Text>
                    <Text style={styles.addMenuDescription}>Log a completed activity</Text>
                  </View>
                </Pressable>
                
                <Pressable 
                  style={styles.addMenuItem}
                  onPress={handleRecordLiveActivity}
                >
                  <View style={[styles.addMenuIcon, { backgroundColor: colors.danger }]}>
                    <Video size={20} color={colors.card} />
                  </View>
                  <View style={styles.addMenuTextContainer}>
                    <Text style={styles.addMenuTitle}>Record Live Activity</Text>
                    <Text style={styles.addMenuDescription}>Track your activity in real-time</Text>
                  </View>
                </Pressable>
                
                <Pressable 
                  style={styles.addMenuItem}
                  onPress={handleQuickPost}
                >
                  <View style={[styles.addMenuIcon, { backgroundColor: colors.success }]}>
                    <MapPin size={20} color={colors.card} />
                  </View>
                  <View style={styles.addMenuTextContainer}>
                    <Text style={styles.addMenuTitle}>Quick Post</Text>
                    <Text style={styles.addMenuDescription}>Share a quick update</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 8,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  chatBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  notificationBadgeText: {
    color: colors.card,
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activityDate: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    paddingHorizontal: 16,
    paddingBottom: 12,
    lineHeight: 20,
  },
  image: {
    width: '100%',
    height: 200,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  statGridValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statGridLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  extraDetails: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },
  extraDetailText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
  },
  extraDetailLabel: {
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtonsLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareButton: {
    padding: 4,
  },
  actionText: {
    fontSize: 14,
    color: colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  addMenuContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    width: 280,
  },
  addMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  addMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addMenuTextContainer: {
    flex: 1,
  },
  addMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  addMenuDescription: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
});