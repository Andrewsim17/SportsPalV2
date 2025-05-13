import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors } from '../constants/colors';
import { venuesApi } from '../lib/api';
import { DollarSign } from 'lucide-react-native';

// Generate time slots in 30-minute increments based on working hours
const generateTimeSlots = (startHour = 6, endHour = 23) => {
  const slots = [];
  // Ensure valid hour range
  startHour = Math.max(0, Math.min(23, startHour));
  endHour = Math.max(startHour, Math.min(24, endHour));
  
  for (let hour = startHour; hour < endHour; hour++) {
    // Add full hour slot
    const fullHourTime = new Date();
    fullHourTime.setHours(hour, 0, 0, 0);
    slots.push(fullHourTime);
    
    // Add half hour slot
    const halfHourTime = new Date();
    halfHourTime.setHours(hour, 30, 0, 0);
    slots.push(halfHourTime);
  }
  return slots;
};

// Parse working hours string into start and end hours
const parseWorkingHours = (hoursStr) => {
  if (!hoursStr || hoursStr === 'N/A') return { start: 9, end: 18 }; // Default 9 AM - 6 PM
  
  try {
    // Expected format: "9 AM - 6 PM"
    const parts = hoursStr.split('-');
    if (parts.length !== 2) return { start: 9, end: 18 };
    
    let startStr = parts[0].trim();
    let endStr = parts[1].trim();
    
    // Parse start hour
    let startHour = parseInt(startStr);
    if (isNaN(startHour)) return { start: 9, end: 18 };
    if (startStr.toLowerCase().includes('pm') && startHour < 12) startHour += 12;
    
    // Parse end hour
    let endHour = parseInt(endStr);
    if (isNaN(endHour)) return { start: 9, end: 18 };
    if (endStr.toLowerCase().includes('pm') && endHour < 12) endHour += 12;
    
    return { start: startHour, end: endHour };
  } catch (error) {
    console.error('Error parsing working hours:', error);
    return { start: 9, end: 18 }; // Default if parsing fails
  }
};

