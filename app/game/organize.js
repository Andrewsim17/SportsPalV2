import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  MapPin, 
  Users, 
  DollarSign,
  Award,
  Check,
  X,
  ChevronDown
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import CalendarPicker from '../../components/CalendarPicker';
import TimeRangePicker from '../../components/TimeRangePicker';
import LocationInput from '../../components/LocationInput';
import { gamesApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

const SPORTS = [
  'Basketball', 
  'Tennis', 
  'Football', 
  'Volleyball', 
  'Badminton', 
  'Running', 
  'Cycling'
];

const SKILL_LEVELS = [
  'Beginner Friendly',
  'Intermediate',
  'Advanced'
];

export default function OrganizeGameScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [city, setCity] = useState('');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [playersNeeded, setPlayersNeeded] = useState('4');
  const [price, setPrice] = useState('0');
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    console.log("OrganizeScreen state updated - startTime:", startTime);
  }, [startTime]);

  useEffect(() => {
    console.log("OrganizeScreen state updated - endTime:", endTime);
  }, [endTime]);

  const handleTimeRangeSelect = useCallback((start, end) => {
    if (!start || !end) return;

    const selectedDate = date || new Date();
    
    // Create the start time on the selected date
    const finalStartTime = new Date(selectedDate);
    finalStartTime.setHours(start.getHours(), start.getMinutes(), 0, 0);

    // Create the end time
    const finalEndTime = new Date(end);
    
    // Since our TimeRangePicker now properly handles next-day times,
    // we don't need to manually adjust the date here.
    // The end time is already on the correct day (either same day or next day)

    console.log("Setting startTime:", finalStartTime);
    console.log("Setting endTime:", finalEndTime);

    setStartTime(finalStartTime);
    setEndTime(finalEndTime);
  }, [date]);

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  const handleCoordinatesChange = (newCoordinates) => {
    setCoordinates(newCoordinates);
  };

  const handleCreateGame = async () => {
    setIsCreating(true);

    if (!user) {
      Alert.alert('Login Required', 'You must be logged in to create a game.');
      setIsCreating(false);
      router.push('/auth/login');
      return;
    }

    // Log the user object being used
    console.log("User object from auth store:", user);

    // Validate form
    if (!title || !location || !selectedSport || !selectedLevel || !startTime || !endTime || !playersNeeded) {
      Alert.alert('Missing Information', 'Please fill in all required fields (*).');
      setIsCreating(false);
      return;
    }
    
    // Check if user.id is actually present before proceeding
    if (!user.id) {
      Alert.alert('Error', 'Could not identify organizing user. Please try logging out and back in.');
      setIsCreating(false);
      return;
    }

    // Calculate duration in minutes
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    if (duration <= 0) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      setIsCreating(false);
      return;
    }

    // Create a new Date object to ensure we have the correct date and time
    const gameDate = new Date(startTime);

    const gameData = {
      title,
      description: description || null,
      location,
      date: gameDate.toISOString(), // Ensure proper ISO format with timezone info
      duration,
      players_needed: parseInt(playersNeeded, 10) || 1,
      price: parseFloat(price) || 0,
      sport: selectedSport,
      level: selectedLevel,
      organizer_id: user.id,
    };
    
    // Add coordinates if available
    if (coordinates) {
      gameData.latitude = coordinates.latitude;
      gameData.longitude = coordinates.longitude;
    }
    
    try {
      console.log('Creating game with data:', gameData);
      const createdGame = await gamesApi.createGame(gameData);
      console.log('Game created successfully:', createdGame);
      
    Alert.alert(
      'Success',
      'Your game has been created!',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/games')
        }
      ]
    );
    } catch (error) {
      console.error("Failed to create game:", error);
      Alert.alert('Error', error.message || 'Could not create the game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen 
        options={{
          title: 'Organize a Game',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <X size={24} color={colors.primary} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable 
              onPress={handleCreateGame} 
              style={styles.headerButton}
              disabled={isCreating}
            >
              {isCreating ? 
                <ActivityIndicator size="small" color={colors.primary} /> : 
              null
              }
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sport *</Text>
          <Pressable 
            style={styles.sportDropdown}
            onPress={() => setShowSportDropdown(true)}
          >
            <Text style={selectedSport ? styles.dropdownText : styles.dropdownPlaceholder}>
              {selectedSport || 'Select a sport'}
            </Text>
            <ChevronDown size={20} color={colors.textLight} />
          </Pressable>
          
          <Modal
            visible={showSportDropdown}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowSportDropdown(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Sport</Text>
                  <Pressable onPress={() => setShowSportDropdown(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>
                
                <ScrollView>
                  {SPORTS.map((sport) => (
                    <Pressable
                      key={sport}
                      style={styles.sportOption}
                      onPress={() => {
                        setSelectedSport(sport);
                        setShowSportDropdown(false);
                      }}
                    >
                      <Text style={styles.sportOptionText}>{sport}</Text>
                      {selectedSport === sport && (
                        <Check size={20} color={colors.primary} />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Give your game a name"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your game, rules, what to bring, etc."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location *</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location or select on map"
              value={location}
              onChangeText={setLocation}
            />
          </View>
          
          <View style={styles.mapSelectContainer}>
            <Text style={styles.mapSelectText}>
              {coordinates ? 'Location selected on map ✓' : 'Or select location on map:'}
            </Text>
            <LocationInput 
              selectedLocation={location}
              onSelectLocation={handleLocationSelect}
              onCoordinatesChange={handleCoordinatesChange}
              initialCoordinates={coordinates}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time *</Text>
          <View style={styles.dateTimeContainer}>
            <CalendarPicker 
              selectedDate={date} 
              onSelectDate={setDate} 
            />
            
            <TimeRangePicker 
              onSelectTimeRange={handleTimeRangeSelect}
              initialStartTime={startTime}
              initialEndTime={endTime}
            />
          </View>
          
          <View style={styles.selectedDateTime}>
            <Text style={styles.selectedDateTimeText}>
              {date.toLocaleDateString()} 
              {startTime && endTime && ` at ${formatTime(startTime)} - ${formatTime(endTime)}`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skill Level *</Text>
          <View style={styles.levelOptions}>
            {SKILL_LEVELS.map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.levelOption,
                  selectedLevel === level && styles.levelOptionSelected
                ]}
                onPress={() => setSelectedLevel(level)}
              >
                <Award size={16} color={selectedLevel === level ? colors.card : colors.primary} />
                <Text style={[
                  styles.levelOptionText,
                  selectedLevel === level && styles.levelOptionTextSelected
                ]}>
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players & Cost</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Number of Players Needed</Text>
            <View style={styles.inputWithIcon}>
              <Users size={20} color={colors.primary} />
              <TextInput
                style={styles.iconInput}
                placeholder="Total players needed"
                value={playersNeeded}
                onChangeText={setPlayersNeeded}
                keyboardType="number-pad"
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cost per Person ($)</Text>
            <View style={styles.inputWithIcon}>
              <DollarSign size={20} color={colors.primary} />
              <TextInput
                style={styles.iconInput}
                placeholder="0 for free games"
                value={price}
                onChangeText={setPrice}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        <Pressable 
          style={[styles.createButton, isCreating && styles.createButtonDisabled]}
          onPress={handleCreateGame}
          disabled={isCreating}
        >
          {isCreating ? 
            <ActivityIndicator color={colors.card} /> : 
          <Text style={styles.createButtonText}>Create Game</Text>
          }
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sportDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sportOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sportOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  mapSelectContainer: {
    marginTop: 8,
  },
  mapSelectText: {
    color: colors.text,
    marginBottom: 8,
    fontSize: 14,
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  selectedDateTime: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  selectedDateTimeText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  levelOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  levelOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  levelOptionTextSelected: {
    color: colors.card,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  iconInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 48,
  },
  createButtonDisabled: {
    backgroundColor: colors.border,
  },
  createButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  }
});