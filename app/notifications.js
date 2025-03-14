import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Heart, MessageCircle, UserPlus, Calendar, Award } from 'lucide-react-native';
import { colors } from '../constants/colors';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'like',
    user: {
      id: 'user2',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    },
    content: 'liked your activity',
    activity: 'Morning Run',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    user: {
      id: 'user3',
      name: 'David Lee',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    },
    content: 'commented on your activity',
    activity: 'Weekend Ride',
    comment: 'Great pace! Which route did you take?',
    time: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    user: {
      id: 'user4',
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    },
    content: 'started following you',
    time: '1 day ago',
    read: false,
  },
  {
    id: '4',
    type: 'game',
    user: {
      id: 'user5',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    },
    content: 'invited you to a game',
    game: 'Tennis Doubles',
    time: '2 days ago',
    read: true,
  },
  {
    id: '5',
    type: 'achievement',
    content: 'You earned a new achievement',
    achievement: 'Early Bird',
    description: 'Complete 5 activities before 8 AM',
    time: '3 days ago',
    read: true,
  },
];

function NotificationItem({ notification, onPress }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart size={20} color={colors.danger} fill={colors.danger} />;
      case 'comment':
        return <MessageCircle size={20} color={colors.primary} />;
      case 'follow':
        return <UserPlus size={20} color={colors.primary} />;
      case 'game':
        return <Calendar size={20} color={colors.primary} />;
      case 'achievement':
        return <Award size={20} color={colors.primary} />;
      default:
        return null;
    }
  };

  return (
    <Pressable 
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification
      ]}
      onPress={() => onPress(notification)}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      
      {notification.user ? (
        <Image source={notification.user.avatar} style={styles.avatar} />
      ) : (
        <View style={styles.achievementIcon}>
          <Award size={24} color={colors.card} />
        </View>
      )}
      
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          {notification.user && (
            <Text style={styles.userName}>{notification.user.name} </Text>
          )}
          {notification.content}
          {notification.activity && (
            <Text style={styles.highlightedText}> {notification.activity}</Text>
          )}
          {notification.game && (
            <Text style={styles.highlightedText}> {notification.game}</Text>
          )}
          {notification.achievement && (
            <Text style={styles.highlightedText}> {notification.achievement}</Text>
          )}
        </Text>
        
        {notification.comment && (
          <Text style={styles.commentText} numberOfLines={1}>"{notification.comment}"</Text>
        )}
        
        {notification.description && (
          <Text style={styles.descriptionText}>{notification.description}</Text>
        )}
        
        <Text style={styles.timeText}>{notification.time}</Text>
      </View>
      
      {!notification.read && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState(MOCK_NOTIFICATIONS);

  const handleNotificationPress = (notification) => {
    // Mark as read
    setNotifications(notifications.map(item => 
      item.id === notification.id ? { ...item, read: true } : item
    ));

    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        router.push(`/activity/${notification.id}`);
        break;
      case 'follow':
        router.push(`/profile/${notification.user.id}`);
        break;
      case 'game':
        router.push(`/game/${notification.id}`);
        break;
      case 'achievement':
        router.push('/achievements');
        break;
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(item => ({ ...item, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Notifications',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          headerRight: () => (
            unreadCount > 0 ? (
              <Pressable onPress={markAllAsRead} style={styles.markReadButton}>
                <Text style={styles.markReadText}>Mark all as read</Text>
              </Pressable>
            ) : null
          ),
        }}
      />

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem 
            notification={item} 
            onPress={handleNotificationPress}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  markReadButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  markReadText: {
    color: colors.primary,
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: `${colors.primary}10`, // Light tint of primary color
  },
  iconContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  userName: {
    fontWeight: '600',
  },
  highlightedText: {
    fontWeight: '600',
  },
  commentText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
  },
});