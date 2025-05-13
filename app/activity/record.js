import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, Modal, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Camera, MapPin, Clock, Activity, ChevronDown, Save, Map, Droplets, Thermometer, Wind, Mountain, Footprints, Bike, Heart } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { activitiesApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

const SPORT_TYPES = [
  { id: 'running', name: 'Running', icon: Footprints },
  { id: 'hiking', name: 'Hiking', icon: Mountain },
  { id: 'cycling', name: 'Cycling', icon: Bike },
  { id: 'swimming', name: 'Swimming', icon: Droplets },
  { id: 'badminton', name: 'Badminton', icon: Activity },
  { id: 'basketball', name: 'Basketball', icon: Activity },
  { id: 'tennis', name: 'Tennis', icon: Activity },
  { id: 'volleyball', name: 'Volleyball', icon: Activity },
  { id: 'soccer', name: 'Soccer', icon: Activity },
];

export default function RecordActivityScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSport, setSelectedSport] = useState(SPORT_TYPES[0]);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [elevation, setElevation] = useState('');
  const [pace, setPace] = useState('');
  const [calories, setCalories] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weather, setWeather] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You must be logged in to save an activity.');
      return;
    }
    
    if (!title && !description) {
      Alert.alert('Missing Information', 'Please add a title or description for your activity post.');
      return;
    }

    setIsSaving(true);

    const activityDetails = {};
    if (description) activityDetails.description = description;
    if (distance) activityDetails.distance_km = parseFloat(distance) || null;
    if (duration) activityDetails.duration_min = parseFloat(duration) || null;
    if (elevation) activityDetails.elevation_m = parseFloat(elevation) || null;
    if (pace) activityDetails.pace_min_km = pace;
    if (calories) activityDetails.calories_kcal = parseFloat(calories) || null;
    if (heartRate) activityDetails.avg_heart_rate_bpm = parseFloat(heartRate) || null;
    if (temperature) activityDetails.temperature_c = parseFloat(temperature) || null;
    if (weather) activityDetails.weather_condition = weather;

    const activityData = {
      user_id: user.id,
      type: 'quick_post',
      sport: selectedSport.id, 
      content: title || `${selectedSport.name} Activity`,
      details: Object.keys(activityDetails).length > 0 ? activityDetails : null,
    };

    try {
      console.log("Saving manual activity data:", activityData);
      const savedActivity = await activitiesApi.createActivity(activityData);
      console.log("Manual activity saved successfully:", savedActivity);
      
      // Refresh profile to update activity counts
      await refreshProfile();

      Alert.alert('Success', 'Activity saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Failed to save manual activity:", error);
      Alert.alert('Save Failed', error.message || 'Could not save activity. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSportPicker = () => {
    if (!showSportPicker) return null;

    return (
      <View style={styles.sportPickerContainer}>
        <ScrollView style={styles.sportPickerScroll}>
          {SPORT_TYPES.map(sport => {
            const SportIcon = sport.icon;
            return (
              <Pressable
                key={sport.id}
                style={[
                  styles.sportPickerItem,
                  selectedSport.id === sport.id && styles.sportPickerItemSelected
                ]}
                onPress={() => {
                  setSelectedSport(sport);
                  setShowSportPicker(false);
                }}
              >
                <View style={styles.sportPickerItemContent}>
                  <SportIcon size={20} color={selectedSport.id === sport.id ? colors.primary : colors.textLight} />
                  <Text
                    style={[
                      styles.sportPickerItemText,
                      selectedSport.id === sport.id && styles.sportPickerItemTextSelected
                    ]}
                  >
                    {sport.name}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderActivitySpecificFields = () => {
    const SportIcon = selectedSport.icon;
    
    switch (selectedSport.id) {
      case 'running':
      case 'hiking':
        return (
          <>
            <View style={styles.mapPreviewContainer}>
              <View style={styles.mapPlaceholder}>
                <Map size={32} color={colors.primary} />
                <Text style={styles.mapPlaceholderText}>Map Preview</Text>
                <Pressable style={styles.mapButton}>
                  <Text style={styles.mapButtonText}>Select Route</Text>
                </Pressable>
              </View>
            </View>
            
            <View style={styles.statsInputRow}>
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Distance (km)"
                  value={distance}
                  onChangeText={setDistance}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Clock size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Duration (min)"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
            
            <View style={styles.statsInputRow}>
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <SportIcon size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Pace (min/km)"
                  value={pace}
                  onChangeText={setPace}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Mountain size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Elevation (m)"
                  value={elevation}
                  onChangeText={setElevation}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
            
            <View style={styles.statsInputRow}>
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Activity size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Calories (kcal)"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Heart size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Avg Heart Rate (bpm)"
                  value={heartRate}
                  onChangeText={setHeartRate}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
            
            <View style={styles.statsInputRow}>
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Thermometer size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Temperature (°C)"
                  value={temperature}
                  onChangeText={setTemperature}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Wind size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Weather"
                  value={weather}
                  onChangeText={setWeather}
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
          </>
        );
      case 'cycling':
        return (
          <>
            <View style={styles.mapPreviewContainer}>
              <View style={styles.mapPlaceholder}>
                <Map size={32} color={colors.primary} />
                <Text style={styles.mapPlaceholderText}>Map Preview</Text>
                <Pressable style={styles.mapButton}>
                  <Text style={styles.mapButtonText}>Select Route</Text>
                </Pressable>
              </View>
            </View>
            
            <View style={styles.statsInputRow}>
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Distance (km)"
                  value={distance}
                  onChangeText={setDistance}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Clock size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Duration (min)"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
            
            <View style={styles.statsInputRow}>
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Bike size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Avg Speed (km/h)"
                  value={pace}
                  onChangeText={setPace}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Mountain size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Elevation (m)"
                  value={elevation}
                  onChangeText={setElevation}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
            
            <View style={styles.statsInputRow}>
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Activity size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Calories (kcal)"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Heart size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Avg Heart Rate (bpm)"
                  value={heartRate}
                  onChangeText={setHeartRate}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
          </>
        );
      default:
        return (
          <>
            <View style={styles.statsInputRow}>
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Distance (km)"
                  value={distance}
                  onChangeText={setDistance}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Clock size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Duration (min)"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
            
            <View style={styles.statsInputRow}>
              <View style={styles.statsInputContainer}>
                <View style={styles.statsInputIcon}>
                  <Activity size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.statsInput}
                  placeholder="Elevation (m)"
                  value={elevation}
                  onChangeText={setElevation}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Record Activity',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={colors.primary} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={isSaving} style={styles.headerButton}>
              {isSaving ? 
                <ActivityIndicator size="small" color={colors.primary} /> : 
                <Save size={24} color={colors.primary} />
              }
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What did you do today?"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Sport Type</Text>
            <Pressable 
              style={styles.sportSelector}
              onPress={() => setShowSportPicker(!showSportPicker)}
            >
              <View style={styles.sportSelectorContent}>
                {selectedSport.icon && <selectedSport.icon size={20} color={colors.primary} />}
                <Text style={styles.sportSelectorText}>{selectedSport.name}</Text>
              </View>
              <ChevronDown size={20} color={colors.text} />
            </Pressable>
            {renderSportPicker()}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="How was your activity?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Activity Details</Text>
          {renderActivitySpecificFields()}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Add Media</Text>
          
          <Pressable style={styles.mediaButton}>
            <Camera size={24} color={colors.primary} />
            <Text style={styles.mediaButtonText}>Add Photos</Text>
          </Pressable>
        </View>

        <Pressable 
          style={[styles.saveButton, isSaving && styles.disabledButton]} 
          onPress={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? 
            <ActivityIndicator color={colors.card} /> : 
            <Text style={styles.saveButtonText}>Save Activity</Text>
          }
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
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
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sportSelector: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sportSelectorText: {
    fontSize: 16,
    color: colors.text,
  },
  sportPickerContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sportPickerScroll: {
    padding: 8,
  },
  sportPickerItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  sportPickerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sportPickerItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  sportPickerItemText: {
    fontSize: 16,
    color: colors.text,
  },
  sportPickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  statsInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statsInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsInputIcon: {
    padding: 12,
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  statsInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  mediaButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: colors.primaryLight,
  },
  saveButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  mapPreviewContainer: {
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  mapPlaceholderText: {
    color: colors.textLight,
    marginTop: 8,
    marginBottom: 16,
  },
  mapButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapButtonText: {
    color: colors.card,
    fontWeight: '500',
  },
});