import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { colors } from '../../constants/colors';
import { chatApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';
import { supabase, TABLES } from '../../lib/supabase';
import { AlertCircle } from 'lucide-react-native';

function ChatItem({ chat }) {
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
  const isUnread = false;

  return (
    <Pressable 
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${chat.id}`)}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={chat.chatImage || 'https://via.placeholder.com/100x100.png?text=Chat'}
          style={styles.avatar} 
        />
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{chat.chatName || 'Chat'}</Text>
          <Text style={styles.messageTime}>{lastMessageTime}</Text>
        </View>
        
        <View style={styles.messagePreview}>
          <Text 
            style={[
              styles.messageText,
              isUnread && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {lastMessageText}
          </Text>
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

  if (isLoading) {
    return (
       <View style={styles.centeredContainer}>
         <ActivityIndicator size="large" color={colors.primary} />
       </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <AlertCircle size={40} color={colors.danger} style={{ marginBottom: 10 }}/>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={fetchChats} style={styles.retryButton}>
           <Text style={styles.retryButtonText}>Try Again</Text>
         </Pressable>
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

      <FlatList
        data={chatRooms}
        renderItem={({ item }) => <ChatItem chat={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyListText}>No chats yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
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
  list: {
    padding: 16,
  },
  emptyListText: {
     textAlign: 'center',
     marginTop: 50,
     color: colors.textLight,
     fontSize: 16,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.card,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  messageTime: {
    fontSize: 12,
    color: colors.textLight,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    fontSize: 14,
    color: colors.textLight,
    flex: 1,
    marginRight: 5,
  },
  unreadMessage: {
    color: colors.text,
    fontWeight: '500',
  },
  unreadIndicator: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
});