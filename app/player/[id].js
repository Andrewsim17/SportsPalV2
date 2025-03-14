import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Dimensions 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Calendar, 
  Award, 
  MessageCircle, 
  UserPlus, 
  Clock, 
  ChevronRight,
  Star,
  Activity,
  Share2
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_PLAYERS = {
  'player1': {
    id: 'player1',
    name: 'Jason Tan',
    username: 'jasontan',
    sports: ['Basketball', 'Volleyball'],
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    location: 'Kuala Lumpur',
    availability: 'Weekends',
    bio: 'Basketball player for 10 years, looking for competitive games and new teammates.',
    stats: {
      gamesPlayed: 87,
      wins: 52,
      achievements: 3
    },
    recentActivities: [
      {
        id: 'act1',
        type: 'Basketball',
        date: '2 days ago',
        location: 'KLCC Courts',
        duration: '1h 45m',
        distance: null,
        score: 'Won 72-65'
      },
      {
        id: 'act2',
        type: 'Running',
        date: '5 days ago',
        location: 'Bukit Jalil Park',
        duration: '32m',
        distance: '5.2 km',
        score: null
      }
    ],
    upcomingGames: [
      {
        id: 'game1',
        type: 'Basketball',
        date: 'Tomorrow, 7:00 PM',
        location: 'Sentral Courts',
        participants: 8
      }
    ]
  },
  'player2': {
    id: 'player2',
    name: 'Emily Wong',
    username: 'emilyw',
    sports: ['Tennis', 'Badminton'],
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    location: 'Petaling Jaya',
    availability: 'Evenings',
    bio: 'Tennis enthusiast looking for regular practice partners. Also enjoy badminton on weekends.',
    stats: {
      gamesPlayed: 42,
      wins: 23,
      achievements: 1
    },
    recentActivities: [
      {
        id: 'act1',
        type: 'Tennis',
        date: '1 day ago',
        location: 'PJ Tennis Club',
        duration: '1h 20m',
        distance: null,
        score: 'Lost 4-6, 3-6'
      }
    ],
    upcomingGames: [
      {
        id: 'game1',
        type: 'Badminton',
        date: 'Saturday, 10:00 AM',
        location: 'Sports Arena',
        participants: 4
      }
    ]
  },
  'player3': {
    id: 'player3',
    name: 'David Lim',
    username: 'davidlim',
    sports: ['Football', 'Running'],
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200',
    location: 'Shah Alam',
    availability: 'Weekdays',
    bio: 'New to sports and looking to improve my fitness. Enjoy casual football games and morning runs.',
    stats: {
      gamesPlayed: 12,
      wins: 5,
      achievements: 0
    },
    recentActivities: [
      {
        id: 'act1',
        type: 'Running',
        date: '3 days ago',
        location: 'Shah Alam Lake Gardens',
        duration: '45m',
        distance: '4.8 km',
        score: null
      }
    ],
    upcomingGames: []
  }
};

export default function PlayerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const player = MOCK_PLAYERS[id];
  const [isFollowing, setIsFollowing] = useState(false);

  if (!player) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Player Not Found',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.primary,
          }}
        />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Player not found</Text>
        </View>
      </View>
    );
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    router.push(`/chat/${player.username}`);
  };

  const handleViewActivity = (activityId) => {
    router.push(`/activity/${activityId}`);
  };

  const handleViewGame = (gameId) => {
    router.push(`/game/${gameId}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: player.name,
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
            source={player.image} 
            style={styles.profileImage}
            contentFit="cover"
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{player.name}</Text>
            <Text style={styles.username}>@{player.username}</Text>
            
            <View style={styles.locationContainer}>
              <MapPin size={16} color={colors.textLight} />
              <Text style={styles.locationText}>{player.location}</Text>
            </View>
            
            <View style={styles.levelContainer}>
              <Award size={16} color={colors.primary} />
              <Text style={styles.levelText}>{player.level}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable 
            style={[
              styles.followButton, 
              isFollowing && styles.followingButton
            ]}
            onPress={handleFollow}
          >
            <UserPlus size={20} color={isFollowing ? colors.card : colors.primary} />
            <Text style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText
            ]}>
              {isFollowing ? 'Following' : 'Follow'}
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

        <View style={styles.bioSection}>
          <Text style={styles.bioText}>{player.bio}</Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{player.stats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{player.stats.wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{player.stats.achievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        <View style={styles.sportsSection}>
          <Text style={styles.sectionTitle}>Sports</Text>
          <View style={styles.sportsContainer}>
            {player.sports.map(sport => (
              <View key={sport} style={styles.sportTag}>
                <Text style={styles.sportTagText}>{sport}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.availabilitySection}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.availabilityContainer}>
            <Clock size={18} color={colors.primary} />
            <Text style={styles.availabilityText}>{player.availability}</Text>
          </View>
        </View>

        {player.recentActivities.length > 0 && (
          <View style={styles.activitiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              <Pressable onPress={() => router.push(`/profile/${player.id}/activities`)}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>
            
            {player.recentActivities.map(activity => (
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

        {player.upcomingGames.length > 0 && (
          <View style={styles.gamesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Games</Text>
              <Pressable onPress={() => router.push(`/profile/${player.id}/games`)}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>
            
            {player.upcomingGames.map(game => (
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
                  <Text style={styles.gameMeta}>{game.date} • {game.location}</Text>
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
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 6,
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
    padding: 16,
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
    padding: 16,
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
    padding: 16,
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
    gap: 8,
  },
  activityDetail: {
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gamesSection: {
    padding: 16,
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textLight,
  },
  shareButton: {
    padding: 8,
  },
});