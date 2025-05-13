import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  DollarSign, 
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  Phone,
  Mail,
  Globe
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import CalendarPicker from '../../components/CalendarPicker';
import TimeAvailabilityTable from '../../components/TimeAvailabilityTable';
import MapboxMap from '../../components/MapboxMap';
import { venuesApi } from '../../lib/api';
import { processVenueImages } from '../../lib/storage';
import * as Linking from 'expo-linking';

// Helper function to format opening hours (optional)
const formatOpeningHours = (hoursJson) => {
  if (!hoursJson || typeof hoursJson !== 'object') return { weekdays: 'N/A', weekends: 'N/A' };
  // Basic formatting, adjust as needed based on your JSON structure
  const weekdays = hoursJson.monday || hoursJson.tuesday || 'N/A';
  const weekends = hoursJson.saturday || hoursJson.sunday || 'N/A';
  return { 
    weekdays: weekdays !== 'N/A' ? `${weekdays.split('-')[0]} AM - ${weekdays.split('-')[1]} PM` : 'N/A',
    weekends: weekends !== 'N/A' ? `${weekends.split('-')[0]} AM - ${weekends.split('-')[1]} PM` : 'N/A',
  };
};

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // All state hooks must be declared first, in a consistent order
  const [venue, setVenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  
  // Constants (not hooks) should be used to avoid different hook patterns
  const FALLBACK_IMAGE = 'https://picsum.photos/800/400?text=No+Image';

  // Define all useMemo and useCallback hooks
  const displayVenue = useMemo(() => {
    if (!venue) return null;
    
    console.log('Raw venue data:', JSON.stringify(venue));
    
    // Process the images
    const processedImages = processVenueImages(venue.images);
    console.log('Processed venue images:', processedImages);
    
    return {
      ...venue,
      images: processedImages,
      location: `${venue.address || ''}, ${venue.city || ''}, ${venue.state || ''}`,
      hours: formatOpeningHours(venue.opening_hours),
      courts: venue?.courts || [],
      distance: 'N/A',
      pricePerHour: Math.floor(Math.random() * 50) + 20,
      availability: 'Available now',
      phone: venue.phone || '+1 (555) 123-4567',
      email: venue.email || 'contact@venue.com',
      website: venue.website || 'https://www.venue.com'
    };
  }, [venue]);
  
  const filteredCourts = useMemo(() => {
    if (!displayVenue?.courts) return [];
    return displayVenue.courts.filter(court => 
      court.sport === selectedSport && 
      (court.status === 'active' || court.name.toLowerCase().includes('court 4'))
    );
  }, [displayVenue, selectedSport]);
  
  const currentImageSrc = useMemo(() => {
    if (!displayVenue?.images || displayVenue.images.length === 0 || imageError) {
      return { uri: FALLBACK_IMAGE };
    }
    return { uri: displayVenue.images[currentImageIndex] };
  }, [displayVenue, currentImageIndex, imageError]);
  
  const fetchVenueDetails = useCallback(async () => {
    if (!id) {
      setError('Venue ID is missing');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedVenue = await venuesApi.getVenue(id);
      setVenue(fetchedVenue);
      // Set default selected sport after venue data is fetched
      if (fetchedVenue?.sports?.length > 0) {
        setSelectedSport(fetchedVenue.sports[0]);
      }
    } catch (err) {
      console.error(`Failed to fetch venue details for ID ${id}:`, err);
      setError(err.message || 'Failed to load venue details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchAvailability = useCallback(async () => {
    if (!venue?.id || !selectedSport || !selectedDate) {
      setBookedSlots([]);
      return;
    }
    setAvailabilityLoading(true);
    console.log('Fetching availability for:', { 
      venueId: venue.id, 
      sport: selectedSport, 
      date: selectedDate.toISOString().split('T')[0] 
    });
    try {
      const fetchedBookings = await venuesApi.getVenueAvailability(venue.id, selectedSport, selectedDate);
      setBookedSlots(fetchedBookings);
      console.log('Fetched booked slots:', fetchedBookings.length);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      setBookedSlots([]);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [venue?.id, selectedSport, selectedDate]);
  
  const handleNextImage = useCallback(() => {
    if (displayVenue?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % displayVenue.images.length);
      setImageError(false);
    }
  }, [displayVenue]);
  
  const handlePrevImage = useCallback(() => {
    if (displayVenue?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + displayVenue.images.length) % displayVenue.images.length);
      setImageError(false);
    }
  }, [displayVenue]);
  
  const handleBookNow = useCallback(() => {
    if (!displayVenue || !selectedTime || selectedTime.length === 0) return;
    
    // Calculate the total price from the selected time slots
    const totalPrice = selectedTime.reduce((sum, booking) => sum + (booking.price || 0), 0);
    
    router.push({
      pathname: '/venue/payment',
      params: {
        venueId: displayVenue.id,
        venueName: displayVenue.name,
        date: selectedDate.toISOString(),
        time: JSON.stringify(selectedTime), // Send all court bookings as JSON
        courtCount: selectedTime.length,
        price: totalPrice.toFixed(2)
      }
    });
  }, [displayVenue, selectedTime, selectedDate, router]);
  
  const handleSelectSport = useCallback((sport) => {
    setSelectedSport(sport);
    setSelectedTime(null);
  }, []);
  
  const handleSelectDate = useCallback((date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  }, []);

  // Add handlers for contact actions
  const handlePhoneCall = useCallback(() => {
    if (displayVenue?.phone) {
      const phoneUrl = `tel:${displayVenue.phone.replace(/[^\d+]/g, '')}`;
      Linking.canOpenURL(phoneUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(phoneUrl);
          } else {
            Alert.alert('Error', 'Phone calls are not supported on this device');
          }
        })
        .catch(err => {
          console.error('An error occurred', err);
          Alert.alert('Error', 'Could not open phone app');
        });
    }
  }, [displayVenue]);

  const handleEmail = useCallback(() => {
    if (displayVenue?.email) {
      const emailUrl = `mailto:${displayVenue.email}?subject=Inquiry about ${displayVenue.name}`;
      Linking.canOpenURL(emailUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(emailUrl);
          } else {
            Alert.alert('Error', 'Email is not supported on this device');
          }
        })
        .catch(err => {
          console.error('An error occurred', err);
          Alert.alert('Error', 'Could not open email app');
        });
    }
  }, [displayVenue]);

  const handleVisitWebsite = useCallback(() => {
    if (displayVenue?.website) {
      const websiteUrl = displayVenue.website.startsWith('http') 
        ? displayVenue.website 
        : `https://${displayVenue.website}`;
      
      Linking.canOpenURL(websiteUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(websiteUrl);
          } else {
            Alert.alert('Error', 'Web browsing is not supported on this device');
          }
        })
        .catch(err => {
          console.error('An error occurred', err);
          Alert.alert('Error', 'Could not open browser');
        });
    }
  }, [displayVenue]);

  const getAvailability = (timeSlotDate, courtId) => {
    const slotStart = new Date(selectedDate); // Start with selected date
    slotStart.setHours(timeSlotDate.getHours(), timeSlotDate.getMinutes(), 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + 30); // 30-minute slots

    // Check if court is under maintenance (Court 4)
    const court = courts.find(c => c.id === courtId);
    if (court && court.name.toLowerCase().includes('court 4')) {
      return 'unavailable'; // Mark Court 4 as unavailable
    }

    // Check if any booking for this court overlaps with this time slot
    const isBooked = bookedSlots.some(booking => {
      if (booking.court_id !== courtId) return false;
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);
      // Check for overlap: (SlotStart < BookingEnd) and (SlotEnd > BookingStart)
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });

    return isBooked ? 'unavailable' : 'available';
  };

  // useEffect hooks must come after all useMemo/useCallback declarations
  useEffect(() => {
    fetchVenueDetails();
  }, [fetchVenueDetails]);

  useEffect(() => {
    if (venue) {
      fetchAvailability();
    }
  }, [venue, selectedDate, selectedSport, fetchAvailability]);

  // Loading and error states - moved here to ensure they're only rendered after all hooks
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
        <Text style={styles.errorText}>Error: {error}</Text>
        <Pressable onPress={fetchVenueDetails}>
          <Text style={styles.backLink}>Try Again</Text>
        </Pressable>
      </View>
    );
  }
  
  if (!venue) {
    return (
      <View style={styles.centeredContainer}> 
        <Text>Venue not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }
  
  // Main render - only rendered if all hooks have been called and data is available
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.imageContainer}>
        <Image
          source={currentImageSrc}
          style={styles.image}
          contentFit="cover"
          transition={300}
          onError={() => {
            console.error('Detail image failed to load:', displayVenue?.images?.[currentImageIndex]);
            setImageError(true);
          }}
          placeholder={{ uri: FALLBACK_IMAGE }}
        />
        
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.card} />
        </Pressable>
        
        <View style={styles.imageNav}>
          <Pressable style={styles.imageNavButton} onPress={handlePrevImage}>
            <ChevronLeft size={24} color={colors.card} />
          </Pressable>
          
          <Text style={styles.imageCounter}>
            {currentImageIndex + 1}/{displayVenue?.images?.length || 1}
          </Text>
          
          <Pressable style={styles.imageNavButton} onPress={handleNextImage}>
            <ChevronRight size={24} color={colors.card} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.detailsContainer}>
        <Text style={styles.venueName}>{displayVenue.name}</Text>
        
        <View style={styles.infoItem}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.infoText}>{displayVenue.location}</Text>
        </View>
        
        {(displayVenue.latitude && displayVenue.longitude) ? (
          <MapboxMap
            initialLatitude={displayVenue.latitude}
            initialLongitude={displayVenue.longitude}
            markers={[{
              latitude: displayVenue.latitude,
              longitude: displayVenue.longitude,
              title: displayVenue.name
            }]}
            style={styles.map}
            zoomLevel={15}
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Info size={24} color={colors.textLight} />
            <Text style={styles.mapPlaceholderText}>Map location not available</Text>
          </View>
        )}

        <View style={styles.sportsContainer}>
          {displayVenue.sports.map((sport) => (
            <Pressable 
              key={sport} 
              style={[
                styles.sportTag,
                selectedSport === sport && styles.sportTagSelected
              ]}
              onPress={() => handleSelectSport(sport)}
            >
              <Text style={[
                styles.sportText,
                selectedSport === sport && styles.sportTextSelected
              ]}>
                {sport}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{displayVenue.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactContainer}>
            <Pressable 
              style={styles.contactItem} 
              onPress={handlePhoneCall}
            >
              <Phone size={20} color={colors.primary} />
              <Text style={styles.contactText}>{displayVenue.phone}</Text>
            </Pressable>
            
            <Pressable 
              style={styles.contactItem} 
              onPress={handleEmail}
            >
              <Mail size={20} color={colors.primary} />
              <Text style={styles.contactText}>{displayVenue.email}</Text>
            </Pressable>
            
            <Pressable 
              style={styles.contactItem} 
              onPress={handleVisitWebsite}
            >
              <Globe size={20} color={colors.primary} />
              <Text style={styles.contactText}>{
                displayVenue.website?.replace(/^https?:\/\/(www\.)?/, '')
              }</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours</Text>
          <View style={styles.hoursContainer}>
            <View style={styles.hourItem}>
              <Text style={styles.hourLabel}>Weekdays:</Text>
              <Text style={styles.hourValue}>{displayVenue.hours.weekdays}</Text>
            </View>
            <View style={styles.hourItem}>
              <Text style={styles.hourLabel}>Weekends:</Text>
              <Text style={styles.hourValue}>{displayVenue.hours.weekends}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {displayVenue.amenities.map((amenity) => (
              <View key={amenity} style={styles.amenityItem}>
                <Check size={16} color={colors.success} />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price</Text>
          <View style={styles.pricingDetailsContainer}>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingTypeText}>Weekday:</Text>
              <Text style={styles.pricingValueText}>$20 per hour</Text>
            </View>
            <View style={[styles.pricingItem, styles.noBorder]}>
              <Text style={styles.pricingTypeText}>Weekend:</Text>
              <Text style={styles.pricingValueText}>$30 per hour</Text>
            </View>
          </View>
          
          <Text style={styles.dateLabel}>Select Date</Text>
          <CalendarPicker
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
          
          <Text style={styles.dateLabel}>Select Time</Text>
          {availabilityLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <TimeAvailabilityTable 
              onSelectTime={setSelectedTime} 
              courts={filteredCourts}
              sportType={selectedSport}
              bookedSlots={bookedSlots}
              selectedDate={selectedDate}
              venueHours={displayVenue?.hours}
              venueId={displayVenue?.id}
              courtUnderMaintenance="Court 4"
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.price}>
            ${selectedTime 
              ? selectedTime.reduce((sum, booking) => sum + (booking.price || 0), 0).toFixed(2)
              : '0.00'
            }
          </Text>
        </View>
        <Pressable 
          style={[
            styles.bookButton,
            !selectedTime && styles.bookButtonDisabled
          ]}
          disabled={!selectedTime}
          onPress={handleBookNow}
        >
          <Text style={styles.bookButtonText}>Book</Text>
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
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageNav: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  imageNavButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCounter: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginHorizontal: 8,
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  venueName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
  },
  sportsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  sportTag: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sportTagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  sportTextSelected: {
    color: colors.card,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 22,
  },
  hoursContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  hourItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  hourLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  hourValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  amenityText: {
    fontSize: 14,
    color: colors.text,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookButtonDisabled: {
    backgroundColor: colors.inactive,
  },
  bookButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  backLink: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  map: {
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: colors.textLight,
  },
  contactContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  pricingDetailsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pricingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 4,
  },
  noBorder: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  pricingTypeText: {
    fontSize: 14,
    color: colors.textLight,
  },
  pricingValueText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
});