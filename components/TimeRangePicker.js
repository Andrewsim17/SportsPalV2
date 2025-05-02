import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableWithoutFeedback, FlatList } from 'react-native';
import { Clock, ChevronDown, X, Check } from 'lucide-react-native';
import { colors } from '../constants/colors';

// Generate time slots in 30-minute increments
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour < 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      slots.push(time);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function TimeRangePicker({ startTime, endTime, onSelectTimeRange }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStartTime, setTempStartTime] = useState(null);
  const [tempEndTime, setTempEndTime] = useState(null);
  
  // console.log("TimeRangePicker received props - startTime:", startTime, "endTime:", endTime); // REMOVED

  // Effect to handle logic after temporary times are set
  useEffect(() => {
    // If we just selected a start time, switch to selecting end time
    if (selectingStart && tempStartTime) {
      // Check if tempEndTime needs to be cleared or adjusted if it's now invalid
      if (tempEndTime && tempEndTime <= tempStartTime) {
        setTempEndTime(null);
        // console.log("Cleared tempEndTime because it was <= new tempStartTime"); // REMOVED
      }
      // console.log("useEffect: Start time set, switching to select end time."); // REMOVED
      setSelectingStart(false);
    }
  }, [tempStartTime]); // Run only when tempStartTime changes

  useEffect(() => {
    // If we just selected an end time, and it's valid, confirm
    if (!selectingStart && tempEndTime && tempStartTime && tempEndTime.getTime() > tempStartTime.getTime()) {
      // console.log("useEffect: End time set and valid, calling handleConfirm."); // REMOVED
      handleConfirm(); 
    }
  }, [tempEndTime]); // Run only when tempEndTime changes


  const toggleModal = () => {
    setModalVisible(!modalVisible);
    if (!modalVisible) {
      // Reset temporary state when opening modal
      // console.log("Modal opening: Resetting temp times from props:", startTime, endTime); // REMOVED
      setTempStartTime(startTime || null);
      setTempEndTime(endTime || null);
      setSelectingStart(true); // Always start by selecting start time
    }
  };

  // Simplified: Just sets the appropriate temp state
  const handleTimeSelect = (time) => {
    // console.log(`handleTimeSelect: Time=${time?.toISOString()}, selectingStart=${selectingStart}`); // REMOVED
    if (selectingStart) {
      setTempStartTime(time);
      // Logic moved to useEffect
    } else {
      // Check if valid before setting, alert if not
      if (tempStartTime && time.getTime() > tempStartTime.getTime()) {
        setTempEndTime(time);
        // Confirmation logic moved to useEffect
      } else {
        // console.log("Invalid end time selected (<= start time)."); // REMOVED
        alert('End time must be after start time');
      }
    }
  };

  const handleConfirm = () => {
    // Ensure we have valid times before calling back
    if (tempStartTime && tempEndTime && tempEndTime.getTime() > tempStartTime.getTime()) {
      // console.log("TimeRangePicker handleConfirm - Calling onSelectTimeRange with:", tempStartTime, tempEndTime); // REMOVED
      onSelectTimeRange(tempStartTime, tempEndTime);
      toggleModal(); // Close modal only on successful confirm
    } else {
        // console.log("handleConfirm called but times invalid:", tempStartTime, tempEndTime); // REMOVED
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

  const isTimeSelected = (time) => {
    if (!time) return false;
    
    if (selectingStart && tempStartTime) {
      return time.getHours() === tempStartTime.getHours() && 
             time.getMinutes() === tempStartTime.getMinutes();
    } else if (!selectingStart && tempEndTime) {
      return time.getHours() === tempEndTime.getHours() && 
             time.getMinutes() === tempEndTime.getMinutes();
    }
    
    return false;
  };

  const isTimeDisabled = (time) => {
    if (!selectingStart && tempStartTime) {
      return time <= tempStartTime;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.timeButton} onPress={toggleModal}>
        <Clock size={20} color={colors.primary} />
        <Text style={styles.timeText}>
          {startTime && endTime 
            ? `${formatTime(startTime)} - ${formatTime(endTime)}`
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
                  <Text style={styles.instructionText}>
                    Select when your activity ends
                  </Text>
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
                        // console.log(`Time slot pressed: ${formatTime(item)}, selectingStart: ${selectingStart}, isDisabled: ${isTimeDisabled(item)}`); // REMOVED
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
                        {formatTime(item)}
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
                        // console.log("Back button pressed"); // REMOVED
                        setSelectingStart(true);
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
    textAlign: 'center',
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