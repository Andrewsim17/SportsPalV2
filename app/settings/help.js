import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors } from '../../constants/colors';
import { ChevronDown, ChevronUp, MessageCircle, Mail } from 'lucide-react-native';

// Sample FAQ data
const FAQS = [
  {
    question: 'How do I find players nearby?',
    answer: 'You can use the Find Players feature from the Players tab. This will show you players in your area based on your location settings.'
  },
  {
    question: 'How do I join a game?',
    answer: 'Browse available games in the Games tab and tap on one you\'re interested in. From there, you can view details and choose to join if spots are available.'
  },
  {
    question: 'How can I record my activity?',
    answer: 'Tap the "+" button in the top right of your profile or go to the Activities tab and select "Record New Activity."'
  },
  {
    question: 'How does the wallet system work?',
    answer: 'Your wallet stores credits that can be used for booking courts, joining premium games, or other in-app purchases. You can add funds through the wallet section on your profile.'
  },
  {
    question: 'Can I change the sports I\'m interested in?',
    answer: 'Yes, you can update your preferred sports in the Edit Profile section of your account settings.'
  },
  {
    question: 'How do I message another player?',
    answer: 'Visit their profile and tap the "Message" button if you\'re following each other. You can also message players directly from game lobbies you\'re both part of.'
  }
];

export default function HelpCenterScreen() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {FAQS.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Pressable 
                style={styles.faqQuestion}
                onPress={() => toggleFaq(index)}
              >
                <Text style={styles.questionText}>{faq.question}</Text>
                {expandedFaq === index ? (
                  <ChevronUp size={20} color={colors.primary} />
                ) : (
                  <ChevronDown size={20} color={colors.textLight} />
                )}
              </Pressable>
              
              {expandedFaq === index && (
                <Text style={styles.answerText}>{faq.answer}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <Pressable style={styles.contactItem}>
            <View style={styles.contactLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
                <MessageCircle size={20} color={colors.primary} />
              </View>
              <Text style={styles.contactText}>Chat with Support</Text>
            </View>
          </Pressable>
          
          <Pressable style={styles.contactItem}>
            <View style={styles.contactLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
                <Mail size={20} color={colors.primary} />
              </View>
              <Text style={styles.contactText}>Email Support</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  answerText: {
    fontSize: 14,
    color: colors.textLight,
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
  },
}); 