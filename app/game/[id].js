import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Share, ActivityIndicator } from 'react-native';
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
import { gamesApi } from '../../lib/api';

export default function GameDetailScreen() {
  const { id: gameId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoiningOrLeaving, setIsJoiningOrLeaving] = useState(false);

  const fetchGameDetails = useCallback(async () => {
    if (!gameId) return;
    console.log(`Fetching details for game ID: ${gameId}`);
    setIsLoading(true);
    setError(null);
    try {
      const fetchedGame = await gamesApi.getGame(gameId);
      console.log("Fetched game details:", fetchedGame);
      
      const adaptedGame = {
        ...fetchedGame,
        playersCurrent: fetchedGame.participants?.length || 0,
        organizer: fetchedGame.organizer ? {
          id: fetchedGame.organizer.id,
          name: fetchedGame.organizer.name || 'Unknown Organizer',
          avatar: fetchedGame.organizer.avatar_url || 'https://ui-avatars.com/api/?name=U&background=6C5CE7&color=fff',
          rating: 4.5,
        } : null,
        participants: fetchedGame.participants?.map(p => ({
            id: p.player?.id,
            name: p.player?.name || 'Unknown Player',
            avatar: p.player?.avatar_url || 'https://ui-avatars.com/api/?name=P&background=cccccc&color=fff',
            isOrganizer: p.player?.id === fetchedGame.organizer?.id,
            status: p.status
        })) || []
      };
      
      setGame(adaptedGame);
      
      if (user && adaptedGame.participants.some(p => p.id === user.id)) {
        setIsJoined(true);
      }

    } catch (err) {
      console.error("Failed to fetch game details:", err);
      setError(err.message || 'Failed to load game details.');
    } finally {
      setIsLoading(false);
    }
  }, [gameId, user]);

  useEffect(() => {
    fetchGameDetails();
  }, [fetchGameDetails]);

  const handleJoinLeaveGame = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You need to be logged in to join or leave games.');
      router.push('/auth/login');
      return;
    }
    if (!game) return;

    const action = isJoined ? 'Leave' : 'Join';
    const apiCall = isJoined ? gamesApi.leaveGame : gamesApi.joinGame;
    const confirmationMessage = isJoined 
      ? 'Are you sure you want to leave this game?' 
      : 'By joining this game, you commit to attend. Cancellations may affect your rating. Do you want to proceed?';

      Alert.alert(
      `Confirm ${action}`,
      confirmationMessage,
        [
        { text: 'Cancel', style: 'cancel' },
          {
          text: action,
          style: isJoined ? 'destructive' : 'default',
          onPress: async () => {
            setIsJoiningOrLeaving(true);
            setError(null);
            try {
              await apiCall(game.id, user.id);
              Alert.alert('Success', `You have ${isJoined ? 'left' : 'joined'} the game!`);
              setIsJoined(!isJoined);
              fetchGameDetails(); 
            } catch (err) {
              console.error(`Failed to ${action.toLowerCase()} game:`, err);
              Alert.alert('Error', err.message || `Could not ${action.toLowerCase()} the game.`);
              setError(err.message);
            } finally {
              setIsJoiningOrLeaving(false);
            }
            },
          },
        ]
      );
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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Pressable onPress={fetchGameDetails}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }
  
  if (!game) {
    return (
      <View style={styles.centered}>
        <Text>Game not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.retryText}>Go back</Text>
        </Pressable>
      </View>
    );
  }
  
  const isGameFull = game.playersCurrent >= game.playersNeeded;
  const spotsLeft = game.playersNeeded - game.playersCurrent;
  const isOrganizer = user && game.organizer && user.id === game.organizer.id;

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
              <Text style={styles.detailText}>{game.location} {game.address ? `(${game.address})` : ''}</Text>
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
              {/* Temporarily commented out empty spot rendering for debugging */}
              {/* {Array(spotsLeft).fill().map((_, index) => (
                <View key={`empty-${index}`} style={styles.emptyParticipant}>
                  <Users size={24} color={colors.textLight} />
                  <Text style={styles.emptyParticipantText}>Open Spot</Text>
                </View>
              ))} */}
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
            isJoined ? styles.leaveButton : (isGameFull ? styles.fullButton : {}),
            isJoiningOrLeaving && styles.disabledButton
          ]}
          onPress={handleJoinLeaveGame}
          disabled={isGameFull && !isJoined || isJoiningOrLeaving}
        >
          {isJoiningOrLeaving ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.joinButtonText}>
              {isJoined ? 'Leave Game' : isGameFull ? 'Game Full' : `Join (${spotsLeft} spots left)`}
          </Text>
          )}
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
  leaveButton: {
    backgroundColor: colors.danger,
  },
  fullButton: {
    backgroundColor: colors.inactive,
  },
  joinButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});