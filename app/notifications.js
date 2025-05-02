import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Heart, MessageCircle, UserPlus, Calendar, Award } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { notificationsApi } from '../lib/api';
import { useAuthStore } from '../store/auth-store';
import { formatTimeAgo } from '../utils/date';

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

  const displayData = {
    id: notification.id,
    type: notification.type,
    user: notification.sender ? {
      id: notification.sender.id,
      name: notification.sender.name || 'Unknown User',
      avatar: notification.sender.avatar_url || 'https://ui-avatars.com/api/?name=U&background=cccccc&color=fff',
    } : null,
    content: notification.content,
    time: formatTimeAgo(notification.created_at),
    read: notification.is_read,
    link: notification.link,
    activity: notification.type === 'like' || notification.type === 'comment' ? 'your activity' : null,
    comment: notification.type === 'comment' ? '"..."' : null,
  };

  return (
    <Pressable 
      style={[
        styles.notificationItem,
        !displayData.read && styles.unreadNotification
      ]}
      onPress={() => onPress(displayData)}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      
      {displayData.user ? (
        <Image source={displayData.user.avatar} style={styles.avatar} />
      ) : (
        <View style={styles.achievementIcon}>
          <Award size={24} color={colors.card} />
        </View>
      )}
      
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          {displayData.user && (
            <Text style={styles.userName}>{displayData.user.name} </Text>
          )}
          {displayData.content}
          {displayData.activity && (
            <Text style={styles.highlightedText}> {displayData.activity}</Text>
          )}
          {displayData.comment && (
            <Text style={styles.commentText} numberOfLines={1}>"{displayData.comment}"</Text>
          )}
        </Text>
        
        <Text style={styles.timeText}>{displayData.time}</Text>
      </View>
      
      {!displayData.read && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedNotifications = await notificationsApi.getNotifications(user.id);
      setNotifications(fetchedNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationPress = useCallback(async (notification) => {
    setNotifications(prev => 
      prev.map(item => 
        item.id === notification.id ? { ...item, is_read: true } : item
      )
    );
    
    notificationsApi.markNotificationAsRead(notification.id).then(success => {
      if (!success) {
        console.warn(`Failed to mark notification ${notification.id} as read via API.`);
      }
    });

    if (notification.link) {
      console.log('Navigating to link:', notification.link)
      router.push(notification.link);
    } else {
      console.log('No link provided for notification:', notification.id);
    }
  }, [router]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    setNotifications(prev => 
      prev.map(item => ({ ...item, is_read: true }))
    );
    const success = await notificationsApi.markAllNotificationsAsRead(user.id);
    if (!success) {
       console.warn('Failed to mark all notifications as read via API.');
       fetchNotifications(); 
    }
  }, [user?.id, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

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

      {isLoading && notifications.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Pressable onPress={fetchNotifications}>
            <Text style={styles.resetText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
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
            !isLoading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
            )
        }
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
    backgroundColor: `${colors.primary}10`,
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 16, color: colors.danger, textAlign: 'center', marginBottom: 16 },
  resetText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
});