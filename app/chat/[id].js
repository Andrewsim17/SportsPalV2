import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Send, AlertCircle, ChevronLeft } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { chatApi, profilesApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';
import { supabase, TABLES } from '../../lib/supabase';

function Message({ message, currentUserId, isLastInGroup }) {
  const isMe = message.sender.id === currentUserId;

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <View style={[
      styles.messageContainer,
      isMe ? styles.myMessage : styles.otherMessage,
      isLastInGroup && (isMe ? styles.lastMyMessage : styles.lastOtherMessage)
    ]}>
      {!isMe && (
         <View style={styles.avatarContainer}>
           {isLastInGroup && (
         <Image 
                source={message.sender.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.name || 'U')}&background=6C5CE7&color=fff`} 
            style={styles.avatar} 
         />
           )}
         </View>
      )}
      <View style={styles.bubbleContainer}>
      <View style={[
        styles.messageBubble,
          isMe ? styles.myBubble : styles.otherBubble,
          isLastInGroup && (isMe ? styles.lastMyBubble : styles.lastOtherBubble)
      ]}>
        <Text style={[
          styles.messageText,
          isMe ? styles.myMessageText : styles.otherMessageText
        ]}>
              {message.content} 
            </Text>
          </View>
        {isLastInGroup && (
          <Text style={[styles.messageTime, isMe ? styles.myTime : styles.otherTime]}>
             {formatTime(message.created_at)} 
        </Text>
        )}
      </View>
    </View>
  );
}

export default function ChatRoomScreen() {
  const { id: chatId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headerTitle, setHeaderTitle] = useState('Chat');
  const [headerImage, setHeaderImage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const flatListRef = useRef();

  const fetchInitialData = useCallback(async () => {
    if (!chatId || !user) {
        setError("Chat ID or User missing.");
        setIsLoading(false);
        return;
    }
    console.log('Fetching initial messages for chat:', chatId);
    setIsLoading(true);
    setError(null);
    try {
      const initialMessages = await chatApi.getMessagesForChat(chatId);
      setMessages(initialMessages);

      const { data: participants, error: pError } = await supabase
          .from(TABLES.CHAT_PARTICIPANTS)
          .select('user:profiles(id, name, avatar_url)')
          .eq('chat_id', chatId)
          .neq('user_id', user.id)
          .limit(1);
      if (pError) console.error("Error fetching participant:", pError);
      if (participants && participants.length > 0) {
          setHeaderTitle(participants[0].user?.name || 'Chat');
          setHeaderImage(participants[0].user?.avatar_url);
      } else {
          setHeaderTitle('Chat'); 
      }
      
      // Mark chat as read when the user opens it
      const success = await chatApi.markChatAsRead(chatId, user.id);
      if (!success) {
        console.warn('Failed to mark chat as read on initial load');
      } else {
        console.log('Chat marked as read successfully on initial load');
      }
      
    } catch (err) {
      console.error('Failed to fetch initial chat data:', err);
      setError(err.message || 'Could not load chat.');
    } finally {
      setIsLoading(false);
    }
  }, [chatId, user]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (!chatId) return;

    const messageSubscription = supabase
      .channel(`public:messages:chat_id=eq.${chatId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: TABLES.MESSAGES,
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          console.log('New message received in this chat (Realtime):', payload.new);
           try {
               const { data: senderProfile, error: profileError } = await supabase
                   .from(TABLES.PROFILES)
                   .select('*')
                   .eq('id', payload.new.sender_id)
                   .single();
               
               if (profileError) throw profileError;
    
               const newMessage = {
                   ...payload.new,
                   sender: senderProfile
               };
               setMessages((currentMessages) => [...currentMessages, newMessage]);
               
               // If the new message is from someone else, mark the chat as read since we're viewing it
               if (payload.new.sender_id !== user?.id) {
                 chatApi.markChatAsRead(chatId, user.id);
               }
           } catch (err) {
               console.error("Error processing new message sender:", err);
           }
        }
      )
      .subscribe();

    console.log(`Subscribed to message inserts for chat ${chatId}`);

    return () => {
      console.log(`Unsubscribing from message inserts for chat ${chatId}`);
      supabase.removeChannel(messageSubscription);
    };
  }, [chatId, user]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !chatId || isSending) return;
    
    const content = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      // Create a temporary message object to show immediately in UI
      const tempMessage = {
        id: `temp-${Date.now()}`,
        chat_id: chatId,
        sender_id: user.id,
        content: content,
        created_at: new Date().toISOString(),
        sender: user // Use the current user object
      };
      
      // Add message to UI immediately
      setMessages(currentMessages => [...currentMessages, tempMessage]);
      
      // Send to server
      const sentMessage = await chatApi.sendMessage(chatId, user.id, content);
      console.log('Message sent successfully via API:', sentMessage);
      
      // Replace temp message with real one if needed
      // This step is optional since the subscription should handle this
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert('Error', 'Could not send message. Please try again.');
      setMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  // Group messages by sender
  const renderMessage = ({ item, index }) => {
    // A message is considered the last in its group if:
    // 1. It's the very last message in the chat
    // 2. The next message is from a different sender
    // 3. The next message is more than 2 minutes apart
    const isLastInGroup = index === messages.length - 1 || 
                      messages[index + 1]?.sender_id !== item.sender_id ||
                      (new Date(messages[index + 1]?.created_at).getTime() - new Date(item.created_at).getTime() > 2 * 60 * 1000);
    
    return <Message message={item} currentUserId={user?.id} isLastInGroup={isLastInGroup} />;
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages]);

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
        <Pressable onPress={fetchInitialData} style={styles.retryButton}>
           <Text style={styles.retryButtonText}>Try Again</Text>
         </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              {headerImage && (
                <Image 
                  source={headerImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(headerTitle)}&background=6C5CE7&color=fff`} 
                  style={styles.headerAvatar}
                  contentFit="cover"
                />
              )}
              <Text style={styles.headerTitle}>{headerTitle}</Text>
            </View>
          ),
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ChevronLeft size={24} color={colors.primary} />
            </Pressable>
          ),
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={<Text style={styles.emptyListText}>Send your first message!</Text>}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
            placeholder="Message..."
          placeholderTextColor={colors.textLight}
          value={message}
          onChangeText={setMessage}
          multiline
          editable={!isSending}
        />
          <Pressable 
            onPress={handleSendMessage} 
            disabled={isSending || !message.trim()}
            style={styles.sendButtonContainer}
          > 
           {isSending ? (
                <ActivityIndicator size="small" color={colors.card} />
           ) : (
          <Send 
                size={20} 
                color={colors.card}
          />
           )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  headerButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
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
  messagesList: {
    padding: 10,
    flexGrow: 1,
  },
   emptyListText: {
     textAlign: 'center',
     marginTop: 50,
     color: colors.textLight,
     fontSize: 16,
  },
  messageContainer: {
    marginVertical: 2,
    flexDirection: 'row',
    width: '100%',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  lastMyMessage: {
    marginBottom: 12,
  },
  lastOtherMessage: {
    marginBottom: 12,
  },
  avatarContainer: {
      width: 36,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
   },
  bubbleContainer: {
     maxWidth: '80%',
    flexDirection: 'column',
  },
  messageBubble: {
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: '100%',
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  otherBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  lastMyBubble: {
    borderBottomRightRadius: 18,
  },
  lastOtherBubble: {
    borderBottomLeftRadius: 18,
  },
  messageText: {
    fontSize: 15,
  },
  myMessageText: {
    color: colors.card,
  },
  otherMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  myTime: {
     alignSelf: 'flex-end',
  },
  otherTime: {
     alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: colors.text,
  },
  sendButtonContainer: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});