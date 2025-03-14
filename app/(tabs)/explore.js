import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Search, Filter, MapPin, Award, Star } from 'lucide-react-native';
import { colors } from '../../constants/colors';

const CATEGORIES = [
  { id: 'communities', name: 'Communities' },
  { id: 'coaches', name: 'Coaches' },
  { id: 'players', name: 'Players' },
  { id: 'events', name: 'Events' },
];

const MOCK_COMMUNITIES = [
  {
    id: 'c1',
    name: 'Badminton Enthusiasts',
    members: 1245,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000',
    location: 'Kuala Lumpur',
    description: 'A community for badminton players of all levels to connect and play together.',
  },
  {
    id: 'c2',
    name: 'Basketball League',
    members: 876,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000',
    location: 'Petaling Jaya',
    description: 'Join our basketball league for competitive play and tournaments.',
  },
  {
    id: 'c3',
    name: 'Tennis Club',
    members: 543,
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1000',
    location: 'Shah Alam',
    description: 'A club for tennis enthusiasts to practice, play matches, and improve skills.',
  },
];

const MOCK_COACHES = [
  {
    id: 'coach1',
    name: 'Alex Wong',
    sport: 'Badminton',
    rating: 4.9,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200',
    location: 'Kuala Lumpur',
    experience: '10+ years',
    price: '$50/hour',
  },
  {
    id: 'coach2',
    name: 'Sarah Chen',
    sport: 'Tennis',
    rating: 4.8,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    location: 'Petaling Jaya',
    experience: '8 years',
    price: '$45/hour',
  },
  {
    id: 'coach3',
    name: 'Michael Lee',
    sport: 'Basketball',
    rating: 4.7,
    reviews: 76,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    location: 'Shah Alam',
    experience: '12 years',
    price: '$55/hour',
  },
];

const MOCK_PLAYERS = [
  {
    id: 'player1',
    name: 'Jason Tan',
    sports: ['Basketball', 'Volleyball'],
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    location: 'Kuala Lumpur',
    availability: 'Weekends',
  },
  {
    id: 'player2',
    name: 'Emily Wong',
    sports: ['Tennis', 'Badminton'],
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    location: 'Petaling Jaya',
    availability: 'Evenings',
  },
  {
    id: 'player3',
    name: 'David Lim',
    sports: ['Football', 'Running'],
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200',
    location: 'Shah Alam',
    availability: 'Weekdays',
  },
];

function CommunityCard({ community, onPress }) {
  return (
    <Pressable style={styles.communityCard} onPress={onPress}>
      <Image source={community.image} style={styles.communityImage} contentFit="cover" />
      <View style={styles.communityContent}>
        <Text style={styles.communityName}>{community.name}</Text>
        <View style={styles.communityMeta}>
          <Text style={styles.communityMembers}>{community.members} members</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.textLight} />
            <Text style={styles.locationText}>{community.location}</Text>
          </View>
        </View>
        <Text style={styles.communityDescription} numberOfLines={2}>
          {community.description}
        </Text>
      </View>
    </Pressable>
  );
}

function CoachCard({ coach, onPress }) {
  return (
    <Pressable style={styles.coachCard} onPress={onPress}>
      <Image source={coach.image} style={styles.coachImage} contentFit="cover" />
      <View style={styles.coachContent}>
        <Text style={styles.coachName}>{coach.name}</Text>
        <Text style={styles.coachSport}>{coach.sport} Coach</Text>
        
        <View style={styles.coachMeta}>
          <View style={styles.ratingContainer}>
            <Star size={14} color={colors.primary} fill={colors.primary} />
            <Text style={styles.ratingText}>{coach.rating} ({coach.reviews})</Text>
          </View>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.textLight} />
            <Text style={styles.locationText}>{coach.location}</Text>
          </View>
        </View>
        
        <View style={styles.coachDetails}>
          <Text style={styles.coachExperience}>{coach.experience}</Text>
          <Text style={styles.coachPrice}>{coach.price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function PlayerCard({ player, onPress }) {
  return (
    <Pressable style={styles.playerCard} onPress={onPress}>
      <Image source={player.image} style={styles.playerImage} contentFit="cover" />
      <View style={styles.playerContent}>
        <Text style={styles.playerName}>{player.name}</Text>
        
        <View style={styles.sportsContainer}>
          {player.sports.map(sport => (
            <View key={sport} style={styles.sportTag}>
              <Text style={styles.sportTagText}>{sport}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.playerMeta}>
          <View style={styles.levelContainer}>
            <Award size={14} color={colors.primary} />
            <Text style={styles.levelText}>{player.level}</Text>
          </View>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.textLight} />
            <Text style={styles.locationText}>{player.location}</Text>
          </View>
        </View>
        
        <Text style={styles.availabilityText}>Available: {player.availability}</Text>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('communities');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const renderContent = () => {
    switch (selectedCategory) {
      case 'communities':
        return (
          <FlatList
            data={MOCK_COMMUNITIES}
            renderItem={({ item }) => (
              <CommunityCard 
                community={item} 
                onPress={() => router.push(`/community/${item.id}`)}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        );
      case 'coaches':
        return (
          <FlatList
            data={MOCK_COACHES}
            renderItem={({ item }) => (
              <CoachCard 
                coach={item} 
                onPress={() => router.push(`/coach/${item.id}`)}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        );
      case 'players':
        return (
          <FlatList
            data={MOCK_PLAYERS}
            renderItem={({ item }) => (
              <PlayerCard 
                player={item} 
                onPress={() => router.push(`/player/${item.id}`)}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        );
      default:
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No content available</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Explore',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Pressable style={styles.filterButton}>
          <Filter size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === item.id && styles.categoryButtonTextActive
              ]}>
                {item.name}
              </Text>
            </Pressable>
          )}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: 16,
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.card,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  communityCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  communityImage: {
    width: '100%',
    height: 120,
  },
  communityContent: {
    padding: 16,
  },
  communityName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  communityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  communityMembers: {
    fontSize: 14,
    color: colors.textLight,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.textLight,
  },
  communityDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  coachCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  coachImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  coachContent: {
    flex: 1,
  },
  coachName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  coachSport: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
  },
  coachMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.textLight,
  },
  coachDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coachExperience: {
    fontSize: 14,
    color: colors.textLight,
  },
  coachPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  playerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  playerContent: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  sportTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportTagText: {
    fontSize: 12,
    color: colors.card,
    fontWeight: '500',
  },
  playerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    fontSize: 14,
    color: colors.primary,
  },
  availabilityText: {
    fontSize: 14,
    color: colors.textLight,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textLight,
  },
});