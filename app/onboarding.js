import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  ChevronRight, 
  Award, 
  Check, 
  MapPin,
  User,
  UserCircle,
  Dumbbell,
  Briefcase
} from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useAuthStore } from '../store/auth-store';
import { LinearGradient } from 'expo-linear-gradient';

const SPORTS = [
  'Basketball', 'Tennis', 'Soccer', 'Volleyball', 'Badminton',
  'Running', 'Cycling', 'Swimming', 'Hiking', 'Golf',
  'Table Tennis', 'Cricket', 'Rugby', 'Baseball', 'Yoga',
  'Boxing', 'Martial Arts', 'Skiing', 'Snowboarding', 'Surfing',
  'Rock Climbing', 'Weight Training', 'CrossFit', 'Pilates', 'Dance',
  'Skateboarding', 'Rowing', 'Kayaking', 'Archery', 'Fencing',
  'Hockey', 'Ice Hockey', 'Handball', 'Squash', 'Triathlon',
  'Ultimate Frisbee', 'Parkour', 'Zumba', 'Walking', 'Sailing',
  'Bowling', 'Climbing', 'Gymnastics', 'Judo', 'Karate',
  'Kickboxing', 'Lacrosse', 'Marathon', 'MMA', 'Muay Thai',
  'Paddle Boarding', 'Pole Dancing', 'Racquetball', 'Roller Skating', 'Scuba Diving',
  'Snorkeling', 'Softball', 'Taekwondo', 'Tai Chi', 'Water Polo'
];

const LEVELS = [
  { id: 'beginner', name: 'Beginner', description: 'New to the sport or play occasionally' },
  { id: 'intermediate', name: 'Intermediate', description: 'Regular player with some experience' },
  { id: 'advanced', name: 'Advanced', description: 'Experienced player with good skills' },
  { id: 'expert', name: 'Expert', description: 'Highly skilled, competitive player' },
  { id: 'professional', name: 'Professional', description: 'Professional or semi-professional athlete' }
];

const COACH_SPECIALTIES = [
  'Technique', 'Strength & Conditioning', 'Strategy', 'Mental Training',
  'Nutrition', 'Injury Prevention', 'Performance Analysis', 'Youth Development'
];

