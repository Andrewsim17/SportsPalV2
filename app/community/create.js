import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Camera, 
  X, 
  Check,
  Info
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';

const SPORTS = [
  'Badminton',
  'Basketball',
  'Tennis',
  'Football',
  'Volleyball',
  'Running',
  'Cycling',
  'Swimming',
  'Table Tennis',
  'Golf',
  'Yoga',
  'Fitness',
  'Other'
];

export default function CreateCommunityScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  const handlePickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handlePickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleCreateCommunity = () => {
    // Validate form
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter a community name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please enter a community description');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Missing Information', 'Please enter a location');
      return;
    }

    if (!selectedSport) {
      Alert.alert('Missing Information', 'Please select a sport');
      return;
    }

    if (!profileImage) {
      Alert.alert('Missing Information', 'Please upload a profile image');
      return;
    }

    // In a real app, you would send this data to your backend
    // For now, we'll just show a success message and navigate back
    Alert.alert(
      'Success',
      'Community created successfully!',
      [
        {
          text: 'OK',
          onPress: () => router.push('/explore')
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Stack.Screen 
        options={{
          title: 'Create Community',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Cover Image */}
          <Pressable 
            style={styles.coverImageContainer}
            onPress={handlePickCoverImage}
          >
            {coverImage ? (
              <Image 
                source={coverImage} 
                style={styles.coverImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.coverImagePlaceholder}>
                <Camera size={32} color={colors.textLight} />
                <Text style={styles.coverImageText}>Add Cover Image</Text>
              </View>
            )}
          </Pressable>

          {/* Profile Image */}
          <View style={styles.profileImageSection}>
            <Pressable 
              style={styles.profileImageContainer}
              onPress={handlePickProfileImage}
            >
              {profileImage ? (
                <Image 
                  source={profileImage} 
                  style={styles.profileImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Camera size={24} color={colors.textLight} />
                </View>
              )}
            </Pressable>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Community Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter community name"
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your community"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Location *</Text>
            <View style={styles.locationInputContainer}>
              <MapPin size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.locationInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter location"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <Text style={styles.label}>Sport *</Text>
            <Pressable 
              style={styles.sportSelector}
              onPress={() => setShowSportPicker(!showSportPicker)}
            >
              <Text style={selectedSport ? styles.sportText : styles.sportPlaceholder}>
                {selectedSport || 'Select a sport'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </Pressable>

            {showSportPicker && (
              <View style={styles.sportPickerContainer}>
                <ScrollView style={styles.sportPicker} nestedScrollEnabled={true}>
                  {SPORTS.map((sport) => (
                    <Pressable
                      key={sport}
                      style={[
                        styles.sportOption,
                        selectedSport === sport && styles.selectedSportOption
                      ]}
                      onPress={() => {
                        setSelectedSport(sport);
                        setShowSportPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.sportOptionText,
                        selectedSport === sport && styles.selectedSportOptionText
                      ]}>
                        {sport}
                      </Text>
                      {selectedSport === sport && (
                        <Check size={18} color={colors.card} />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.privacySection}>
              <Text style={styles.label}>Privacy</Text>
              <View style={styles.privacyOptions}>
                <Pressable 
                  style={[
                    styles.privacyOption,
                    !isPrivate && styles.selectedPrivacyOption
                  ]}
                  onPress={() => setIsPrivate(false)}
                >
                  <Text style={[
                    styles.privacyOptionText,
                    !isPrivate && styles.selectedPrivacyOptionText
                  ]}>
                    Public
                  </Text>
                </Pressable>
                <Pressable 
                  style={[
                    styles.privacyOption,
                    isPrivate && styles.selectedPrivacyOption
                  ]}
                  onPress={() => setIsPrivate(true)}
                >
                  <Text style={[
                    styles.privacyOptionText,
                    isPrivate && styles.selectedPrivacyOptionText
                  ]}>
                    Private
                  </Text>
                </Pressable>
              </View>
              <View style={styles.privacyInfo}>
                <Info size={16} color={colors.textLight} />
                <Text style={styles.privacyInfoText}>
                  {isPrivate 
                    ? "Private communities require approval to join and aren't visible in search results."
                    : "Public communities are visible to everyone and anyone can join."}
                </Text>
              </View>
            </View>

            <View style={styles.rulesSection}>
              <Text style={styles.label}>Community Guidelines</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add community rules and guidelines (optional)"
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <X size={20} color={colors.text} />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable 
          style={styles.createButton}
          onPress={handleCreateCommunity}
        >
          <Check size={20} color={colors.card} />
          <Text style={styles.createButtonText}>Create Community</Text>
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
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  coverImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImageText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textLight,
  },
  profileImageSection: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 16,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    borderWidth: 4,
    borderColor: colors.background,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  sportSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  sportText: {
    fontSize: 16,
    color: colors.text,
  },
  sportPlaceholder: {
    fontSize: 16,
    color: colors.textLight,
  },
  dropdownIcon: {
    fontSize: 14,
    color: colors.textLight,
  },
  sportPickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 200,
  },
  sportPicker: {
    padding: 8,
  },
  sportOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  selectedSportOption: {
    backgroundColor: colors.primary,
  },
  sportOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedSportOptionText: {
    color: colors.card,
    fontWeight: '500',
  },
  privacySection: {
    marginBottom: 16,
  },
  privacyOptions: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  privacyOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: 12,
    marginRight: 8,
    borderRadius: 12,
  },
  selectedPrivacyOption: {
    backgroundColor: colors.primary,
  },
  privacyOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedPrivacyOptionText: {
    color: colors.card,
    fontWeight: '500',
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
  },
  privacyInfoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  rulesSection: {
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
  },
  createButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
});