import React from 'react';
import { View, Text, StyleSheet, Pressable, Share, Alert } from 'react-native';
import { MapPin, Calendar, Users, Clock, Share2 } from 'lucide-react-native';
import { colors } from '../constants/colors';

export default function GameCard({ game, onPress, onJoin, onShare }) {
  const isFullyBooked = game.playersCurrent >= game.playersNeeded;
  const spotsLeft = game.playersNeeded - game.playersCurrent;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleJoinPress = (e) => {
    e.stopPropagation();
    if (onJoin) {
      onJoin();
    }
  };

  const handleSharePress = async (e) => {
    e.stopPropagation();
    try {
      const result = await Share.share({
        message: `Join me for ${game.title} at ${game.location} on ${formatDate(game.date)}! We need ${spotsLeft} more players.`,
        title: `${game.sport} Game Invitation`,
      });
    } catch (error) {
      Alert.alert('Error sharing', error.message);
    }
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.sport}>{game.sport}</Text>
        <Text style={[
          styles.spots,
          isFullyBooked && styles.spotsFull
        ]}>
          {isFullyBooked ? 'Full' : `${spotsLeft} spots left`}
        </Text>
      </View>

      <Text style={styles.title}>{game.title}</Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <MapPin size={16} color={colors.textLight} />
          <Text style={styles.infoText}>{game.location}</Text>
        </View>
        <View style={styles.infoItem}>
          <Calendar size={16} color={colors.textLight} />
          <Text style={styles.infoText}>{formatDate(game.date)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Clock size={16} color={colors.textLight} />
          <Text style={styles.infoText}>{formatTime(game.date)} • {game.duration} mins</Text>
        </View>
        <View style={styles.infoItem}>
          <Users size={16} color={colors.textLight} />
          <Text style={styles.infoText}>{game.playersCurrent}/{game.playersNeeded}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.price}>${game.price}/person</Text>
          <Text style={styles.level}>{game.level}</Text>
        </View>
        <View style={styles.actionButtons}>
          <Pressable 
            style={styles.shareButton}
            onPress={handleSharePress}
          >
            <Share2 size={20} color={colors.primary} />
          </Pressable>
          <Pressable 
            style={[
              styles.joinButton,
              isFullyBooked && styles.joinButtonDisabled
            ]}
            disabled={isFullyBooked}
            onPress={handleJoinPress}
          >
            <Text style={styles.joinButtonText}>
              {isFullyBooked ? 'Full' : 'Join Game'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sport: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  spots: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  spotsFull: {
    color: colors.danger,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoContainer: {
    gap: 12,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  level: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonDisabled: {
    backgroundColor: colors.inactive,
  },
  joinButtonText: {
    color: colors.card,
    fontWeight: '600',
  },
});