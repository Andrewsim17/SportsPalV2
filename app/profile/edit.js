import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Check, Camera, X } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth-store';
import * as ImagePicker from 'expo-image-picker';

const SPORTS_OPTIONS = [
  'tennis', 'basketball', 'football', 'volleyball', 
  'badminton', 'running', 'cycling', 'swimming'
];

const LEVEL_OPTIONS = ['beginner', 'intermediate', 'advanced'];

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuthStore();
  const router = useRouter();
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [selectedSports, setSelectedSports] = useState(user?.sports || []);
  const [level, setLevel] = useState(user?.level || 'beginner');

  const handleSave = () => {
    updateProfile({
      name,
      bio,
      location,
      avatar,
      sports: selectedSports,
      level
    });
    router.back();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const toggleSport = (sport) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen 
        options={{
          title: 'Edit Profile',
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
            <Pressable onPress={handleSave} style={styles.headerButton}>
              <Check size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <Image 
            source={avatar} 
            style={styles.avatar}
            contentFit="cover"
          />
          <Pressable style={styles.changeAvatarButton} onPress={pickImage}>
            <Camera size={20} color={colors.card} />
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Sports</Text>
            <Text style={styles.sectionSubtitle}>Select the sports you play</Text>
            <View style={styles.sportsGrid}>
              {SPORTS_OPTIONS.map((sport) => (
                <Pressable
                  key={sport}
                  style={[
                    styles.sportOption,
                    selectedSports.includes(sport) && styles.sportOptionSelected
                  ]}
                  onPress={() => toggleSport(sport)}
                >
                  <Text 
                    style={[
                      styles.sportOptionText,
                      selectedSports.includes(sport) && styles.sportOptionTextSelected
                    ]}
                  >
                    {sport}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Skill Level</Text>
            <Text style={styles.sectionSubtitle}>Select your overall skill level</Text>
            <View style={styles.levelOptions}>
              {LEVEL_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.levelOption,
                    level === option && styles.levelOptionSelected
                  ]}
                  onPress={() => setLevel(option)}
                >
                  <Text 
                    style={[
                      styles.levelOptionText,
                      level === option && styles.levelOptionTextSelected
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
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
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  bioInput: {
    height: 120,
    paddingTop: 16,
  },
  sectionContainer: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sportOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportOptionText: {
    color: colors.text,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  sportOptionTextSelected: {
    color: colors.card,
    fontWeight: '500',
  },
  levelOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  levelOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelOptionText: {
    color: colors.text,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  levelOptionTextSelected: {
    color: colors.card,
    fontWeight: '500',
  },
});