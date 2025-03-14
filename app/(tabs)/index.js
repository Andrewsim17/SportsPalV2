import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, Pressable, Share, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Clock, TrendingUp, Activity as ActivityIcon, Heart, MessageCircle, Share2, Bell, MessageSquare, Plus } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_ACTIVITIES = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    sport: 'running',
    title: 'Morning Run',
    stats: {
      distance: 5.2,
      pace: '5:30',
      elevation: 125,
    },
    date: '2024-02-20T08:00:00Z',
    kudos: 12,
    comments: 3,
    image: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1000',
    liked: false,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    sport: 'cycling',
    title: 'Weekend Ride',
    stats: {
      distance: 25.8,
      pace: '18km/h',
      elevation: 350,
    },
    date: '2024-02-20T10:00:00Z',
    kudos: 18,
    comments: 5,
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1000',
    liked: true,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'David Lee',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    sport: 'badminton',
    title: 'Badminton Session',
    stats: {
      duration: 90,
      matches: 5,
      wins: 3,
      opponents: 'Alex & Sarah',
      location: 'Elite Sports Hall',
    },
    date: '2024-02-19T18:30:00Z',
    kudos: 9,
    comments: 2,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000',
    liked: false,
    description: 'Had an amazing badminton session today! Played 5 matches and won 3. My smash technique is definitely improving. Looking forward to the next session!',
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Emma Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    sport: 'basketball',
    title: '3v3 Basketball Game',
    stats: {
      duration: 60,
      points: 12,
      assists: 5,
      rebounds: 8,
      team: 'Wildcats',
      location: 'Downtown Sports Center',
    },
    date: '2024-02-18T19:00:00Z',
    kudos: 15,
    comments: 4,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000',
    liked: true,
    description: 'Great 3v3 game today! Scored 12 points with 5 assists and 8 rebounds. Our team chemistry is getting better with each game. Can\'t wait for the tournament next week!',
  },
];

const WeeklyStats = () => (
  <LinearGradient
    colors={[colors.primary, colors.primaryLight]}
    style={styles.statsContainer}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={styles.statItem}>
      <Clock size={24} color={colors.card} />
      <Text style={styles.statValue}>5h 23m</Text>
      <Text style={styles.statLabel}>This Week</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <ActivityIcon size={24} color={colors.card} />
      <Text style={styles.statValue}>8</Text>
      <Text style={styles.statLabel}>Activities</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <TrendingUp size={24} color={colors.card} />
      <Text style={styles.statValue}>475m</Text>
      <Text style={styles.statLabel}>Elevation</Text>
    </View>
  </LinearGradient>
);

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
          <Text style={styles.activityDate}>2 hours ago • {activity.sport}</Text>
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
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState(MOCK_ACTIVITIES);
  const router = useRouter();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleToggleLike = (activityId) => {
    setActivities(activities.map(activity => {
      if (activity.id === activityId) {
        const newLiked = !activity.liked;
        return {
          ...activity,
          liked: newLiked,
          kudos: newLiked ? activity.kudos + 1 : activity.kudos - 1
        };
      }
      return activity;
    }));
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
    // Show action sheet to choose between quick post or record activity
    Alert.alert(
      'Add Activity',
      'Choose an option',
      [
        {
          text: 'Record Activity',
          onPress: () => router.push('/activity/record'),
        },
        {
          text: 'Record Live Activity',
          onPress: () => router.push('/activity/record-live'),
        },
        {
          text: 'Quick Post',
          onPress: () => router.push('/activity/record'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

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
                <View style={styles.addButton}>
                  <Plus size={20} color={colors.card} />
                </View>
              </Pressable>
              <Pressable 
                style={styles.headerButton}
                onPress={handleOpenChat}
              >
                <MessageSquare size={24} color={colors.primary} />
                <View style={styles.chatBadge}>
                  <Text style={styles.notificationBadgeText}>2</Text>
                </View>
              </Pressable>
              <Pressable 
                style={styles.headerButton}
                onPress={handleOpenNotifications}
              >
                <Bell size={24} color={colors.primary} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </Pressable>
            </View>
          ),
        }} 
      />
      
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
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={WeeklyStats}
      />
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
  addButton: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  list: {
    paddingBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  statLabel: {
    color: colors.card,
    fontSize: 12,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.card,
    opacity: 0.2,
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
});