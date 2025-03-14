import React, { useState } from 'react';
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
  const [tempStartTime, setTempStartTime] = useState(startTime || null);
  const [tempEndTime, setTempEndTime] = useState(endTime || null);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
    if (!modalVisible) {
      setTempStartTime(startTime || null);
      setTempEndTime(endTime || null);
      setSelectingStart(true);
    }
  };

  const handleTimeSelect = (time) => {
    if (selectingStart) {
      setTempStartTime(time);
      setSelectingStart(false);
    } else {
      // Ensure end time is after start time
      if (time > tempStartTime) {
        setTempEndTime(time);
        handleConfirm();
      } else {
        // Show error or handle invalid selection
        alert('End time must be after start time');
      }
    }
  };

  const handleConfirm = () => {
    if (tempStartTime && tempEndTime) {
      onSelectTimeRange(tempStartTime, tempEndTime);
    }
    toggleModal();
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
                      onPress={() => !isTimeDisabled(item) && handleTimeSelect(item)}
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
                    <Pressable style={styles.backButton} onPress={() => setSelectingStart(true)}>
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