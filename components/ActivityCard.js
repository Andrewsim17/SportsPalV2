import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Heart, MessageCircle, MapPin, Clock } from 'lucide-react-native';
import { colors } from '../constants/colors';
import PropTypes from 'prop-types';

export function ActivityCard({ activity, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {activity.image && (
        <Image
          source={activity.image}
          style={styles.image}
          contentFit="cover"
        />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.sport}>{activity.sport}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {activity.description}
        </Text>

        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <Clock size={16} color={colors.textLight} />
            <Text style={styles.metaText}>{activity.duration}m</Text>
          </View>
          {activity.location && (
            <View style={styles.metaItem}>
              <MapPin size={16} color={colors.textLight} />
              <Text style={styles.metaText}>{activity.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <View style={styles.actionItem}>
            <Heart size={20} color={colors.textLight} />
            <Text style={styles.actionText}>{activity.likes}</Text>
          </View>
          <View style={styles.actionItem}>
            <MessageCircle size={20} color={colors.textLight} />
            <Text style={styles.actionText}>{activity.comments}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

ActivityCard.propTypes = {
  activity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    location: PropTypes.string,
    sport: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    comments: PropTypes.number.isRequired,
    image: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sport: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: colors.textLight,
  },
});