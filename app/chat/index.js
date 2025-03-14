import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { colors } from '../../constants/colors';

const MOCK_CHATS = [
  {
    id: '1',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
      online: true,
    },
    lastMessage: {
      text: 'See you at the tennis court!',
      time: '2m ago',
      unread: true,
    },
  },
  {
    id: '2',
    user: {
      name: 'Basketball Group',
      avatar: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=200',
      online: false,
      groupChat: true,
    },
    lastMessage: {
      text: 'Mike: Is everyone coming tomorrow?',
      time: '1h ago',
      unread: false,
    },
  },
];

function ChatItem({ chat }) {
  const router = useRouter();

  return (
    <Pressable 
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${chat.id}`)}
    >
      <View style={styles.avatarContainer}>
        <Image source={chat.user.avatar} style={styles.avatar} />
        {chat.user.online && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{chat.user.name}</Text>
          <Text style={styles.messageTime}>{chat.lastMessage.time}</Text>
        </View>
        
        <View style={styles.messagePreview}>
          <Text 
            style={[
              styles.messageText,
              chat.lastMessage.unread && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage.text}
          </Text>
          {chat.lastMessage.unread && (
            <View style={styles.unreadIndicator}>
              <Text style={styles.unreadCount}>1</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function ChatScreen() {
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
        data={MOCK_CHATS}
        renderItem={({ item }) => <ChatItem chat={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
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