export default function OnboardingScreen() {
  const { user, updateProfile } = useAuthStore();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [location, setLocation] = useState(user?.location || '');
  const [selectedSports, setSelectedSports] = useState(user?.sports || []);
  const [level, setLevel] = useState(user?.level || 'beginner');
  const [bio, setBio] = useState(user?.bio || '');
  const [isCoach, setIsCoach] = useState(user?.isCoach || false);
  const [coachSpecialties, setCoachSpecialties] = useState(user?.coachSpecialties || []);
  const [coachExperience, setCoachExperience] = useState(user?.coachExperience || '');
  const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate || '');

  const handleNext = () => {
    if (step < (isCoach ? 5 : 4)) {
      setStep(step + 1);
    } else {
      // Save all profile data
      updateProfile({
        name,
        username,
        location,
        sports: selectedSports,
        level,
        bio,
        isCoach,
        ...(isCoach && {
          coachSpecialties,
          coachExperience,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0
        })
      });
      
      // Navigate to the main app
      router.replace('/(tabs)');
    }
  };

  const toggleSport = (sport) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const toggleCoachSpecialty = (specialty) => {
    if (coachSpecialties.includes(specialty)) {
      setCoachSpecialties(coachSpecialties.filter(s => s !== specialty));
    } else {
      setCoachSpecialties([...coachSpecialties, specialty]);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <UserCircle size={32} color={colors.primary} />
              <Text style={styles.stepTitle}>Personal Info</Text>
            </View>
            <Text style={styles.stepDescription}>
              Let's start with some basic information about you
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                placeholder="How should we call you?"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a unique username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bio (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us a bit about yourself"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Briefcase size={32} color={colors.primary} />
              <Text style={styles.stepTitle}>Are you a coach?</Text>
            </View>
            <Text style={styles.stepDescription}>
              Let us know if you're a coach or just a player
            </Text>
            
            <View style={styles.coachToggleContainer}>
              <Text style={styles.coachToggleLabel}>I am a sports coach</Text>
              <Switch
                value={isCoach}
                onValueChange={setIsCoach}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={isCoach ? colors.primary : colors.card}
              />
            </View>
            
            <View style={styles.coachInfoContainer}>
              {isCoach ? (
                <View style={styles.coachInfoContent}>
                  <Text style={styles.coachInfoText}>
                    Great! We'll collect some additional information about your coaching experience in the next steps.
                  </Text>
                  <Image
                    source={{ uri: "https://cdn.dribbble.com/users/1162077/screenshots/4350203/media/6227227b3384c3b3e9d5f7d7d8679d5b.png" }}
                    style={styles.coachImage}
                    contentFit="contain"
                  />
                </View>
              ) : (
                <View style={styles.coachInfoContent}>
                  <Text style={styles.coachInfoText}>
                    No problem! You can always update your profile later if you decide to offer coaching services.
                  </Text>
                  <Image
                    source={{ uri: "https://cdn.dribbble.com/users/1162077/screenshots/5427758/media/e8682b03c6c2a0a69f5a3ec41b7a3393.png" }}
                    style={styles.coachImage}
                    contentFit="contain"
                  />
                </View>
              )}
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <MapPin size={32} color={colors.primary} />
              <Text style={styles.stepTitle}>Your Location</Text>
            </View>
            <Text style={styles.stepDescription}>
              Add your location to find nearby games and players
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="City, State"
                value={location}
                onChangeText={setLocation}
              />
            </View>
            
            <View style={styles.locationPreview}>
              <Image
                source={{ uri: "https://cdn.dribbble.com/users/1162077/screenshots/6851911/media/af7c1c39ede6e9f9f8732e88c648e8ae.png" }}
                style={styles.mapPreview}
                contentFit="cover"
              />
              <Text style={styles.locationNote}>
                Your location helps us find games and venues near you
              </Text>
            </View>
          </View>
        );
      
      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Dumbbell size={32} color={colors.primary} />
              <Text style={styles.stepTitle}>Sports Interests</Text>
            </View>
            <Text style={styles.stepDescription}>
              Select the sports you play or are interested in
            </Text>
            
            <ScrollView style={styles.sportsContainer}>
              <View style={styles.sportsGrid}>
                {SPORTS.map(sport => (
                  <Pressable
                    key={sport}
                    style={[
                      styles.sportItem,
                      selectedSports.includes(sport) && styles.sportItemSelected
                    ]}
                    onPress={() => toggleSport(sport)}
                  >
                    <Text 
                      style={[
                        styles.sportText,
                        selectedSports.includes(sport) && styles.sportTextSelected
                      ]}
                    >
                      {sport}
                    </Text>
                    {selectedSports.includes(sport) && (
                      <Check size={16} color={colors.card} />
                    )}
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        );
      
      case 5:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Award size={32} color={colors.primary} />
              <Text style={styles.stepTitle}>Coaching Profile</Text>
            </View>
            <Text style={styles.stepDescription}>
              Tell us more about your coaching experience
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Years of Experience</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5 years"
                value={coachExperience}
                onChangeText={setCoachExperience}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Hourly Rate ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 50"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Specialties</Text>
              <View style={styles.specialtiesGrid}>
                {COACH_SPECIALTIES.map(specialty => (
                  <Pressable
                    key={specialty}
                    style={[
                      styles.specialtyItem,
                      coachSpecialties.includes(specialty) && styles.specialtyItemSelected
                    ]}
                    onPress={() => toggleCoachSpecialty(specialty)}
                  >
                    <Text 
                      style={[
                        styles.specialtyText,
                        coachSpecialties.includes(specialty) && styles.specialtyTextSelected
                      ]}
                    >
                      {specialty}
                    </Text>
                    {coachSpecialties.includes(specialty) && (
                      <Check size={16} color={colors.card} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        );
      
      default:
        if (!isCoach) {
          return (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Award size={32} color={colors.primary} />
                <Text style={styles.stepTitle}>Skill Level</Text>
              </View>
              <Text style={styles.stepDescription}>
                What's your overall skill level in sports?
              </Text>
              
              <View style={styles.levelsContainer}>
                {LEVELS.map(item => (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.levelItem,
                      level === item.id && styles.levelItemSelected
                    ]}
                    onPress={() => setLevel(item.id)}
                  >
                    <View style={styles.levelHeader}>
                      <Text 
                        style={[
                          styles.levelName,
                          level === item.id && styles.levelNameSelected
                        ]}
                      >
                        {item.name}
                      </Text>
                      {level === item.id && (
                        <Check size={20} color={colors.primary} />
                      )}
                    </View>
                    <Text 
                      style={[
                        styles.levelDescription,
                        level === item.id && styles.levelDescriptionSelected
                      ]}
                    >
                      {item.description}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        }
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <Stack.Screen 
        options={{
          title: 'Complete Your Profile',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map(i => (
          <View 
            key={i}
            style={[
              styles.progressDot,
              (i <= step || (!isCoach && i === 5 && step === 4)) && styles.progressDotActive,
              (i < step || (!isCoach && i === 5 && step === 4)) && styles.progressDotCompleted,
              (!isCoach && i === 5) && styles.progressDotHidden
            ]}
          />
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.nextButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Pressable onPress={handleNext} style={styles.nextButtonInner}>
            <Text style={styles.nextButtonText}>
              {step < (isCoach ? 5 : 4) ? 'Continue' : 'Complete Setup'}
            </Text>
            <ChevronRight size={20} color={colors.card} />
          </Pressable>
        </LinearGradient>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    backgroundColor: colors.card,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: colors.primary,
  },
  progressDotHidden: {
    opacity: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  stepDescription: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
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
    color: colors.text,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  locationPreview: {
    marginTop: 24,
    alignItems: 'center',
  },
  mapPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  locationNote: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  sportsContainer: {
    flex: 1,
    maxHeight: 400,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sportItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  sportTextSelected: {
    color: colors.card,
  },
  levelsContainer: {
    gap: 16,
  },
  levelItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelItemSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  levelNameSelected: {
    color: colors.primary,
  },
  levelDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  levelDescriptionSelected: {
    color: colors.text,
  },
  footer: {
    padding: 24,
    backgroundColor: colors.background,
  },
  nextButton: {
    borderRadius: 12,
  },
  nextButtonInner: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  coachToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  coachToggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  coachInfoContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  coachInfoContent: {
    alignItems: 'center',
  },
  coachInfoText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  coachImage: {
    width: '80%',
    height: 200,
  },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specialtyItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  specialtyItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  specialtyText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  specialtyTextSelected: {
    color: colors.card,
  },
});