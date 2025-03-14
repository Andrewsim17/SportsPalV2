import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { X, MapPin, Award } from 'lucide-react-native';
import { colors } from '../constants/colors';
import SearchBar from './SearchBar';

const MOCK_PLAYERS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    sports: ['tennis', 'badminton'],
    level: 'intermediate',
    location: '2km away',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
  },
  {
    id: '2',
    name: 'Mike Chen',
    sports: ['basketball', 'volleyball'],
    level: 'advanced',
    location: '5km away',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
  },
  {
    id: '3',
    name: 'David Kim',
    sports: ['football', 'tennis'],
    level: 'beginner',
    location: '3.5km away',
    rating: 4.6,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
  },
];

function PlayerItem({ player }) {
  return (
    <Pressable style={styles.playerItem}>
      <Image source={player.avatar} style={styles.playerAvatar} />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{player.name}</Text>
        <View style={styles.playerMeta}>
          <View style={styles.metaItem}>
            <MapPin size={14} color={colors.textLight} />
            <Text style={styles.metaText}>{player.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Award size={14} color={colors.textLight} />
            <Text style={styles.metaText}>{player.level}</Text>
          </View>
        </View>
        <View style={styles.sportsContainer}>
          {player.sports.map(sport => (
            <View key={sport} style={styles.sportTag}>
              <Text style={styles.sportText}>{sport}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

export default function FindPlayersModal({ visible, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!visible) return null;
  
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Find Players</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </Pressable>
        </View>
        
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, sport, or location"
          onClear={() => setSearchQuery('')}
        />
        
        <FlatList
          data={MOCK_PLAYERS}
          renderItem={({ item }) => <PlayerItem player={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.playersList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    paddingVertical: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  playersList: {
    padding: 16,
  },
  playerItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  playerMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.textLight,
    textTransform: 'capitalize',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});