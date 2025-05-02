import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Star, 
  Clock, 
  Calendar, 
  DollarSign, 
  ChevronLeft,
  ChevronRight,
  Check,
  Info
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import CalendarPicker from '../../components/CalendarPicker';
import TimeAvailabilityTable from '../../components/TimeAvailabilityTable';
import SportsPalMap from '../../components/MapView';
import { venuesApi } from '../../lib/api';

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
  
  const [venue, setVenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

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
    console.log('Fetching availability for:', { venueId: venue.id, sport: selectedSport, date: selectedDate.toISOString().split('T')[0] });
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

  useEffect(() => {
    fetchVenueDetails();
  }, [fetchVenueDetails]);

  useEffect(() => {
    if (venue) {
      fetchAvailability();
    }
  }, [venue, selectedDate, selectedSport, fetchAvailability]);

  // Handle loading state
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Handle error state
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
  
  // Handle venue not found after fetch
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
  
  // --- Adapt fetched data for display --- 
  const displayVenue = {
    ...venue, // Spread fetched data
    images: venue.images && venue.images.length > 0 ? venue.images : ['https://via.placeholder.com/300/cccccc/ffffff?text=No+Image'],
    location: `${venue.address || ''}, ${venue.city || ''}, ${venue.state || ''}`, // Combine address parts
    hours: formatOpeningHours(venue.opening_hours), // Format hours
    courts: venue?.courts || [], // Use fetched courts
    // --- Placeholder/Default values for data not directly fetched by getVenue ---
    rating: 4.5, // Placeholder - Needs separate review/rating fetch
    reviews: Math.floor(Math.random() * 100), // Placeholder
    distance: 'N/A', // Placeholder - Needs location calculation
    pricePerHour: Math.floor(Math.random() * 50) + 20, // Placeholder - Needs pricing logic
    availability: 'Check details', // Placeholder - Needs availability logic
  };
  // --- End data adaptation ---

  // Filter courts based on selectedSport (using the *actual* courts now)
  const filteredCourts = displayVenue.courts.filter(court => 
    court.sport === selectedSport && court.status === 'active' // Also ensure court is active
  );

  const nextImage = () => {
    setCurrentImageIndex((currentImageIndex + 1) % displayVenue.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((currentImageIndex - 1 + displayVenue.images.length) % displayVenue.images.length);
  };

  const handleBookNow = () => {
    // ... uses displayVenue.id, displayVenue.name, displayVenue.pricePerHour ...
    // Make sure router params use displayVenue values
    router.push({
      pathname: '/venue/payment',
      params: {
        venueId: displayVenue.id,
        venueName: displayVenue.name,
        date: selectedDate.toISOString(),
        time: selectedTime.toISOString(),
        courtName: `All ${selectedSport} Courts`, // This might need refinement
        price: displayVenue.pricePerHour // Use placeholder price for now
      }
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.imageContainer}>
        <Image
          source={displayVenue.images[currentImageIndex]}
          style={styles.image}
          contentFit="cover"
        />
        
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.card} />
        </Pressable>
        
        <View style={styles.imageNav}>
          <Pressable style={styles.imageNavButton} onPress={prevImage}>
            <ChevronLeft size={24} color={colors.card} />
          </Pressable>
          
          <Text style={styles.imageCounter}>{currentImageIndex + 1}/{displayVenue.images.length}</Text>
          
          <Pressable style={styles.imageNavButton} onPress={nextImage}>
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
        
        {/* Location Map */}
        {(displayVenue.latitude && displayVenue.longitude) ? (
          <SportsPalMap
            latitude={displayVenue.latitude}
            longitude={displayVenue.longitude}
            title={displayVenue.name}
            description={displayVenue.address}
            style={styles.map}
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Info size={24} color={colors.textLight} />
            <Text style={styles.mapPlaceholderText}>Map location not available</Text>
          </View>
        )}
        
        <View style={styles.header}>
          <Text style={styles.name}>{displayVenue.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color={colors.primary} fill={colors.primary} />
            <Text style={styles.rating}>{displayVenue.rating} ({displayVenue.reviews} reviews)</Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={16} color={colors.textLight} />
          <Text style={styles.location}>{displayVenue.location}</Text>
        </View>

        <View style={styles.sportsContainer}>
          {displayVenue.sports.map((sport) => (
            <Pressable 
              key={sport} 
              style={[
                styles.sportTag,
                selectedSport === sport && styles.sportTagSelected
              ]}
              onPress={() => {
                setSelectedSport(sport);
                setSelectedTime(null);
              }}
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
          <Text style={styles.sectionTitle}>Book a Slot</Text>
          <Text style={styles.bookingPrice}>${displayVenue.pricePerHour} per hour per court</Text>
          
          <Text style={styles.dateLabel}>Select Date</Text>
          <CalendarPicker
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedTime(null);
            }}
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
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.price}>
            ${displayVenue.pricePerHour * filteredCourts.length}
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
          <Text style={styles.bookButtonText}>Book Now</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  location: {
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
});