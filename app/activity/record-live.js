import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Alert,
  Modal,
  BackHandler,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Activity,
  ChevronDown,
  Heart,
  Droplets,
  Wind,
  Thermometer,
  Footprints,
  Bike,
  Mountain
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { activitiesApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

const SPORT_TYPES = [
  { id: 'running', name: 'Running', icon: Footprints },
  { id: 'hiking', name: 'Hiking', icon: Mountain },
  { id: 'cycling', name: 'Cycling', icon: Bike },
  { id: 'swimming', name: 'Swimming', icon: Droplets },
  { id: 'walking', name: 'Walking', icon: Footprints },
  { id: 'skiing', name: 'Skiing', icon: Mountain },
  { id: 'snowboarding', name: 'Snowboarding', icon: Mountain },
  { id: 'kayaking', name: 'Kayaking', icon: Droplets },
  { id: 'rowing', name: 'Rowing', icon: Droplets },
  { id: 'surfing', name: 'Surfing', icon: Droplets },
];

export default function RecordLiveScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState('0:00');
  const [calories, setCalories] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedSport, setSelectedSport] = useState(SPORT_TYPES[0]);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const timerRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    // Simulate distance and other metrics updates
    const updateMetrics = () => {
      if (isRecording && !isPaused) {
        // Update distance (simulate GPS tracking)
        const newDistance = distance + (Math.random() * 0.01);
        setDistance(parseFloat(newDistance.toFixed(2)));
        
        // Update pace
        if (newDistance > 0) {
          const paceMinutes = Math.floor((elapsedTime / 60) / newDistance);
          const paceSeconds = Math.floor(((elapsedTime / 60) / newDistance - paceMinutes) * 60);
          setPace(`${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`);
        }
        
        // Update calories (very simplified calculation)
        const newCalories = Math.floor(elapsedTime / 15);
        setCalories(newCalories);
        
        // Simulate elevation changes
        if (Math.random() > 0.7) {
          const elevationChange = Math.random() > 0.5 ? 1 : -1;
          setElevation(prev => Math.max(0, prev + elevationChange));
        }
        
        // Simulate heart rate
        const baseHeartRate = 70;
        const activityFactor = isRecording ? 30 : 0;
        const randomVariation = Math.floor(Math.random() * 10) - 5;
        setHeartRate(baseHeartRate + activityFactor + randomVariation);
      }
    };

    const metricsInterval = setInterval(updateMetrics, 3000);
    return () => clearInterval(metricsInterval);
  }, [isRecording, isPaused, distance, elapsedTime]);

  useEffect(() => {
    // Timer logic
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  useEffect(() => {
    // Handle back button press
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isRecording) {
        setShowExitConfirm(true);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isRecording]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      setIsPaused(false);
    } else {
      // Stop recording
      setShowExitConfirm(true);
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleDiscard = () => {
    setIsRecording(false);
    setIsPaused(false);
    setElapsedTime(0);
    setDistance(0);
    setPace('0:00');
    setCalories(0);
    setElevation(0);
    setShowExitConfirm(false);
    router.back();
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save an activity.');
      return;
    }
    
    setIsSaving(true);

    const activityDetails = {
      duration_seconds: elapsedTime,
      distance_km: distance,
      avg_pace_min_km: pace,
      calories_kcal: calories,
      elevation_gain_m: elevation,
    };

    const activityData = {
      user_id: user.id,
      type: 'recorded_activity',
      sport: selectedSport.id,
      content: `${selectedSport.name} Activity`,
      details: activityDetails,
    };

    try {
      console.log("Saving activity data:", activityData);
      const savedActivity = await activitiesApi.createActivity(activityData);
      console.log("Activity saved successfully:", savedActivity);

      await refreshProfile();

      Alert.alert(
        'Activity Saved',
        'Your activity has been saved successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      handleDiscard();

    } catch (error) {
      console.error("Failed to save activity:", error);
      Alert.alert('Save Failed', error.message || 'Could not save activity. Please try again.');
    } finally {
      setIsSaving(false);
      setShowExitConfirm(false);
    }
  };

  const handleSelectSport = (sport) => {
    setSelectedSport(sport);
    setShowSportPicker(false);
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
        }}
      />

      {!isRecording ? (
        <View style={styles.setupContainer}>
          <Text style={styles.setupTitle}>Ready to start your activity?</Text>
          
          <Pressable 
            style={styles.sportSelector}
            onPress={() => setShowSportPicker(true)}
          >
            <View style={styles.sportSelectorContent}>
              {selectedSport.icon && <selectedSport.icon size={24} color={colors.primary} />}
              <Text style={styles.sportSelectorText}>{selectedSport.name}</Text>
            </View>
            <ChevronDown size={20} color={colors.text} />
          </Pressable>

          <Image
            source="https://cdn.dribbble.com/users/1162077/screenshots/7118294/media/5c9a5f7a2180d8562982f8f0f0fb8c4b.png"
            style={styles.mapPreview}
            contentFit="contain"
          />
          
          <Text style={styles.setupDescription}>
            Tap the button below to start recording your {selectedSport.name.toLowerCase()} activity.
            We'll track your route, distance, pace, and more.
          </Text>

          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.startButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Pressable onPress={handleStartStop} style={styles.startButtonInner}>
              <Play size={24} color={colors.card} />
              <Text style={styles.startButtonText}>Start Activity</Text>
            </Pressable>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.recordingContainer}>
          <View style={styles.activityHeader}>
            <View style={styles.sportBadge}>
              {selectedSport.icon && <selectedSport.icon size={16} color={colors.primary} />}
              <Text style={styles.sportBadgeText}>{selectedSport.name}</Text>
            </View>
            
            {isPaused && (
              <View style={styles.pausedBadge}>
                <Text style={styles.pausedBadgeText}>PAUSED</Text>
              </View>
            )}
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Time</Text>
            <Text style={styles.timeValue}>{formatTime(elapsedTime)}</Text>
          </View>

          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <MapPin size={20} color={colors.primary} />
                <Text style={styles.metricLabel}>Distance</Text>
                <Text style={styles.metricValue}>{distance.toFixed(2)} km</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Clock size={20} color={colors.primary} />
                <Text style={styles.metricLabel}>Pace</Text>
                <Text style={styles.metricValue}>{pace} /km</Text>
              </View>
            </View>
            
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Activity size={20} color={colors.primary} />
                <Text style={styles.metricLabel}>Calories</Text>
                <Text style={styles.metricValue}>{calories} kcal</Text>
              </View>
              
              <View style={styles.metricItem}>
                <TrendingUp size={20} color={colors.primary} />
                <Text style={styles.metricLabel}>Elevation</Text>
                <Text style={styles.metricValue}>{elevation} m</Text>
              </View>
            </View>
            
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Heart size={20} color={colors.danger} />
                <Text style={styles.metricLabel}>Heart Rate</Text>
                <Text style={styles.metricValue}>{heartRate} bpm</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Thermometer size={20} color={colors.primary} />
                <Text style={styles.metricLabel}>Temperature</Text>
                <Text style={styles.metricValue}>24°C</Text>
              </View>
            </View>
          </View>

          <Image
            source="https://cdn.dribbble.com/users/1162077/screenshots/7118294/media/5c9a5f7a2180d8562982f8f0f0fb8c4b.png"
            style={styles.liveMap}
            contentFit="contain"
          />

          <View style={styles.controlsContainer}>
            <Pressable 
              style={[styles.controlButton, styles.secondaryButton]}
              onPress={handlePauseResume}
            >
              {isPaused ? (
                <Play size={24} color={colors.primary} />
              ) : (
                <Pause size={24} color={colors.primary} />
              )}
            </Pressable>
            
            <Pressable 
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStartStop}
              disabled={isSaving}
            >
              <Square size={24} color={colors.card} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Sport Picker Modal */}
      <Modal
        visible={showSportPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSportPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Sport</Text>
            
            {SPORT_TYPES.map(sport => {
              const SportIcon = sport.icon;
              return (
                <Pressable
                  key={sport.id}
                  style={styles.sportOption}
                  onPress={() => handleSelectSport(sport)}
                >
                  <SportIcon size={24} color={colors.primary} />
                  <Text style={styles.sportOptionText}>{sport.name}</Text>
                </Pressable>
              );
            })}
            
            <Pressable 
              style={styles.cancelButton}
              onPress={() => setShowSportPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isSaving && setShowExitConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Finish Activity?</Text>
            <Text style={styles.modalDescription}>
              Do you want to save or discard this activity?
            </Text>
            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalButton, styles.discardButton, isSaving && styles.disabledButton]}
                onPress={handleDiscard}
                disabled={isSaving}
              >
                <Text style={[styles.modalButtonText, styles.discardButtonText]}>Discard</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.saveButton, isSaving && styles.disabledButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 
                  <ActivityIndicator size="small" color={colors.card} /> : 
                  <Text style={styles.modalButtonText}>Save</Text>
                }
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  setupContainer: {
    flex: 1,
    padding: 24,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  sportSelector: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sportSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sportSelectorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  mapPreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  setupDescription: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  startButton: {
    borderRadius: 12,
    marginTop: 'auto',
  },
  startButtonInner: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  startButtonText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '600',
  },
  recordingContainer: {
    flex: 1,
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  sportBadgeText: {
    color: colors.primary,
    fontWeight: '600',
  },
  pausedBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pausedBadgeText: {
    color: colors.card,
    fontWeight: '600',
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeLabel: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
  },
  metricsContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  liveMap: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 'auto',
    marginBottom: 24,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.danger,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  stopButton: {
    backgroundColor: colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  sportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
    marginBottom: 12,
    gap: 16,
  },
  sportOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  modalButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  discardButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  discardButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textLight,
    fontSize: 16,
  },
});