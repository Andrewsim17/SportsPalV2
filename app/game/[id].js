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
  Award,
  PlusCircle
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/auth-store';
import { gamesApi } from '../../lib/api';
import { chatApi } from '../../lib/api';

// Function to get placeholder images for each sport
const getSportImage = (sport) => {
  // Default sport image if no sport specified
  if (!sport) return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop';
  
  // Map of sports to placeholder images from Unsplash
  const sportImageMap = {
    'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109acd27d?w=800&auto=format&fit=crop',
    'Tennis': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop',
    'Football': 'https://images.unsplash.com/photo-1508098682722-e99c643e7485?w=800&auto=format&fit=crop',
    'Soccer': 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop',
    'Volleyball': 'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&auto=format&fit=crop',
    'Badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop',
    'Running': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop',
    'Cycling': 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop',
    'Swimming': 'https://images.unsplash.com/photo-1600965962161-19c75a0aafcf?w=800&auto=format&fit=crop',
    'Golf': 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&auto=format&fit=crop',
    'Yoga': 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&auto=format&fit=crop',
    'Baseball': 'https://images.unsplash.com/photo-1521941651707-748bdbae77e9?w=800&auto=format&fit=crop',
    'Hiking': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop',
  };
  
  // Return the mapped image or a default sports image if not found
  return sportImageMap[sport] || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop';
};

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
      
      // Get the actual number of participants
      const participantCount = fetchedGame.participants?.length || 0;
      
      const adaptedGame = {
        ...fetchedGame,
        playersCurrent: participantCount,
        playersNeeded: fetchedGame.players_needed || 4,
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
            status: p.status,
            user_id: p.user_id
        })) || []
      };
      
      // Check if organizer is already in participants
      const organizerInParticipants = adaptedGame.participants.some(p => 
        p.isOrganizer || p.id === fetchedGame.organizer?.id
      );
      
      // Add organizer to participants if they're not already included
      if (!organizerInParticipants && adaptedGame.organizer) {
        // Since we're adding the organizer, increment playersCurrent by 1
        adaptedGame.playersCurrent = participantCount + 1;
        
        if (!adaptedGame.participants.some(p => p.id === adaptedGame.organizer.id)) {
          adaptedGame.participants.unshift({
            id: adaptedGame.organizer.id,
            name: adaptedGame.organizer.name,
            avatar: adaptedGame.organizer.avatar,
            isOrganizer: true,
            status: 'confirmed',
            user_id: adaptedGame.organizer.id
          });
        }
      }

      setGame(adaptedGame);
      
      // Check if user has joined the game with any status
      if (user) {
        const userParticipant = adaptedGame.participants.find(p => 
          p.id === user.id || p.user_id === user.id
        );
        if (userParticipant) {
          setIsJoined(true);
        } else {
          setIsJoined(false);
        }
      }

      console.log("Updated game data:", {
        playersCurrent: adaptedGame.playersCurrent,
        playersNeeded: adaptedGame.playersNeeded,
        participants: adaptedGame.participants.length
      });

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
              // For joining, we'll use 'pending' status
              if (isJoined) {
                await gamesApi.leaveGame(game.id, user.id);
                Alert.alert('Success', 'You have left the game!');
              } else {
                // Check if user is already a participant
                const isAlreadyParticipant = game.participants?.some(p => 
                  p.id === user.id || p.user_id === user.id
                );
                
                if (!isAlreadyParticipant) {
                  await gamesApi.joinGame(game.id, user.id, 'pending');
                  Alert.alert('Success', 'You have joined the game!');
                }
              }
              
              // Update isJoined state based on the action performed
              setIsJoined(!isJoined);
              
              // Explicitly fetch game details to update participant count
              await fetchGameDetails();
            } catch (err) {
              console.error(`Failed to ${action.toLowerCase()} game:`, err);
              let errorMessage = err.message || `Could not ${action.toLowerCase()} the game.`;
              
              // Handle specific database constraint errors
              if (err.code === '23514') {
                errorMessage = 'There was an issue with the request format. Please try again.';
              } else if (err.code === '23505') {
                errorMessage = 'You are already a participant in this game.';
                // Set isJoined to true since they are already a participant
                setIsJoined(true);
                await fetchGameDetails(); // Refresh game details
              }
              
              Alert.alert('Error', errorMessage);
              setError(errorMessage);
            } finally {
              setIsJoiningOrLeaving(false);
            }
            },
          },
        ]
      );
  };
  
  const handleMessageOrganizer = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You need to be logged in to message the organizer.');
      return;
    }
    
    if (!game.organizer || !game.organizer.id) {
      Alert.alert('Error', 'Cannot identify the organizer to send a message.');
      return;
    }
    
    try {
      // Show loading indicator
      setIsLoading(true);
      
      // Find or create a chat room with the organizer
      const chatRoom = await chatApi.findOrCreateChatRoom(user.id, game.organizer.id);
      
      // Navigate to the chat screen
      router.push(`/chat/${chatRoom.id}`);
    } catch (error) {
      console.error('Failed to start chat with organizer:', error);
      Alert.alert('Error', 'Could not start a chat with the organizer. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };
  
  const getEndTime = (startDateString, durationMinutes) => {
    if (!startDateString || !durationMinutes) return '';
    
    try {
      const startDate = new Date(startDateString);
      const endDate = new Date(startDate.getTime() + (durationMinutes * 60000));
      
      return endDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch (error) {
      console.error('Error calculating end time:', error);
      return '';
    }
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
  const spotsLeft = Math.max(0, game.playersNeeded - game.playersCurrent);
  const isOrganizer = user && game.organizer && user.id === game.organizer.id;
  
  // Debug information
  console.log("Game detail debug info:");
  console.log("- playersCurrent:", game.playersCurrent);
  console.log("- playersNeeded:", game.playersNeeded);
  console.log("- spotsLeft:", spotsLeft);
  console.log("- isGameFull:", isGameFull);
  console.log("- participants:", game.participants?.length || 0);

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
            source={game.image_url || getSportImage(game.sport)}
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
              <View style={styles.organizerNameRow}>
                <Text style={styles.organizerName}>Organized by {game.organizer.name}</Text>
              </View>
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
              <Text style={styles.detailText}>
                {formatTime(game.date)} to {getEndTime(game.date, game.duration)}
              </Text>
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

          {game.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this game</Text>
              <Text style={styles.description}>{game.description}</Text>
            </View>
          ) : null}

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
              {game.participants && game.participants.length > 0 ? (
                game.participants.map((participant) => (
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
                ))
              ) : (
                // Show organizer if no participants (just created game)
                game.organizer && (
                  <View key={game.organizer.id} style={styles.participantItem}>
                    <Image
                      source={game.organizer.avatar}
                      style={styles.participantAvatar}
                      contentFit="cover"
                    />
                    <Text style={styles.participantName}>{game.organizer.name}</Text>
                    <View style={styles.organizerBadge}>
                      <Text style={styles.organizerBadgeText}>Organizer</Text>
                    </View>
                  </View>
                )
              )}
              
              {/* Show empty spots */}
              {spotsLeft > 0 && Array(spotsLeft).fill().map((_, index) => (
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
    gap: 12,
    marginTop: 8,
  },
  participantItem: {
    alignItems: 'center',
    width: 70,
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
  organizerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  emptyParticipant: {
    width: 70,
    height: 80,
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
});