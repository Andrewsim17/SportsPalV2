import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { CheckCircle, Calendar, Clock, MapPin, Share2 } from 'lucide-react-native';
import { colors } from '../../constants/colors';

export default function ConfirmationScreen() {
  const router = useRouter();
  
  const handleDone = () => {
    router.replace('/(tabs)/venues');
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'I just booked a court at Central Sports Complex! Join me for a game!',
        title: 'Court Booking',
      });
    } catch (error) {
      console.log(error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Booking Confirmation',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          headerLeft: () => null, // Disable back button
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color={colors.success} />
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successMessage}>
            Your court has been successfully booked. We've sent a confirmation to your email.
          </Text>
        </View>
        
        <View style={styles.bookingDetails}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          <View style={styles.detailItem}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.detailText}>Friday, Feb 25, 2024</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.detailText}>2:00 PM - 3:00 PM</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.detailText}>Central Sports Complex</Text>
          </View>
          
          <View style={styles.courtInfo}>
            <Text style={styles.courtName}>Tennis Court 1</Text>
            <Text style={styles.bookingId}>Booking ID: #BK12345</Text>
          </View>
        </View>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          <Text style={styles.instructionText}>
            1. Arrive 15 minutes before your scheduled time
          </Text>
          <Text style={styles.instructionText}>
            2. Show your booking ID at the reception
          </Text>
          <Text style={styles.instructionText}>
            3. Enjoy your game!
          </Text>
        </View>
        
        <View style={styles.cancellationPolicy}>
          <Text style={styles.policyTitle}>Cancellation Policy</Text>
          <Text style={styles.policyText}>
            Free cancellation up to 24 hours before your booking. After that, a cancellation fee may apply.
          </Text>
        </View>
        
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Share2 size={20} color={colors.primary} />
          <Text style={styles.shareButtonText}>Share this booking</Text>
        </Pressable>
      </ScrollView>
      
      <View style={styles.footer}>
        <Pressable style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  successContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  bookingDetails: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
  },
  courtInfo: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 14,
    color: colors.textLight,
  },
  instructionsContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  cancellationPolicy: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  shareButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});