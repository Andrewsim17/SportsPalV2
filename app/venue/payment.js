import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle,
  Lock
} from 'lucide-react-native';
import { colors } from '../../constants/colors';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  
  const venueName = params.venueName;
  const date = new Date(params.date);
  const price = parseFloat(params.price);
  const courtCount = parseInt(params.courtCount || 1);
  
  // Parse the time parameter which is now a JSON string containing booking info
  useEffect(() => {
    try {
      if (params.time) {
        const bookingData = JSON.parse(params.time);
        setBookings(bookingData);
      }
    } catch (error) {
      console.error('Error parsing booking data:', error);
      setBookings([]);
    }
  }, [params.time]);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (timeObj) => {
    if (!timeObj) return 'N/A';
    const start = new Date(timeObj.start);
    const end = new Date(timeObj.end);
    
    return `${start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })} - ${end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })}`;
  };
  
  const handleCardNumberChange = (text) => {
    // Format card number with spaces every 4 digits
    const formatted = text.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted.slice(0, 19)); // Limit to 16 digits + 3 spaces
  };
  
  const handleExpiryDateChange = (text) => {
    // Format as MM/YY
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) {
      setExpiryDate(cleaned);
    } else {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    }
  };
  
  const handlePayment = () => {
    // Basic validation
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      Alert.alert('Missing Information', 'Please fill in all payment details.');
      return;
    }
    
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.');
      return;
    }
    
    if (expiryDate.length !== 5) {
      Alert.alert('Invalid Date', 'Please enter a valid expiry date (MM/YY).');
      return;
    }
    
    if (cvv.length !== 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid 3-digit CVV code.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      router.push('/venue/confirmation');
    }, 2000);
  };
  
  // Render a booking item
  const renderBookingItem = ({ item, index }) => {
    const court = item.courtId;
    return (
      <View style={styles.bookingItem} key={`booking-${index}`}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingTitle}>Court Booking #{index + 1}</Text>
        </View>
        <View style={styles.bookingDetail}>
          <Text style={styles.bookingLabel}>Court ID:</Text>
          <Text style={styles.bookingValue}>{court}</Text>
        </View>
        <View style={styles.bookingDetail}>
          <Text style={styles.bookingLabel}>Time:</Text>
          <Text style={styles.bookingValue}>{formatTime(item)}</Text>
        </View>
        <View style={styles.bookingDetail}>
          <Text style={styles.bookingLabel}>Duration:</Text>
          <Text style={styles.bookingValue}>{item.duration} hour{item.duration !== 1 ? 's' : ''}</Text>
        </View>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen 
        options={{
          title: 'Payment',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.bookingDetails}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Venue:</Text>
            <Text style={styles.detailValue}>{venueName}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Calendar size={16} color={colors.primary} />
            <Text style={styles.detailText}>{formatDate(date)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Number of Courts:</Text>
            <Text style={styles.detailValue}>{courtCount}</Text>
          </View>
          
          {/* Bookings list */}
          {bookings.length > 0 && (
            <View style={styles.bookingsList}>
              <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={(_, index) => `booking-${index}`}
                scrollEnabled={false}
              />
            </View>
          )}
          
          <View style={styles.detailItem}>
            <DollarSign size={16} color={colors.primary} />
            <Text style={styles.detailText}>${price.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <CreditCard size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Credit/Debit Card</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={handleExpiryDateChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
          
          <View style={styles.secureNote}>
            <Lock size={16} color={colors.textLight} />
            <Text style={styles.secureText}>
              Your payment information is secure and encrypted
            </Text>
          </View>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Court Rental</Text>
            <Text style={styles.summaryValue}>${price.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>$2.00</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${(price + 2).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Pressable 
          style={styles.payButton}
          onPress={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.card} />
          ) : (
            <Text style={styles.payButtonText}>Pay ${(price + 2).toFixed(2)}</Text>
          )}
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
  content: {
    flex: 1,
    padding: 16,
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
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textLight,
    width: 60,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  paymentSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputRow: {
    flexDirection: 'row',
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  secureText: {
    fontSize: 12,
    color: colors.textLight,
  },
  summarySection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  payButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  bookingsList: {
    marginTop: 12,
    marginBottom: 12,
  },
  bookingItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingHeader: {
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  bookingDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bookingLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  bookingValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
});