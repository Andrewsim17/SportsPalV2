import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Share } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ChevronLeft,
  DollarSign,
  Share2,
  MessageSquare,
  Award
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/auth-store';

// Mock game data
const MOCK_GAMES = {
  '1': {
    id: '1',
    sport: 'Basketball',
    title: '3v3 Basketball Tournament',
    location: 'Downtown Sports Center',
    address: '123 Main Street, Downtown',
    date: '2024-02-25T14:00:00Z',
    duration: 120,
    playersNeeded: 6,
    playersCurrent: 4,
    level: 'Intermediate',
    price: 10,
    description: "Join our 3v3 basketball tournament! We need 2 more players to complete the teams. All skill levels welcome but some experience is preferred. We will play a round-robin format with the top teams advancing to playoffs.",
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000',
    organizer: {
      id: 'user2',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
      rating: 4.8,
    },
    participants: [
      {
        id: 'user2',
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
        isOrganizer: true,
      },
      {
        id: 'user3',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
      },
      {
        id: 'user4',
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
      },
      {
        id: 'user5',
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
      }
    ]
  },
  '2': {
    id: '2',
    sport: 'Tennis',
    title: 'Casual Tennis Doubles',
    location: 'Central Tennis Club',
    address: '456 Park Avenue, Westside',
    date: '2024-02-26T09:00:00Z',
    duration: 90,
    playersNeeded: 4,
    playersCurrent: 2,
    level: 'Beginner Friendly',
    price: 15,
    description: "Looking for 2 more players to join us for casual tennis doubles. No experience necessary, just bring a positive attitude! Court fees will be split among all players.",
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1000',
    organizer: {
      id: 'user3',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
      rating: 4.9,
    },
    participants: [
      {
        id: 'user3',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
        isOrganizer: true,
      },
      {
        id: 'user6',
        name: 'James Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200',
      }
    ]
  },
  '3': {
    id: '3',
    sport: 'Basketball',
    title: '3v3 Basketball Game',
    location: 'Downtown Sports Center',
    address: '123 Main Street, Downtown',
    date: '2024-02-28T19:00:00Z',
    duration: 60,
    playersNeeded: 6,
    playersCurrent: 4,
    level: 'Intermediate',
    price: 8,
    description: "Great 3v3 game today! Scored 12 points with 5 assists and 8 rebounds. Our team chemistry is getting better with each game. Can't wait for the tournament next week!",
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000',
    organizer: {
      id: 'user4',
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
      rating: 4.7,
    },
    participants: [
      {
        id: 'user4',
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
        isOrganizer: true,
      },
      {
        id: 'user2',
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
      },
      {
        id: 'user3',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
      },
      {
        id: 'user5',
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
      }
    ]
  }
};

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const game = MOCK_GAMES[id];
  
  const [isJoined, setIsJoined] = useState(false);
  
  if (!game) {
    return (
      <View style={styles.notFound}>
        <Text>Game not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isGameFull = game.playersCurrent >= game.playersNeeded;
  const spotsLeft = game.playersNeeded - game.playersCurrent;
  const isOrganizer = user && user.id === game.organizer.id;
  
  const handleJoinGame = () => {
    if (isGameFull) {
      Alert.alert('Game Full', 'This game is already at capacity.');
      return;
    }
    
    if (isJoined) {
      Alert.alert(
        'Leave Game',
        'Are you sure you want to leave this game?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              setIsJoined(false);
              Alert.alert('Success', 'You have left the game.');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Join Game',
        'By joining this game, you are making a commitment to attend. Cancellations may affect your user rating. Do you want to proceed?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Join',
            onPress: () => {
              setIsJoined(true);
              Alert.alert('Success', 'You have joined the game!');
            },
          },
        ]
      );
    }
  };
  
  const handleMessageOrganizer = () => {
    router.push(`/chat/${game.organizer.id}`);
  };

  const handleShareGame = async () => {
    try {
      const result = await Share.share({
        message: `Join me for ${game.title} at ${game.location} on ${new Date(game.date).toLocaleDateString()}! We need ${spotsLeft} more players.`,
        title: `${game.sport} Game Invitation`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />

      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={game.image}
            style={styles.image}
            contentFit="cover"
          />
          
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.card} />
          </Pressable>
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageFade}
          />
          
          <View style={styles.imageOverlay}>
            <View style={styles.sportBadge}>
              <Text style={styles.sportText}>{game.sport}</Text>
            </View>
            <Text style={styles.title}>{game.title}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.organizerContainer}>
            <Image
              source={game.organizer.avatar}
              style={styles.organizerAvatar}
              contentFit="cover"
            />
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>Organized by {game.organizer.name}</Text>
              <View style={styles.ratingContainer}>
                <Award size={14} color={colors.primary} />
                <Text style={styles.ratingText}>{game.organizer.rating}</Text>
              </View>
            </View>
            {!isOrganizer && (
              <Pressable style={styles.messageButton} onPress={handleMessageOrganizer}>
                <MessageSquare size={20} color={colors.primary} />
              </Pressable>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.detailText}>{formatDate(game.date)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.detailText}>{formatTime(game.date)} • {game.duration} mins</Text>
            </View>
            <View style={styles.detailItem}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.detailText}>{game.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Users size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {game.playersCurrent}/{game.playersNeeded} players • {game.level}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <DollarSign size={20} color={colors.primary} />
              <Text style={styles.detailText}>${game.price}/person</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this game</Text>
            <Text style={styles.description}>{game.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <Text style={styles.locationName}>{game.location}</Text>
              <Text style={styles.locationAddress}>{game.address}</Text>
              <View style={styles.mapPlaceholder}>
                <Text style={styles.mapPlaceholderText}>Map View</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participants ({game.playersCurrent}/{game.playersNeeded})</Text>
            <View style={styles.participantsContainer}>
              {game.participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <Image
                    source={participant.avatar}
                    style={styles.participantAvatar}
                    contentFit="cover"
                  />
                  <Text style={styles.participantName}>{participant.name}</Text>
                  {participant.isOrganizer && (
                    <View style={styles.organizerBadge}>
                      <Text style={styles.organizerBadgeText}>Organizer</Text>
                    </View>
                  )}
                </View>
              ))}
              {Array(spotsLeft).fill().map((_, index) => (
                <View key={`empty-${index}`} style={styles.emptyParticipant}>
                  <Users size={24} color={colors.textLight} />
                  <Text style={styles.emptyParticipantText}>Open Spot</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.shareButton} onPress={handleShareGame}>
          <Share2 size={20} color={colors.primary} />
        </Pressable>
        <Pressable 
          style={[
            styles.joinButton,
            (isGameFull && !isJoined) && styles.joinButtonDisabled,
            isJoined && styles.leaveButton
          ]}
          onPress={handleJoinGame}
          disabled={isGameFull && !isJoined}
        >
          <Text style={[
            styles.joinButtonText,
            isJoined && styles.leaveButtonText
          ]}>
            {isJoined ? 'Leave Game' : isGameFull ? 'Game Full' : 'Join Game'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  sportBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sportText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.card,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.textLight,
  },
  messageButton: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },
  locationCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    color: colors.textLight,
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  participantItem: {
    alignItems: 'center',
    width: 80,
  },
  participantAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  participantName: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  organizerBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  organizerBadgeText: {
    fontSize: 10,
    color: colors.card,
    fontWeight: '500',
  },
  emptyParticipant: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: 12,
  },
  emptyParticipantText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: colors.inactive,
  },
  leaveButton: {
    backgroundColor: colors.danger,
  },
  joinButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButtonText: {
    color: colors.card,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLink: {
    color: colors.primary,
    marginTop: 8,
  },
});