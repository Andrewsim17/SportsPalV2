import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Heart, MessageCircle, Share2, MapPin, Clock, Activity, Send } from 'lucide-react-native';
import { colors } from '../../constants/colors';

// Mock activity data
const MOCK_ACTIVITIES = {
  '1': {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    sport: 'running',
    title: 'Morning Run',
    description: 'Beautiful sunrise run along the river. Perfect way to start the day!',
    stats: {
      distance: 5.2,
      pace: '5:30',
      elevation: 125,
      duration: 28,
      calories: 320,
      heartRate: 145,
    },
    date: '2024-02-20T08:00:00Z',
    kudos: 12,
    comments: 3,
    image: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1000',
    liked: false,
    location: 'Riverside Park',
  },
  '2': {
    id: '2',
    userId: 'user2',
    userName: 'Mike Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    sport: 'cycling',
    title: 'Weekend Ride',
    description: 'Challenging hill climbs today but the views were worth it! Made it to the summit in record time.',
    stats: {
      distance: 25.8,
      pace: '18km/h',
      elevation: 350,
      duration: 86,
      calories: 750,
      heartRate: 155,
    },
    date: '2024-02-20T10:00:00Z',
    kudos: 18,
    comments: 5,
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1000',
    liked: true,
    location: 'Mountain Pass',
  },
  '3': {
    id: '3',
    userId: 'user3',
    userName: 'David Lee',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    sport: 'badminton',
    title: 'Badminton Session',
    description: 'Had an amazing badminton session today! Played 5 matches and won 3. My smash technique is definitely improving. Looking forward to the next session!',
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
    location: 'Elite Sports Center',
  },
  '4': {
    id: '4',
    userId: 'user4',
    userName: 'Emma Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    sport: 'basketball',
    title: '3v3 Basketball Game',
    description: 'Great 3v3 game today! Scored 12 points with 5 assists and 8 rebounds. Our team chemistry is getting better with each game. Can\'t wait for the tournament next week!',
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
    location: 'Downtown Sports Center',
  },
};

// Mock comments
const MOCK_COMMENTS = {
  '1': [
    {
      id: '1',
      userId: 'user2',
      userName: 'Mike Chen',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
      text: 'Great pace! Which route did you take?',
      time: '2 hours ago'
    },
    {
      id: '2',
      userId: 'user3',
      userName: 'David Lee',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
      text: 'The sunrise looks amazing! I need to try morning runs.',
      time: '1 day ago'
    }
  ],
  '2': [
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
      text: 'That elevation gain is impressive!',
      time: '3 hours ago'
    },
    {
      id: '2',
      userId: 'user3',
      userName: 'David Lee',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
      text: "Nice stats! You're killing it on the road!",
      time: '1 day ago'
    }
  ],
  '3': [
    {
      id: '1',
      userId: 'user4',
      userName: 'Emma Wilson',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
      text: 'Your smash technique has definitely improved!',
      time: '5 hours ago'
    }
  ],
  '4': [
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
      text: 'Great stats! Those assists are impressive.',
      time: '6 hours ago'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Mike Chen',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
      text: 'Looking forward to watching your tournament!',
      time: '1 day ago'
    }
  ]
};

export default function ActivityDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activity, setActivity] = useState(MOCK_ACTIVITIES[id]);
  const [comments, setComments] = useState(MOCK_COMMENTS[id] || []);
  const [newComment, setNewComment] = useState('');

  if (!activity) {
    return (
      <View style={styles.container}>
        <Text>Activity not found</Text>
      </View>
    );
  }

  const handleToggleLike = () => {
    setActivity({
      ...activity,
      liked: !activity.liked,
      kudos: activity.liked ? activity.kudos - 1 : activity.kudos + 1
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: `new-${Date.now()}`,
      userId: 'currentUser',
      userName: 'You',
      userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200',
      text: newComment,
      time: 'Just now'
    };

    setComments([...comments, newCommentObj]);
    setActivity({
      ...activity,
      comments: activity.comments + 1
    });
    setNewComment('');
  };

  const renderStats = () => {
    if (activity.sport === 'badminton') {
      return (
        <>
          <View style={styles.statItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activity.stats.duration} min</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Activity size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activity.stats.matches}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statItem}>
            <Activity size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activity.stats.wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
        </>
      );
    } else if (activity.sport === 'basketball') {
      return (
        <>
          <View style={styles.statItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activity.stats.duration} min</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Activity size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activity.stats.points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Activity size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activity.stats.assists}</Text>
            <Text style={styles.statLabel}>Assists</Text>
          </View>
          <View style={styles.statItem}>
            <Activity size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activity.stats.rebounds}</Text>
            <Text style={styles.statLabel}>Rebounds</Text>
          </View>
        </>
      );
    } else {
      return (
        <>
          <View style={styles.statItem}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activity.stats.distance} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activity.stats.duration} min</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Activity size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activity.stats.pace}</Text>
            <Text style={styles.statLabel}>Pace</Text>
          </View>
          <View style={styles.statItem}>
            <Activity size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activity.stats.elevation} m</Text>
            <Text style={styles.statLabel}>Elevation</Text>
          </View>
        </>
      );
    }
  };

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
          source={activity.image}
          style={styles.coverImage}
          contentFit="cover"
        />

        <View style={styles.content}>
          <View style={styles.header}>
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

          {activity.description ? (
            <Text style={styles.description}>{activity.description}</Text>
          ) : null}

          <View style={styles.locationContainer}>
            <MapPin size={16} color={colors.textLight} />
            <Text style={styles.locationText}>{activity.location}</Text>
          </View>

          <View style={styles.statsContainer}>
            {renderStats()}
          </View>

          <View style={styles.actionsContainer}>
            <Pressable 
              style={styles.actionButton}
              onPress={handleToggleLike}
            >
              <Heart 
                size={24} 
                color={activity.liked ? colors.danger : colors.text}
                fill={activity.liked ? colors.danger : 'none'}
              />
              <Text style={styles.actionText}>{activity.kudos} Likes</Text>
            </Pressable>

            <Pressable style={styles.actionButton}>
              <MessageCircle size={24} color={colors.text} />
              <Text style={styles.actionText}>{activity.comments} Comments</Text>
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
                    <Text style={styles.commentTime}>{comment.time}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <Pressable 
          style={styles.sendButton}
          onPress={handleAddComment}
        >
          <Send size={20} color={colors.card} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
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
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
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
    marginLeft: 8,
  },
});