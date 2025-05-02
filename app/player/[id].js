import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Calendar, 
  Award, 
  MessageCircle, 
  UserPlus, 
  UserCheck,
  Clock, 
  ChevronRight,
  Star,
  Activity,
  Share2,
  AlertCircle
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { profilesApi, activitiesApi, gamesApi, socialApi, chatApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatTimeAgo, formatDateTime } from '../../utils/date';

export default function PlayerDetailsScreen() {
  const { id: profileId } = useLocalSearchParams();
  const router = useRouter();
  const { user, refreshProfile } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!profileId) {
      setError("Profile ID not provided.");
      setIsLoading(false);
      return;
    }
    console.log('Fetching data for profile:', profileId);
    setIsLoading(true);
    setError(null);

    try {
      const [fetchedProfile, fetchedActivities, fetchedGames, followingList] = await Promise.all([
        profilesApi.getProfile(profileId),
        activitiesApi.getUserActivities(profileId, 5),
        gamesApi.getUserGames(profileId),
        user ? socialApi.getFollowing(user.id) : Promise.resolve([])
      ]);

      console.log('Fetched Profile:', fetchedProfile);
      console.log('Fetched Activities:', fetchedActivities);
      console.log('Fetched Games:', fetchedGames);
      console.log('Following List (IDs):', followingList);

      if (!fetchedProfile) {
        throw new Error('Profile not found');
      }

      setProfile(fetchedProfile);

      const adaptedActivities = fetchedActivities.map(act => ({
        id: act.id,
        type: act.sport || act.type,
        date: formatTimeAgo(act.created_at),
        location: act.details?.location_name || act.game?.location || 'Location N/A',
        duration: act.details?.duration_min ? `${act.details.duration_min} min` : null,
        distance: act.details?.distance_km ? `${act.details.distance_km.toFixed(1)} km` : null,
        score: act.details?.score || act.game?.score || null,
        content: act.content
      }));
      setRecentActivities(adaptedActivities);

      const adaptedGames = fetchedGames
        .filter(game => new Date(game.date) > new Date())
        .map(game => ({
           id: game.id,
           type: game.sport,
           date: game.date,
           location: game.venue?.name || game.location || 'Location N/A',
           participants: game.participants,
           maxParticipants: game.max_participants || null,
           title: game.name || `${game.sport} Game`
        }));
      setUpcomingGames(adaptedGames);

      if (user && followingList?.includes(profileId)) {
         setIsFollowing(true);
      } else {
         setIsFollowing(false);
      }

    } catch (err) {
      console.error('Failed to fetch player data:', err);
      if (err.code === 'PGRST201' || err.message.includes('PGRST201')) {
         setError('Could not load profile details due to a data relationship issue. Please report this.');
      } else {
         setError(err.message || 'Failed to load profile details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [profileId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFollowToggle = async () => {
     if (!user || isFollowLoading || !profile) return;

     setIsFollowLoading(true);
     const currentlyFollowing = isFollowing;

     setIsFollowing(!currentlyFollowing);

     try {
        if (currentlyFollowing) {
           await socialApi.unfollowUser(user.id, profile.id);
           console.log('Unfollowed user');
        } else {
           await socialApi.followUser(user.id, profile.id);
           console.log('Followed user');
        }
        
        // Refresh the profile data to update follower/following counts
        await refreshProfile();
        
     } catch (err) {
        console.error(`Failed to ${currentlyFollowing ? 'unfollow' : 'follow'} user:`, err);
        Alert.alert('Error', `Could not ${currentlyFollowing ? 'unfollow' : 'follow'}. Please try again.`);
        setIsFollowing(currentlyFollowing);
     } finally {
        setIsFollowLoading(false);
     }
  };

  const handleMessage = async () => {
    if (!user || !profile?.id) {
      Alert.alert("Error", "Cannot initiate chat. User or profile information missing.");
      return;
    }
    if (user.id === profile.id) {
      Alert.alert("Info", "You cannot message yourself.");
      return;
    }

    console.log(`Attempting to find or create chat between ${user.id} and ${profile.id}`);
    
    try {
      const chatRoom = await chatApi.findOrCreateChatRoom(user.id, profile.id);
      
      if (chatRoom && chatRoom.id) {
        console.log(`Navigating to chat with ID: ${chatRoom.id}`);
        router.push(`/chat/${chatRoom.id}`);
      } else {
        Alert.alert("Error", "Could not find or create chat room.");
      }
    } catch (error) {
      console.error("Error finding/creating chat room:", error);
      Alert.alert("Error", "An error occurred while trying to open the chat.");
    }
  };

  const handleViewActivity = (activityId) => {
     if (!activityId) return;
    console.log('Navigate to activity:', activityId);
    router.push(`/activity/${activityId}`);
  };

  const handleViewGame = (gameId) => {
     if (!gameId) return;
    console.log('Navigate to game:', gameId);
    router.push(`/game/${gameId}`);
  };

  if (isLoading) {
    return (
       <View style={styles.loadingContainer}>
          <Stack.Screen options={{ title: 'Loading Profile...' }} />
          <ActivityIndicator size="large" color={colors.primary} />
       </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Error' }} />
        <AlertCircle size={40} color={colors.danger} />
        <Text style={styles.errorText}>{error || 'Profile data could not be loaded.'}</Text>
        {error && (
             <Pressable onPress={fetchData} style={styles.retryButton}>
               <Text style={styles.retryButtonText}>Try Again</Text>
             </Pressable>
         )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: profile.name || 'Player Profile',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerRight: () => (
            <Pressable style={styles.shareButton} onPress={() => console.log('Share profile')}>
              <Share2 size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView>
        <View style={styles.header}>
          <Image 
            source={profile.avatar_url || 'https://via.placeholder.com/100'}
            style={styles.profileImage}
            contentFit="cover"
            placeholder={{uri: 'https://via.placeholder.com/100'}}
            transition={300}
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.username}>@{profile.username}</Text>
            
            {profile.location && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color={colors.textLight} />
                <Text style={styles.locationText}>{profile.location}</Text>
            </View>
            )}
            
            {profile.level && (
            <View style={styles.levelContainer}>
              <Award size={16} color={colors.primary} />
                  <Text style={styles.levelText}>{profile.level}</Text>
               </View>
            )}
             <View style={styles.followCounts}>
                <Text style={styles.followCountText}>
                   {profile.follower_count ?? 0} <Text style={styles.followCountLabel}>Followers</Text>
                </Text>
                <Text style={styles.followCountText}> • </Text>
                <Text style={styles.followCountText}>
                   {profile.following_count ?? 0} <Text style={styles.followCountLabel}>Following</Text>
                </Text>
            </View>
          </View>
        </View>

        {user?.id !== profile.id && (
        <View style={styles.actionButtons}>
          <Pressable 
            style={[
              styles.followButton, 
                    isFollowing && styles.followingButton,
                    isFollowLoading && styles.disabledButton
                 ]}
                 onPress={handleFollowToggle}
                 disabled={isFollowLoading}
              >
                 {isFollowLoading ? (
                    <ActivityIndicator size="small" color={isFollowing ? colors.primary : colors.card} />
                 ) : isFollowing ? (
                    <UserCheck size={20} color={colors.card} />
                 ) : (
                    <UserPlus size={20} color={colors.primary} />
                 )}
            <Text style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText
            ]}>
                    {isFollowLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
          
          <Pressable 
            style={styles.messageButton}
            onPress={handleMessage}
          >
            <MessageCircle size={20} color={colors.card} />
            <Text style={styles.messageButtonText}>Message</Text>
          </Pressable>
        </View>
        )}

        {profile.bio && (
        <View style={styles.bioSection}>
            <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
        )}

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats?.gamesPlayed ?? '-'}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats?.wins ?? '-'}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats?.achievements ?? '-'}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        {profile.sports && profile.sports.length > 0 && (
        <View style={styles.sportsSection}>
          <Text style={styles.sectionTitle}>Sports</Text>
          <View style={styles.sportsContainer}>
              {profile.sports.map(sport => (
              <View key={sport} style={styles.sportTag}>
                <Text style={styles.sportTagText}>{sport}</Text>
              </View>
            ))}
          </View>
        </View>
        )}

        {recentActivities.length > 0 && (
          <View style={styles.activitiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              <Pressable onPress={() => router.push(`/player/${profileId}/activities`)}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>
            
            {recentActivities.map(activity => (
              <Pressable 
                key={activity.id} 
                style={styles.activityCard}
                onPress={() => handleViewActivity(activity.id)}
              >
                <View style={styles.activityIconContainer}>
                  <Activity size={20} color={colors.primary} />
                </View>
                
                <View style={styles.activityInfo}>
                  <Text style={styles.activityType}>{activity.type}</Text>
                  <Text style={styles.activityMeta}>{activity.date} • {activity.location}</Text>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityDetail}>
                      {activity.duration}
                    </Text>
                    {activity.distance && (
                      <Text style={styles.activityDetail}>
                        {activity.distance}
                      </Text>
                    )}
                    {activity.score && (
                      <Text style={styles.activityDetail}>
                        {activity.score}
                      </Text>
                    )}
                  </View>
                </View>
                
                <ChevronRight size={20} color={colors.textLight} />
              </Pressable>
            ))}
          </View>
        )}

        {upcomingGames.length > 0 && (
          <View style={styles.gamesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Games</Text>
              <Pressable onPress={() => router.push(`/player/${profileId}/games`)}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>
            
            {upcomingGames.map(game => (
              <Pressable 
                key={game.id} 
                style={styles.gameCard}
                onPress={() => handleViewGame(game.id)}
              >
                <View style={styles.gameIconContainer}>
                  <Calendar size={20} color={colors.primary} />
                </View>
                
                <View style={styles.gameInfo}>
                  <Text style={styles.gameType}>{game.type}</Text>
                  <Text style={styles.gameMeta}>{formatDateTime(game.date)} • {game.location}</Text>
                  <Text style={styles.gameParticipants}>
                    {game.participants} participants
                  </Text>
                </View>
                
                <ChevronRight size={20} color={colors.textLight} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
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
     backgroundColor: colors.background,
  },
  errorContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     padding: 20,
     backgroundColor: colors.background,
  },
  errorText: {
     fontSize: 16,
     color: colors.danger,
     textAlign: 'center',
     marginTop: 10,
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
     fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.card,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 6,
  },
  followCounts: {
     flexDirection: 'row',
     alignItems: 'center',
     marginTop: 4,
  },
  followCountText: {
     fontSize: 14,
     color: colors.textLight,
  },
  followCountLabel: {
      fontWeight: '500',
      color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followingButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  followButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.card,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  messageButtonText: {
    color: colors.card,
    fontWeight: '600',
  },
  disabledButton: {
     opacity: 0.7,
  },
  bioSection: {
    padding: 16,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  sportsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sportTagText: {
    fontSize: 14,
    color: colors.card,
    fontWeight: '500',
  },
  availabilitySection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  activitiesSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityDetail: {
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gamesSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  gameIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gameInfo: {
    flex: 1,
  },
  gameType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  gameMeta: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  gameParticipants: {
    fontSize: 14,
    color: colors.text,
  },
  shareButton: {
    padding: 8,
  },
});