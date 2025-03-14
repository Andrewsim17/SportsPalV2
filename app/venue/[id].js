import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
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

const MOCK_VENUES = {
  '1': {
    id: '1',
    name: 'Central Sports Complex',
    images: [
      'https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=1000',
      'https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?q=80&w=1000',
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000'
    ],
    sports: ['Tennis', 'Basketball'],
    rating: 4.8,
    reviews: 128,
    location: '123 Main Street, Downtown',
    distance: '2.3 km',
    pricePerHour: 45,
    amenities: ['Parking', 'Showers', 'Equipment Rental', 'Cafe', 'Lockers'],
    availability: 'Available today',
    description: 'A modern sports complex featuring multiple tennis courts and basketball courts. Perfect for both casual play and organized events. All courts are well-maintained and include professional-grade equipment.',
    hours: {
      weekdays: '6:00 AM - 10:00 PM',
      weekends: '8:00 AM - 8:00 PM'
    },
    courts: [
      { id: 'c1', name: 'Tennis Court 1', sport: 'Tennis' },
      { id: 'c2', name: 'Tennis Court 2', sport: 'Tennis' },
      { id: 'c3', name: 'Basketball Court 1', sport: 'Basketball' },
      { id: 'c4', name: 'Basketball Court 2', sport: 'Basketball' },
    ]
  },
  '2': {
    id: '2',
    name: 'Elite Tennis Club',
    images: [
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1000',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1000',
      'https://images.unsplash.com/photo-1551773188-0801da12ddae?q=80&w=1000'
    ],
    sports: ['Tennis'],
    rating: 4.9,
    reviews: 89,
    location: '456 West Avenue, Westside',
    distance: '4.1 km',
    pricePerHour: 65,
    amenities: ['Pro Shop', 'Cafe', 'Coaching', 'Locker Rooms', 'Parking'],
    availability: '2 slots left today',
    description: 'An exclusive tennis club with premium clay and hard courts. Membership options available, but courts can also be booked by non-members. Professional coaching staff available for lessons.',
    hours: {
      weekdays: '7:00 AM - 9:00 PM',
      weekends: '8:00 AM - 7:00 PM'
    },
    courts: [
      { id: 'c5', name: 'Clay Court 1', sport: 'Tennis' },
      { id: 'c6', name: 'Clay Court 2', sport: 'Tennis' },
      { id: 'c7', name: 'Hard Court 1', sport: 'Tennis' },
      { id: 'c8', name: 'Hard Court 2', sport: 'Tennis' },
    ]
  },
  '3': {
    id: '3',
    name: 'Badminton Paradise',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000',
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000',
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000'
    ],
    sports: ['Badminton'],
    rating: 4.7,
    reviews: 56,
    location: 'City Center, Shah Alam',
    distance: '3.5 km',
    pricePerHour: 35,
    amenities: ['Equipment Rental', 'Cafe', 'Parking'],
    availability: 'Available today',
    description: 'A dedicated badminton facility with professional-grade courts. Perfect for both casual play and serious training.',
    hours: {
      weekdays: '7:00 AM - 11:00 PM',
      weekends: '8:00 AM - 10:00 PM'
    },
    courts: [
      { id: 'c9', name: 'Court A', sport: 'Badminton' },
      { id: 'c10', name: 'Court B', sport: 'Badminton' },
      { id: 'c11', name: 'Court C', sport: 'Badminton' },
      { id: 'c12', name: 'Court D', sport: 'Badminton' },
    ]
  }
};

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const venue = MOCK_VENUES[id];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSport, setSelectedSport] = useState(venue?.sports[0] || null);
  
  if (!venue) {
    return (
      <View style={styles.notFound}>
        <Text>Venue not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const filteredCourts = venue.courts.filter(court => 
    court.sport === selectedSport
  );

  const nextImage = () => {
    setCurrentImageIndex((currentImageIndex + 1) % venue.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((currentImageIndex - 1 + venue.images.length) % venue.images.length);
  };

  const handleBookNow = () => {
    if (!selectedTime) {
      Alert.alert('Select Time', 'Please select a time slot before booking.');
      return;
    }
    
    router.push({
      pathname: '/venue/payment',
      params: {
        venueId: venue.id,
        venueName: venue.name,
        date: selectedDate.toISOString(),
        time: selectedTime.toISOString(),
        courtName: `All ${selectedSport} Courts`,
        price: venue.pricePerHour * filteredCourts.length
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
          source={venue.images[currentImageIndex]}
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
          <Pressable style={styles.imageNavButton} onPress={nextImage}>
            <ChevronRight size={24} color={colors.card} />
          </Pressable>
        </View>
        
        <View style={styles.imageDots}>
          {venue.images.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.imageDot,
                index === currentImageIndex && styles.imageDotActive
              ]} 
            />
          ))}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{venue.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color={colors.primary} fill={colors.primary} />
            <Text style={styles.rating}>{venue.rating} ({venue.reviews} reviews)</Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={16} color={colors.textLight} />
          <Text style={styles.location}>{venue.location}</Text>
        </View>

        <View style={styles.sportsContainer}>
          {venue.sports.map((sport) => (
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
          <Text style={styles.description}>{venue.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours</Text>
          <View style={styles.hoursContainer}>
            <View style={styles.hourItem}>
              <Text style={styles.hourLabel}>Weekdays:</Text>
              <Text style={styles.hourValue}>{venue.hours.weekdays}</Text>
            </View>
            <View style={styles.hourItem}>
              <Text style={styles.hourLabel}>Weekends:</Text>
              <Text style={styles.hourValue}>{venue.hours.weekends}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {venue.amenities.map((amenity) => (
              <View key={amenity} style={styles.amenityItem}>
                <Check size={16} color={colors.success} />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book a Slot</Text>
          <Text style={styles.bookingPrice}>${venue.pricePerHour} per hour per court</Text>
          
          <Text style={styles.dateLabel}>Select Date</Text>
          <CalendarPicker
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          
          <Text style={styles.dateLabel}>Select Time</Text>
          <TimeAvailabilityTable 
            onSelectTime={setSelectedTime} 
            showAllCourts={true}
            courts={filteredCourts}
            sportType={selectedSport}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.price}>
            ${venue.pricePerHour * filteredCourts.length}
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
  imageDots: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  imageDotActive: {
    backgroundColor: colors.card,
  },
  content: {
    flex: 1,
    padding: 16,
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLink: {
    color: colors.primary,
    marginTop: 8,
  },
});