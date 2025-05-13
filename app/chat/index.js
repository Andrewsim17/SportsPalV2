import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { colors } from '../../constants/colors';
import { chatApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';
import { supabase, TABLES } from '../../lib/supabase';
import { AlertCircle, MessageSquare } from 'lucide-react-native';

function ChatItem({ chat, currentUserId }) {
  const router = useRouter();

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "mo";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m";
      return Math.floor(seconds) + "s";
    } catch (e) {
      return 'now';
    }
  };

  const lastMessageText = chat.lastMessage?.content || 'No messages yet';
  const lastMessageTime = formatTimeAgo(chat.lastMessage?.created_at);
  
  // Find my participant record to check if there are unread messages
  const myParticipant = chat.participants?.find(p => p.user_id === currentUserId);
  const lastReadAt = myParticipant?.last_read_at ? new Date(myParticipant.last_read_at) : null;
  const lastMessageAt = chat.lastMessage?.created_at ? new Date(chat.lastMessage.created_at) : null;
  
  // Message is unread if:
  // 1. There is a last message (chat is not empty)
  // 2. The last message is not from the current user
  // 3. Either last_read_at is null or the last message is newer than last_read_at
  const isUnread = lastMessageAt && 
                  chat.lastMessage?.sender_id !== currentUserId &&
                  (!lastReadAt || lastMessageAt > lastReadAt);

  const handlePress = () => {
    router.push(`/chat/${chat.id}`);
  };

  return (
    <Pressable style={styles.chatItem} onPress={handlePress}>
      <Image
        source={chat.chatImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.chatName || 'Chat')}&background=6C5CE7&color=fff`}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.chatDetails}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, isUnread && styles.boldText]}>{chat.chatName || 'Chat'}</Text>
          <Text style={styles.timestamp}>{lastMessageTime}</Text>
        </View>
        <View style={styles.chatPreview}>
          <Text 
            style={[styles.previewText, isUnread && styles.boldText]} 
            numberOfLines={1}
          >
            {chat.lastMessage?.sender_id === currentUserId ? 'You: ' : ''}{lastMessageText}
          </Text>
          {isUnread && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function ChatScreen() {
  const { user } = useAuthStore();
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChats = useCallback(async () => {
    if (!user) {
      setError("User not logged in.");
      setIsLoading(false);
      return;
    }
    console.log('Fetching chat rooms for user:', user.id);
    setIsLoading(true);
    setError(null);
    try {
      const rooms = await chatApi.getMyChatRooms(user.id);
      console.log('Fetched rooms:', rooms);
      rooms.sort((a, b) => {
        const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return timeB - timeA;
      });
      setChatRooms(rooms);
    } catch (err) {
      console.error('Failed to fetch chat rooms:', err);
      setError(err.message || 'Could not load chats.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!user) return;

    const messageSubscription = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLES.MESSAGES },
        (payload) => {
          console.log('New message received (Realtime):', payload.new);
          console.log('Refreshing chat list due to new message...');
          fetchChats();
        }
      )
      .subscribe();

    console.log('Subscribed to message inserts');

    return () => {
      console.log('Unsubscribing from message inserts');
      supabase.removeChannel(messageSubscription);
    };
  }, [user, fetchChats]);

  const renderChatItem = useCallback(({ item }) => (
    <ChatItem chat={item} currentUserId={user?.id} />
  ), [user?.id]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Messages',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />
      
      {error ? (
        <View style={styles.centered}>
          <AlertCircle size={32} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : chatRooms.length === 0 ? (
        <View style={styles.centered}>
          <MessageSquare size={50} color={colors.primary} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start chatting with players to coordinate games</Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  chatDetails: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    color: colors.text,
  },
  boldText: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: colors.textLight,
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    color: colors.textLight,
    flex: 1,
    marginRight: 5,
  },
  unreadIndicator: {
    backgroundColor: colors.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  listContainer: {
    flexGrow: 1,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 14,
    paddingHorizontal: 32,
  },
});