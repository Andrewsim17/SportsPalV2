import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Send } from 'lucide-react-native';
import { colors } from '../../constants/colors';

const MOCK_MESSAGES = [
  {
    id: '1',
    text: 'Hey, are we still on for tennis tomorrow?',
    sender: 'other',
    time: '10:30 AM',
  },
  {
    id: '2',
    text: 'Yes, definitely! Same time at 2 PM?',
    sender: 'me',
    time: '10:31 AM',
  },
  {
    id: '3',
    text: "Perfect! I will bring some new balls",
    sender: 'other',
    time: '10:32 AM',
  },
];

function Message({ message }) {
  const isMe = message.sender === 'me';

  return (
    <View style={[
      styles.messageContainer,
      isMe ? styles.myMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        isMe ? styles.myBubble : styles.otherBubble
      ]}>
        <Text style={[
          styles.messageText,
          isMe ? styles.myMessageText : styles.otherMessageText
        ]}>
          {message.text}
        </Text>
      </View>
      <Text style={styles.messageTime}>{message.time}</Text>
    </View>
  );
}

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const sendMessage = () => {
    if (message.trim() === '') return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit'
    });
    
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      time: timeString
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen 
        options={{
          title: 'Sarah Johnson',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />

      <FlatList
        data={messages}
        renderItem={({ item }) => <Message message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <Pressable onPress={sendMessage}>
          <Send 
            size={24} 
            color={message.length > 0 ? colors.primary : colors.inactive}
            style={styles.sendButton}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
  },
  myBubble: {
    backgroundColor: colors.primary,
  },
  otherBubble: {
    backgroundColor: colors.card,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: colors.card,
  },
  otherMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    marginHorizontal: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
});