export default function TimeAvailabilityTable({
  onSelectTime,
  showAllCourts = false,
  courts = [],
  sportType = '',
  bookedSlots = [],
  selectedDate,
  venueHours = null, // Working hours parameter
  venueId = null, // Needed for pricing lookup
  courtUnderMaintenance = null // New parameter to identify courts under maintenance
}) {
  // Generate time slots based on venue hours if available
  const [timeSlots, setTimeSlots] = useState([]);
  
  // Store multiple selected time slots grouped by court
  const [selectedSlots, setSelectedSlots] = useState({});
  
  // Store court pricing information
  const [courtsPricing, setCourtsPricing] = useState({});
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  
  // Fetch pricing for courts when they change
  useEffect(() => {
    const fetchPricing = async () => {
      if (!venueId || !courts || courts.length === 0 || !selectedDate) return;
      
      setIsPricingLoading(true);
      try {
        // Get pricing for all courts at this venue
        const pricing = await venuesApi.getVenuePricing(
          venueId, 
          sportType, 
          selectedDate
        );
        
        // Convert to a more accessible format
        const pricingMap = {};
        pricing.forEach(courtPricing => {
          const hourlyPrices = {};
          // Store the default price for this court
          pricingMap[courtPricing.courtId] = {
            defaultPrice: courtPricing.defaultPrice,
            hourlyPrices: {}
          };
          
          // Map each hour's price
          if (Array.isArray(courtPricing.pricing)) {
            courtPricing.pricing.forEach(hourPrice => {
              if (hourPrice && typeof hourPrice.hour === 'number') {
                hourlyPrices[hourPrice.hour] = hourPrice.price;
                // Also add half-hour price (same as the hour price)
                hourlyPrices[`${hourPrice.hour}-30`] = hourPrice.price;
              }
            });
            pricingMap[courtPricing.courtId].hourlyPrices = hourlyPrices;
          }
        });
        
        setCourtsPricing(pricingMap);
      } catch (error) {
        console.error('Error fetching court pricing:', error);
      } finally {
        setIsPricingLoading(false);
      }
    };
    
    fetchPricing();
  }, [venueId, courts, sportType, selectedDate]);
  
  // Initialize time slots based on venue hours if available
  useEffect(() => {
    let workingHours;
    
    // Check if selected date is today and calculate current hour
    const today = new Date();
    const isToday = selectedDate && 
      selectedDate.getDate() === today.getDate() && 
      selectedDate.getMonth() === today.getMonth() && 
      selectedDate.getFullYear() === today.getFullYear();
    
    const currentHour = today.getHours();
    
    // Determine working hours based on weekday/weekend
    if (venueHours) {
      const currentDay = selectedDate.getDay();
      const isWeekend = currentDay === 0 || currentDay === 6; // 0 = Sunday, 6 = Saturday
      
      if (isWeekend && venueHours.weekends && venueHours.weekends !== 'N/A') {
        workingHours = parseWorkingHours(venueHours.weekends);
      } else if (venueHours.weekdays && venueHours.weekdays !== 'N/A') {
        workingHours = parseWorkingHours(venueHours.weekdays);
      } else {
        // Default hours
        workingHours = { start: 9, end: 18 };
      }
    } else {
      // Default hours if no venue hours provided
      workingHours = { start: 9, end: 18 };
    }
    
    // If today, only show slots from current hour onwards
    let effectiveStartHour = workingHours.start;
    if (isToday && currentHour >= workingHours.start) {
      effectiveStartHour = currentHour;
    }
    
    // Generate time slots based on working hours
    setTimeSlots(generateTimeSlots(effectiveStartHour, workingHours.end));
  }, [venueHours, selectedDate]);

  // Get price for a specific court at a specific time
  const getPriceForTime = (courtId, time) => {
    if (!courtsPricing[courtId]) {
      return null; // No pricing info for this court
    }
    
    const hour = time.getHours();
    const minutes = time.getMinutes();
    const timeKey = minutes === 0 ? hour : `${hour}-${minutes}`;
    
    // Get the price for this specific hour/half-hour if available
    const hourPrice = courtsPricing[courtId].hourlyPrices[timeKey];
    
    // Return the specific price or the default price
    return hourPrice !== undefined 
      ? hourPrice 
      : courtsPricing[courtId].defaultPrice;
  };
  
  // Calculate total price for selected slots
  const calculateTotalPrice = () => {
    let total = 0;
    
    Object.entries(selectedSlots).forEach(([courtId, slots]) => {
      slots.forEach(slot => {
        const price = getPriceForTime(courtId, slot.time);
        // Each slot is 30 minutes, so divide price by 2
        total += (price || 25.00) / 2;
      });
    });
    
    return total;
  };

  const handleTimeSelect = (time, courtId) => {
    // Create a copy of the current selections
    const newSelectedSlots = { ...selectedSlots };
    
    // Get the court's selections or initialize an empty array
    const courtSelections = newSelectedSlots[courtId] || [];
    
    // Check if this time is already selected for this court
    const timeKey = `${time.getHours()}-${time.getMinutes()}`;
    const existingIndex = courtSelections.findIndex(
      slot => `${slot.time.getHours()}-${slot.time.getMinutes()}` === timeKey
    );
    
    if (existingIndex !== -1) {
      // Remove time slot if already selected
      courtSelections.splice(existingIndex, 1);
      
      // If no more selections for this court, remove the court entry
      if (courtSelections.length === 0) {
        delete newSelectedSlots[courtId];
      } else {
        newSelectedSlots[courtId] = courtSelections;
      }
    } else {
      // Add new time slot to this court's selections
      const newCourtSelections = [...courtSelections, { time, courtId }];
      
      // Sort by time
      newCourtSelections.sort((a, b) => {
        if (a.time.getHours() === b.time.getHours()) {
          return a.time.getMinutes() - b.time.getMinutes();
        }
        return a.time.getHours() - b.time.getHours();
      });
      
      // Check if slots are consecutive for this court
      let isConsecutive = true;
      for (let i = 1; i < newCourtSelections.length; i++) {
        const prevTime = newCourtSelections[i-1].time;
        const currTime = newCourtSelections[i].time;
        
        // Calculate difference in minutes
        const prevMinutes = prevTime.getHours() * 60 + prevTime.getMinutes();
        const currMinutes = currTime.getHours() * 60 + currTime.getMinutes();
        
        // Check if times are 30 minutes apart
        if (currMinutes - prevMinutes !== 30) {
          isConsecutive = false;
          break;
        }
      }
      
      if (isConsecutive) {
        newSelectedSlots[courtId] = newCourtSelections;
      } else {
        // Alert user they need to select consecutive times
        alert('Please select consecutive time slots for each court');
      }
    }
    
    setSelectedSlots(newSelectedSlots);
  };

  // Update parent component whenever selections change
  useEffect(() => {
    if (onSelectTime && Object.keys(selectedSlots).length > 0) {
      // Prepare selections for parent component
      const selections = Object.entries(selectedSlots).map(([courtId, slots]) => {
        // Sort slots by time
        const sortedSlots = [...slots].sort((a, b) => {
          const aTime = a.time.getHours() * 60 + a.time.getMinutes();
          const bTime = b.time.getHours() * 60 + b.time.getMinutes();
          return aTime - bTime;
        });
        
        // Calculate start and end times
        const startTime = new Date(sortedSlots[0].time);
        const endTime = new Date(sortedSlots[sortedSlots.length - 1].time);
        
        // Add 30 minutes to end time for the slot duration
        endTime.setMinutes(endTime.getMinutes() + 30);
        
        // Calculate total price for this court
        let totalPrice = 0;
        slots.forEach(slot => {
          const price = getPriceForTime(courtId, slot.time);
          totalPrice += (price || 25.00) / 2; // Each slot is 30 minutes
        });
        
        return {
          courtId,
          start: startTime,
          end: endTime,
          // Duration in hours (convert 30-min increments to hours)
          duration: sortedSlots.length / 2,
          price: totalPrice
        };
      });
      
      onSelectTime(selections);
    } else if (onSelectTime) {
      onSelectTime([]); // Clear selection in parent
    }
  }, [selectedSlots, onSelectTime, courtsPricing]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatPrice = (price) => {
    return price !== null ? `$${parseFloat(price).toFixed(2)}` : '-';
  };

  // Determine availability based on fetched bookings
  const getAvailability = (timeSlotDate, courtId) => {
    const slotStart = new Date(selectedDate); // Start with selected date
    slotStart.setHours(timeSlotDate.getHours(), timeSlotDate.getMinutes(), 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + 30); // 30-minute slots

    // Check if court is under maintenance
    const court = courts.find(c => c.id === courtId);
    if (court && courtUnderMaintenance && court.name.includes(courtUnderMaintenance)) {
      return 'maintenance'; // Special status for maintenance
    }

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

  // Check if a time slot is selected for a specific court
  const isTimeSelected = (time, courtId) => {
    if (!selectedSlots[courtId]) return false;
    
    const timeKey = `${time.getHours()}-${time.getMinutes()}`;
    return selectedSlots[courtId].some(
      slot => `${slot.time.getHours()}-${slot.time.getMinutes()}` === timeKey
    );
  };

  // Get formatted time range for display
  const getTimeRangeText = (courtId) => {
    const slots = selectedSlots[courtId];
    if (!slots || slots.length === 0) return '';
    
    // Sort by time
    const sortedSlots = [...slots].sort((a, b) => {
      const aTime = a.time.getHours() * 60 + a.time.getMinutes();
      const bTime = b.time.getHours() * 60 + b.time.getMinutes();
      return aTime - bTime;
    });
    
    const startTime = sortedSlots[0].time;
    const endTime = new Date(sortedSlots[sortedSlots.length - 1].time);
    endTime.setMinutes(endTime.getMinutes() + 30); // Add 30 minutes for end time
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Get total number of selected time slots across all courts
  const getTotalSelectedSlots = () => {
    return Object.values(selectedSlots).reduce((total, courtSlots) => total + courtSlots.length, 0);
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
      ) : timeSlots.length === 0 ? (
        <View style={styles.noCourt}>
          <Text style={styles.noCourtText}>No available time slots for today.</Text>
        </View>
      ) : (
        <>
          <View style={styles.courtInfo}>
            <Text style={styles.courtInfoText}>
              Showing availability for all {sportType} courts ({courts.length} courts)
            </Text>
            <Text style={styles.helpText}>
              You can select multiple courts and time slots. 
              {isPricingLoading ? ' Loading pricing...' : ' Prices vary by time of day.'}
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
              
              {timeSlots.map((time, timeIndex) => (
                <View key={timeIndex} style={styles.timeRow}>
                  <View style={styles.timeCell}>
                    <Text style={styles.timeText}>{formatTime(time)}</Text>
                  </View>
                  
                  {courts.map((court) => {
                    const availability = getAvailability(time, court.id);
                    const isSelected = isTimeSelected(time, court.id);
                    const isDisabled = availability === 'unavailable' || availability === 'maintenance';
                    const price = getPriceForTime(court.id, time);
                    
                    return (
                      <Pressable
                        key={`${court.id}-${timeIndex}`}
                        style={[
                          styles.availabilityCell,
                          (availability === 'unavailable' || availability === 'maintenance') && 
                            styles.unavailableCell,
                          isSelected && styles.selectedCell
                        ]}
                        onPress={() => !isDisabled && handleTimeSelect(time, court.id)}
                        disabled={isDisabled}
                      >
                        {availability === 'available' && !isSelected && (
                          <View style={styles.availableContent}>
                            <View style={styles.availableDot} />
                            {price !== null && (
                              <Text style={styles.priceText}>{formatPrice(price / 2)}</Text>
                            )}
                          </View>
                        )}
                        {availability === 'unavailable' && (
                          <View style={styles.availableContent}>
                            <View style={[styles.availableDot, { backgroundColor: colors.inactive }]} />
                            {price !== null && (
                              <Text style={styles.unavailableText}>{formatPrice(price / 2)}</Text>
                            )}
                          </View>
                        )}
                        {availability === 'maintenance' && (
                          <View style={styles.availableContent}>
                            <View style={[styles.availableDot, { backgroundColor: colors.inactive }]} />
                            {price !== null && (
                              <Text style={styles.unavailableText}>{formatPrice(price / 2)}</Text>
                            )}
                          </View>
                        )}
                        {isSelected && (
                          <View style={styles.selectedContent}>
                            <Text style={styles.selectedText}>✓</Text>
                            {price !== null && (
                              <Text style={styles.selectedPriceText}>{formatPrice(price / 2)}</Text>
                            )}
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.infoContainer}>
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
            
            <Text style={styles.pricingInfo}>
              * Prices shown are per 30-minute slot
            </Text>
          </View>
          
          {Object.keys(selectedSlots).length > 0 && (
            <View style={styles.selectedTimesContainer}>
              <Text style={styles.selectedTimesTitle}>Selected Time Slots:</Text>
              
              {Object.entries(selectedSlots).map(([courtId, slots]) => {
                const court = courts.find(c => c.id === courtId);
                const duration = slots.length / 2; // Convert 30-min slots to hours
                
                // Calculate total price for this court
                let courtTotal = 0;
                slots.forEach(slot => {
                  const price = getPriceForTime(courtId, slot.time);
                  courtTotal += (price || 25.00) / 2; // Each slot is 30 minutes
                });
                
                return (
                  <View key={courtId} style={styles.selectedCourtContainer}>
                    <View style={styles.selectedCourtHeader}>
                      <Text style={styles.selectedCourtName}>
                        {court?.name || 'Court'}:
                      </Text>
                      <Text style={styles.selectedTimeValue}>
                        {getTimeRangeText(courtId)}
                      </Text>
                    </View>
                    <View style={styles.selectedCourtDetails}>
                      <Text style={styles.selectedDuration}>
                        ({duration} hour{duration !== 1 ? 's' : ''})
                      </Text>
                      <View style={styles.selectedCourtPrice}>
                        <DollarSign size={14} color={colors.primary} />
                        <Text style={styles.selectedPriceTotal}>
                          {formatPrice(courtTotal)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
              
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>
                  Total Selected: {getTotalSelectedSlots() / 2} hour{getTotalSelectedSlots() / 2 !== 1 ? 's' : ''}
                </Text>
                <View style={styles.totalPriceContainer}>
                  <Text style={styles.totalPriceLabel}>Total Price:</Text>
                  <Text style={styles.totalPriceValue}>{formatPrice(calculateTotalPrice())}</Text>
                </View>
              </View>
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
  helpText: {
    color: colors.textLight,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
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
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  timeText: {
    fontSize: 12,
    color: colors.text,
  },
  availabilityCell: {
    width: 100,
    height: 50, // Taller to fit price
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
  availableContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    marginBottom: 4,
  },
  priceText: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  selectedContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: {
    color: colors.textLight,
    fontSize: 10,
    fontWeight: '400',
  },
  selectedText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedPriceText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  infoContainer: {
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    marginBottom: 4,
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
  pricingInfo: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  selectedTimesContainer: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
  },
  selectedTimesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  selectedCourtContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  selectedCourtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedCourtName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginRight: 8,
  },
  selectedTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  selectedCourtDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDuration: {
    fontSize: 12,
    color: colors.textLight,
  },
  selectedCourtPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedPriceTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  totalPriceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  }
});