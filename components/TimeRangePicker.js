import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableWithoutFeedback, FlatList } from 'react-native';
import { Clock, ChevronDown, X, Check } from 'lucide-react-native';
import { colors } from '../constants/colors';

// Generate time slots in 15-minute increments (48 hours: from 12am today to 12am two days later)
const generateTimeSlots = () => {
  const slots = [];
  const today = new Date();
  
  // Current day: midnight (0:00) to 11:45 PM (23:45)
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = new Date(today);
      time.setHours(hour, minute, 0, 0);
      slots.push({
        time,
        isNextDay: false
      });
    }
  }
  
  // Next day: midnight (0:00) to 11:45 PM (23:45)
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = new Date(tomorrow);
      time.setHours(hour, minute, 0, 0);
      slots.push({
        time,
        isNextDay: true
      });
    }
  }
  
  return slots;
};

// Generate all time slots but we'll filter them when showing
const ALL_TIME_SLOTS = generateTimeSlots();

export default function TimeRangePicker({ initialStartTime, initialEndTime, onSelectTimeRange }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStartTime, setTempStartTime] = useState(initialStartTime || null);
  const [tempEndTime, setTempEndTime] = useState(initialEndTime || null);
  const [startTime, setStartTime] = useState(initialStartTime || null);
  const [endTime, setEndTime] = useState(initialEndTime || null);
  const [showNextDay, setShowNextDay] = useState(false);
  
  // Filter time slots based on what we're selecting
  const TIME_SLOTS = ALL_TIME_SLOTS.filter(slot => {
    if (selectingStart) {
      // For start time, only show current day
      return !slot.isNextDay;
    } else {
      // For end time, show either current day or next day based on toggle
      return slot.isNextDay === showNextDay;
    }
  });

  // Effect to handle logic after temporary times are set
  useEffect(() => {
    // If we just selected a start time, switch to selecting end time
    if (selectingStart && tempStartTime) {
      // Check if tempEndTime needs to be cleared or adjusted if it's now invalid
      if (tempEndTime && tempEndTime <= tempStartTime) {
        setTempEndTime(null);
      }
      setSelectingStart(false);
      
      // If it's a late night time (after 9 PM), default to showing next day options
      const hour = tempStartTime.getHours();
      setShowNextDay(hour >= 21);
    }
  }, [tempStartTime]); // Run only when tempStartTime changes

  useEffect(() => {
    // If we just selected an end time, and it's valid, confirm
    if (!selectingStart && tempEndTime && tempStartTime && tempEndTime.getTime() > tempStartTime.getTime()) {
      handleConfirm(); 
    }
  }, [tempEndTime]); // Run only when tempEndTime changes


  const toggleModal = () => {
    setModalVisible(!modalVisible);
    if (!modalVisible) {
      // Reset temporary state when opening modal
      setTempStartTime(startTime || null);
      setTempEndTime(endTime || null);
      setSelectingStart(true); // Always start by selecting start time
      setShowNextDay(false); // Default to current day
    }
  };

  // Simplified: Just sets the appropriate temp state
  const handleTimeSelect = (timeObj) => {
    const time = timeObj.time;
    
    if (selectingStart) {
      setTempStartTime(time);
      // Logic moved to useEffect
    } else {
      // For end time
      let adjustedTime = new Date(time);
      
      // If selecting from next day options, make sure it's tomorrow
      if (showNextDay) {
        const tomorrow = new Date(tempStartTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        adjustedTime = new Date(tomorrow);
        adjustedTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
      }
      
      // Check if valid before setting, alert if not
      if (tempStartTime && adjustedTime.getTime() > tempStartTime.getTime()) {
        setTempEndTime(adjustedTime);
        // Confirmation logic moved to useEffect
      } else {
        alert('End time must be after start time');
      }
    }
  };

  const handleConfirm = () => {
    // Ensure we have valid times before calling back
    if (tempStartTime && tempEndTime && tempEndTime.getTime() > tempStartTime.getTime()) {
      setStartTime(tempStartTime);
      setEndTime(tempEndTime);
      onSelectTimeRange(tempStartTime, tempEndTime);
      toggleModal(); // Close modal only on successful confirm
    } else {
        // Optionally alert the user if they press the explicit confirm button with invalid times
        if (!selectingStart) { // Only show alert if trying to confirm end time
            alert('Please select a valid end time that is after the start time.')
        }
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const isTimeSelected = (timeObj) => {
    if (!timeObj) return false;
    const time = timeObj.time;
    
    if (selectingStart && tempStartTime) {
      return time.getHours() === tempStartTime.getHours() && 
             time.getMinutes() === tempStartTime.getMinutes();
    } else if (!selectingStart && tempEndTime) {
      // For end time, need to consider if it's on the next day
      const compareHours = tempEndTime.getHours();
      const compareMinutes = tempEndTime.getMinutes();
      
      const isNextDayEndTime = isEndTimeOnNextDay();
      
      if (timeObj.isNextDay === isNextDayEndTime) {
        return time.getHours() === compareHours && 
               time.getMinutes() === compareMinutes;
      }
    }
    
    return false;
  };

  const isTimeDisabled = (timeObj) => {
    if (!selectingStart && tempStartTime) {
      const time = timeObj.time;
      
      // If viewing current day end times
      if (!showNextDay) {
        // Current day end times before or equal to start time are disabled
      return time <= tempStartTime;
      }
      
      // On next day, no times are disabled
      return false;
    }
    return false;
  };
  
  const isEndTimeOnNextDay = () => {
    if (!tempStartTime || !tempEndTime) return false;
    
    // Check if end date is a different day than start date
    return (
      tempEndTime.getDate() !== tempStartTime.getDate() ||
      tempEndTime.getMonth() !== tempStartTime.getMonth() ||
      tempEndTime.getFullYear() !== tempStartTime.getFullYear()
    );
  };
  
  const toggleDayView = () => {
    setShowNextDay(!showNextDay);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.timeButton} onPress={toggleModal}>
        <Clock size={20} color={colors.primary} />
        <Text style={styles.timeText}>
          {startTime && endTime 
            ? `${formatTime(startTime)} - ${formatTime(endTime)}${isEndTimeOnNextDay() ? ' (next day)' : ''}`
            : 'Select Time Range'}
        </Text>
        <ChevronDown size={20} color={colors.text} />
      </Pressable>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectingStart ? 'Select Start Time' : 'Select End Time'}
                  </Text>
                  <Pressable onPress={toggleModal}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                {selectingStart ? (
                  <Text style={styles.instructionText}>
                    Select when your activity starts
                  </Text>
                ) : (
                  <View>
                  <Text style={styles.instructionText}>
                    Select when your activity ends
                  </Text>
                    <View style={styles.dayToggleContainer}>
                      <Pressable 
                        style={[styles.dayToggleButton, !showNextDay && styles.dayToggleButtonActive]} 
                        onPress={() => setShowNextDay(false)}
                      >
                        <Text style={[styles.dayToggleText, !showNextDay && styles.dayToggleTextActive]}>
                          Same Day
                        </Text>
                      </Pressable>
                      <Pressable 
                        style={[styles.dayToggleButton, showNextDay && styles.dayToggleButtonActive]} 
                        onPress={() => setShowNextDay(true)}
                      >
                        <Text style={[styles.dayToggleText, showNextDay && styles.dayToggleTextActive]}>
                          Next Day
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                <FlatList
                  data={TIME_SLOTS}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.timeItem,
                        isTimeSelected(item) && styles.selectedTimeItem,
                        isTimeDisabled(item) && styles.disabledTimeItem
                      ]}
                      onPress={() => {
                        if (!isTimeDisabled(item)) {
                          handleTimeSelect(item);
                        }
                      }}
                      disabled={isTimeDisabled(item)}
                    >
                      <Text style={[
                        styles.timeItemText,
                        isTimeSelected(item) && styles.selectedTimeItemText,
                        isTimeDisabled(item) && styles.disabledTimeItemText
                      ]}>
                        {formatTime(item.time)}
                      </Text>
                      {isTimeSelected(item) && (
                        <Check size={20} color={colors.card} />
                      )}
                    </Pressable>
                  )}
                  style={styles.timeList}
                />

                {!selectingStart && (
                  <View style={styles.modalFooter}>
                    <Pressable style={styles.backButton} onPress={() => {
                        setSelectingStart(true);
                        setShowNextDay(false);
                    }}>
                      <Text style={styles.backButtonText}>Back</Text>
                    </Pressable>
                    <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                      <Text style={styles.confirmButtonText}>Confirm</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
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
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textLight,
    padding: 16,
    paddingBottom: 8,
    textAlign: 'center',
  },
  dayToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  dayToggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayToggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayToggleText: {
    fontSize: 14,
    color: colors.text,
  },
  dayToggleTextActive: {
    color: colors.card,
    fontWeight: '500',
  },
  timeList: {
    maxHeight: 400,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedTimeItem: {
    backgroundColor: colors.primary,
  },
  disabledTimeItem: {
    opacity: 0.5,
  },
  timeItemText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedTimeItemText: {
    color: colors.card,
    fontWeight: '600',
  },
  disabledTimeItemText: {
    color: colors.textLight,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: colors.textLight,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});