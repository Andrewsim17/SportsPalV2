import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableWithoutFeedback } from 'react-native';
import { Calendar, ChevronDown, X } from 'lucide-react-native';
import { colors } from '../constants/colors';

export default function CalendarPicker({ selectedDate, onSelectDate }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState(selectedDate || new Date());

  const toggleModal = () => {
    setModalVisible(!modalVisible);
    if (!modalVisible) {
      setTempDate(selectedDate || new Date());
    }
  };

  const handleConfirm = () => {
    onSelectDate(tempDate);
    toggleModal();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Generate a simple calendar view
  const generateCalendar = () => {
    const today = new Date();
    const currentMonth = tempDate.getMonth();
    const currentYear = tempDate.getFullYear();
    
    // Get the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get the number of days in the month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Create array for the days
    const days = [];
    
    // Add empty spaces for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    
    // Create weeks array (array of arrays, each representing a week)
    const weeks = [];
    let week = [];
    
    days.forEach((day, index) => {
      if (index % 7 === 0 && index > 0) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
      if (index === days.length - 1) {
        // Push the last week
        weeks.push(week);
      }
    });
    
    return weeks;
  };

  const changeMonth = (increment) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setTempDate(newDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.getDate() === tempDate.getDate() &&
           date.getMonth() === tempDate.getMonth() &&
           date.getFullYear() === tempDate.getFullYear();
  };

  const isDateInRange = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for proper comparison
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 14); // Limit to 14 days from today
    
    // Normalize comparison date to just date portion (no time)
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    return compareDate >= today && compareDate <= maxDate;
  };

  const weeks = generateCalendar();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <Pressable style={styles.dateButton} onPress={toggleModal}>
        <Calendar size={20} color={colors.primary} />
        <Text style={styles.dateText}>
          {selectedDate ? formatDate(selectedDate) : 'Select Date'}
        </Text>
        <ChevronDown size={20} color={colors.text} />
      </Pressable>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Date</Text>
                  <Pressable onPress={toggleModal}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={styles.calendarHeader}>
                  <Pressable onPress={() => changeMonth(-1)}>
                    <Text style={styles.monthNavButton}>{'<'}</Text>
                  </Pressable>
                  <Text style={styles.monthYearText}>
                    {tempDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  <Pressable onPress={() => changeMonth(1)}>
                    <Text style={styles.monthNavButton}>{'>'}</Text>
                  </Pressable>
                </View>

                <View style={styles.weekdaysRow}>
                  {weekdays.map(day => (
                    <Text key={day} style={styles.weekdayText}>{day}</Text>
                  ))}
                </View>

                {weeks.map((week, weekIndex) => (
                  <View key={weekIndex} style={styles.weekRow}>
                    {week.map((day, dayIndex) => {
                      const inRange = day && isDateInRange(day);
                      const isSelectedDay = day && isSelected(day);
                      const isTodayDay = day && isToday(day);
                      return (
                        <Pressable
                          key={dayIndex}
                          style={[
                            styles.dayCell,
                            // Only apply today style if it's not also selected
                            isTodayDay && !isSelectedDay && styles.today,
                            isSelectedDay && styles.selectedDay,
                            day && !inRange && styles.disabledDay
                          ]}
                          onPress={() => day && inRange && setTempDate(day)}
                          disabled={!day || !inRange}
                        >
                          <Text style={[
                            styles.dayText,
                            // Only apply today text style if it's not also selected
                            isTodayDay && !isSelectedDay && styles.todayText,
                            isSelectedDay && styles.selectedDayText,
                            day && !inRange && styles.disabledDayText
                          ]}>
                            {day ? day.getDate() : ''}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}

                <View style={styles.modalFooter}>
                  <Pressable style={styles.cancelButton} onPress={toggleModal}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </Pressable>
                </View>
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
  dateButton: {
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
  dateText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
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
    width: '90%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    fontSize: 24,
    color: colors.primary,
    paddingHorizontal: 12,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  selectedDayText: {
    color: colors.card,
    fontWeight: '600',
  },
  today: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  todayText: {
    color: colors.primary,
    fontWeight: '600',
  },
  disabledDay: {
    opacity: 0.4,
  },
  disabledDayText: {
    color: colors.textLight,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
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