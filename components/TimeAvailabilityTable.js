import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors } from '../constants/colors';

// Generate time slots in 1-hour increments
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour < 23; hour++) { // 6 AM to 10 PM
    const time = new Date();
    time.setHours(hour, 0, 0, 0);
    slots.push(time);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function TimeAvailabilityTable({
  onSelectTime,
  showAllCourts = false,
  courts = [],
  sportType = '',
  bookedSlots = [],
  selectedDate
}) {
  const [selectedTime, setSelectedTime] = useState(null);

  const handleTimeSelect = (time, courtId) => {
    setSelectedTime({ time, courtId });
    if (onSelectTime) {
      onSelectTime(time);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Determine availability based on fetched bookings
  const getAvailability = (timeSlotDate, courtId) => {
    const slotStart = new Date(selectedDate); // Start with selected date
    slotStart.setHours(timeSlotDate.getHours(), timeSlotDate.getMinutes(), 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotStart.getHours() + 1); // Assuming 1-hour slots

    // Check if any booking for this court overlaps with this time slot
    const isBooked = bookedSlots.some(booking => {
      if (booking.court_id !== courtId) return false;
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);
      // Check for overlap: (SlotStart < BookingEnd) and (SlotEnd > BookingStart)
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });

    return isBooked ? 'unavailable' : 'available';
  };

  return (
    <View style={styles.container}>
      {!sportType ? (
        <View style={styles.noCourt}>
          <Text style={styles.noCourtText}>Please select a sport first</Text>
        </View>
      ) : !courts || courts.length === 0 ? (
        <View style={styles.noCourt}>
          <Text style={styles.noCourtText}>No {sportType} courts available at this venue.</Text>
        </View>
      ) : (
        <>
          <View style={styles.courtInfo}>
            <Text style={styles.courtInfoText}>
              Showing availability for all {sportType} courts ({courts.length} courts)
            </Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableContainer}>
              <View style={styles.headerRow}>
                <View style={styles.timeHeaderCell}>
                  <Text style={styles.headerText}>Time</Text>
                </View>
                {courts.map((court) => (
                  <View key={court.id} style={styles.courtHeaderCell}>
                    <Text style={styles.headerText}>{court.name}</Text>
                  </View>
                ))}
              </View>
              
              {TIME_SLOTS.map((time, timeIndex) => (
                <View key={timeIndex} style={styles.timeRow}>
                  <View style={styles.timeCell}>
                    <Text style={styles.timeText}>{formatTime(time)}</Text>
                  </View>
                  
                  {courts.map((court) => {
                    const availability = getAvailability(time, court.id);
                    const isSelected = selectedTime && 
                      selectedTime.time.getHours() === time.getHours() && 
                      selectedTime.courtId === court.id;
                    
                    return (
                      <Pressable
                        key={`${court.id}-${timeIndex}`}
                        style={[
                          styles.availabilityCell,
                          availability === 'unavailable' && styles.unavailableCell,
                          isSelected && styles.selectedCell
                        ]}
                        onPress={() => availability !== 'unavailable' && handleTimeSelect(time, court.id)}
                        disabled={availability === 'unavailable'}
                      >
                        {availability === 'available' && !isSelected && (
                          <View style={styles.availableDot} />
                        )}
                        {availability === 'unavailable' && (
                          <Text style={styles.unavailableText}>X</Text>
                        )}
                        {isSelected && (
                          <Text style={styles.selectedText}>✓</Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.inactive }]} />
              <Text style={styles.legendText}>Unavailable</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
          </View>
          
          {selectedTime && (
            <View style={styles.selectedTimeContainer}>
              <Text style={styles.selectedTimeLabel}>Selected:</Text>
              <Text style={styles.selectedTimeValue}>
                {formatTime(selectedTime.time)} - {courts.find(c => c.id === selectedTime.courtId)?.name || 'Court'}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  noCourt: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  noCourtText: {
    color: colors.textLight,
    fontSize: 14,
  },
  courtInfo: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  courtInfoText: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
  tableContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
  },
  timeHeaderCell: {
    width: 80,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.card,
  },
  courtHeaderCell: {
    width: 100,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.card,
  },
  headerText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 14,
  },
  timeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeCell: {
    width: 80,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  timeText: {
    fontSize: 14,
    color: colors.text,
  },
  availabilityCell: {
    width: 100,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  unavailableCell: {
    backgroundColor: colors.inactive + '30',
  },
  selectedCell: {
    backgroundColor: colors.primary + '30',
  },
  availableDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
  },
  unavailableText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.textLight,
  },
  selectedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
  },
  selectedTimeLabel: {
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  selectedTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});