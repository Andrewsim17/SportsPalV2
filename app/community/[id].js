import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  FlatList 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  UserPlus, 
  Info, 
  ChevronRight,
  Share2,
  Bell,
  BellOff,
  User
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_COMMUNITIES = {
  'c1': {
    id: 'c1',
    name: 'Badminton Enthusiasts',
    members: 1245,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000',
    coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2000',
    location: 'Kuala Lumpur',
    description: 'A community for badminton players of all levels to connect and play together. We organize regular games, tournaments, and training sessions for members.',
    founded: 'January 2020',
    memberCount: 1245,
    events: [
      {
        id: 'e1',
        title: 'Weekend Doubles Tournament',
        date: 'This Saturday, 9:00 AM',
        location: 'Sports Arena Badminton Hall',
        participants: 32,
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800'
      },
      {
        id: 'e2',
        title: 'Beginner Training Session',
        date: 'Next Tuesday, 7:00 PM',
        location: 'KLCC Badminton Courts',
        participants: 12,
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800'
      }
    ],
    featuredMembers: [
      {
        id: 'player1',
        name: 'Jason Tan',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
        role: 'Admin'
      },
      {
        id: 'player2',
        name: 'Emily Wong',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
        role: 'Moderator'
      },
      {
        id: 'player3',
        name: 'David Lim',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200',
        role: 'Coach'
      }
    ],
    discussions: [
      {
        id: 'd1',
        title: 'Best rackets for beginners?',
        author: 'Jason Tan',
        authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
        date: '2 days ago',
        replies: 24
      },
      {
        id: 'd2',
        title: 'Looking for doubles partner for tournament',
        author: 'Emily Wong',
        authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
        date: '5 days ago',
        replies: 18
      }
    ]
  },
  'c2': {
    id: 'c2',
    name: 'Basketball League',
    members: 876,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000',
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2000',
    location: 'Petaling Jaya',
    description: 'Join our basketball league for competitive play and tournaments. We welcome players of all skill levels and organize regular games throughout the year.',
    founded: 'March 2019',
    memberCount: 876,
    events: [
      {
        id: 'e1',
        title: '3v3 Street Basketball Tournament',
        date: 'Next Sunday, 4:00 PM',
        location: 'PJ Basketball Court',
        participants: 24,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800'
      }
    ],
    featuredMembers: [
      {
        id: 'player4',
        name: 'Michael Lee',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
        role: 'Admin'
      },
      {
        id: 'player5',
        name: 'Sarah Chen',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
        role: 'Moderator'
      }
    ],
    discussions: [
      {
        id: 'd1',
        title: 'Looking for players for Sunday game',
        author: 'Michael Lee',
        authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
        date: '1 day ago',
        replies: 15
      }
    ]
  },
  'c3': {
    id: 'c3',
    name: 'Tennis Club',
    members: 543,
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1000',
    coverImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=2000',
    location: 'Shah Alam',
    description: 'A club for tennis enthusiasts to practice, play matches, and improve skills. We offer coaching, court bookings, and regular social events.',
    founded: 'June 2021',
    memberCount: 543,
    events: [
      {
        id: 'e1',
        title: 'Tennis Club Championship',
        date: 'Next Month, 15-17',
        location: 'Shah Alam Tennis Complex',
        participants: 32,
        image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=800'
      }
    ],
    featuredMembers: [
      {
        id: 'player6',
        name: 'Alex Wong',
        image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200',
        role: 'Admin'
      }
    ],
    discussions: [
      {
        id: 'd1',
        title: 'Tennis racket restringing service',
        author: 'Alex Wong',
        authorImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200',
        date: '3 days ago',
        replies: 7
      }
    ]
  }
};

export default function CommunityDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const community = MOCK_COMMUNITIES[id];
  const [isJoined, setIsJoined] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  if (!community) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Community Not Found',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.primary,
          }}
        />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Community not found</Text>
        </View>
      </View>
    );
  }

  const handleJoin = () => {
    setIsJoined(!isJoined);
    if (!isJoined) {
      // Auto-enable notifications when joining
      setIsNotificationsEnabled(true);
    }
  };

  const handleToggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
  };

  const handleMessage = () => {
    router.push(`/chat/community-${community.id}`);
  };

  const handleViewEvent = (eventId) => {
    router.push(`/game/${eventId}`);
  };

  const handleViewMember = (memberId) => {
    router.push(`/player/${memberId}`);
  };

  const handleViewDiscussion = (discussionId) => {
    router.push(`/community/${community.id}/discussion/${discussionId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View style={styles.aboutTab}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{community.description}</Text>
              
              <View style={styles.infoRow}>
                <Info size={16} color={colors.textLight} />
                <Text style={styles.infoText}>Founded: {community.founded}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <MapPin size={16} color={colors.textLight} />
                <Text style={styles.infoText}>Location: {community.location}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Users size={16} color={colors.textLight} />
                <Text style={styles.infoText}>Members: {community.memberCount}</Text>
              </View>
            </View>
            
            <View style={styles.featuredMembersSection}>
              <Text style={styles.sectionTitle}>Featured Members</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredMembersContainer}
              >
                {community.featuredMembers.map(member => (
                  <Pressable 
                    key={member.id} 
                    style={styles.memberCard}
                    onPress={() => handleViewMember(member.id)}
                  >
                    <Image 
                      source={member.image} 
                      style={styles.memberImage}
                      contentFit="cover"
                    />
                    <Text style={styles.memberName}>{member.name}</Text>
                    <View style={styles.memberRoleBadge}>
                      <Text style={styles.memberRoleText}>{member.role}</Text>
                    </View>
                  </Pressable>
                ))}
                <Pressable 
                  style={styles.viewAllMembersCard}
                  onPress={() => router.push(`/community/${community.id}/members`)}
                >
                  <View style={styles.viewAllIconContainer}>
                    <Users size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.viewAllText}>View All Members</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        );
      
      case 'events':
        return (
          <View style={styles.eventsTab}>
            {community.events.length > 0 ? (
              community.events.map(event => (
                <Pressable 
                  key={event.id} 
                  style={styles.eventCard}
                  onPress={() => handleViewEvent(event.id)}
                >
                  <Image 
                    source={event.image} 
                    style={styles.eventImage}
                    contentFit="cover"
                  />
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    
                    <View style={styles.eventMeta}>
                      <View style={styles.eventMetaItem}>
                        <Calendar size={14} color={colors.textLight} />
                        <Text style={styles.eventMetaText}>{event.date}</Text>
                      </View>
                      
                      <View style={styles.eventMetaItem}>
                        <MapPin size={14} color={colors.textLight} />
                        <Text style={styles.eventMetaText}>{event.location}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.eventFooter}>
                      <View style={styles.participantsContainer}>
                        <Users size={14} color={colors.textLight} />
                        <Text style={styles.participantsText}>
                          {event.participants} participants
                        </Text>
                      </View>
                      
                      <Pressable style={styles.joinEventButton}>
                        <Text style={styles.joinEventButtonText}>Join</Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No upcoming events</Text>
              </View>
            )}
            
            <Pressable 
              style={styles.createEventButton}
              onPress={() => router.push(`/community/${community.id}/create-event`)}
            >
              <Text style={styles.createEventButtonText}>Create Event</Text>
            </Pressable>
          </View>
        );
      
      case 'discussions':
        return (
          <View style={styles.discussionsTab}>
            {community.discussions.length > 0 ? (
              community.discussions.map(discussion => (
                <Pressable 
                  key={discussion.id} 
                  style={styles.discussionCard}
                  onPress={() => handleViewDiscussion(discussion.id)}
                >
                  <View style={styles.discussionHeader}>
                    <Image 
                      source={discussion.authorImage} 
                      style={styles.discussionAuthorImage}
                      contentFit="cover"
                    />
                    <View style={styles.discussionAuthorInfo}>
                      <Text style={styles.discussionAuthorName}>{discussion.author}</Text>
                      <Text style={styles.discussionDate}>{discussion.date}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.discussionTitle}>{discussion.title}</Text>
                  
                  <View style={styles.discussionFooter}>
                    <View style={styles.repliesContainer}>
                      <MessageCircle size={14} color={colors.textLight} />
                      <Text style={styles.repliesText}>
                        {discussion.replies} replies
                      </Text>
                    </View>
                    
                    <ChevronRight size={18} color={colors.textLight} />
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No discussions yet</Text>
              </View>
            )}
            
            <Pressable 
              style={styles.createDiscussionButton}
              onPress={() => router.push(`/community/${community.id}/create-discussion`)}
            >
              <Text style={styles.createDiscussionButtonText}>Start Discussion</Text>
            </Pressable>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: community.name,
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerRight: () => (
            <Pressable style={styles.shareButton} onPress={() => console.log('Share community')}>
              <Share2 size={22} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView>
        <View style={styles.header}>
          <Image 
            source={community.coverImage} 
            style={styles.coverImage}
            contentFit="cover"
          />
          
          <View style={styles.communityInfo}>
            <Image 
              source={community.image} 
              style={styles.communityImage}
              contentFit="cover"
            />
            
            <View style={styles.communityDetails}>
              <Text style={styles.communityName}>{community.name}</Text>
              
              <View style={styles.locationContainer}>
                <MapPin size={16} color={colors.textLight} />
                <Text style={styles.locationText}>{community.location}</Text>
              </View>
              
              <View style={styles.membersContainer}>
                <Users size={16} color={colors.textLight} />
                <Text style={styles.membersText}>{community.members} members</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable 
            style={[
              styles.joinButton, 
              isJoined && styles.joinedButton
            ]}
            onPress={handleJoin}
          >
            <UserPlus size={20} color={isJoined ? colors.card : colors.primary} />
            <Text style={[
              styles.joinButtonText,
              isJoined && styles.joinedButtonText
            ]}>
              {isJoined ? 'Joined' : 'Join'}
            </Text>
          </Pressable>
          
          {isJoined && (
            <Pressable 
              style={styles.notificationButton}
              onPress={handleToggleNotifications}
            >
              {isNotificationsEnabled ? (
                <Bell size={20} color={colors.primary} />
              ) : (
                <BellOff size={20} color={colors.textLight} />
              )}
            </Pressable>
          )}
          
          <Pressable 
            style={styles.messageButton}
            onPress={handleMessage}
          >
            <MessageCircle size={20} color={colors.card} />
            <Text style={styles.messageButtonText}>Message</Text>
          </Pressable>
        </View>

        <View style={styles.tabsContainer}>
          <Pressable 
            style={[
              styles.tabButton,
              activeTab === 'about' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'about' && styles.activeTabButtonText
            ]}>
              About
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.tabButton,
              activeTab === 'events' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'events' && styles.activeTabButtonText
            ]}>
              Events
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.tabButton,
              activeTab === 'discussions' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('discussions')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'discussions' && styles.activeTabButtonText
            ]}>
              Discussions
            </Text>
          </Pressable>
        </View>

        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 150,
  },
  communityInfo: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  communityImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.card,
    marginTop: -40,
    marginRight: 16,
  },
  communityDetails: {
    flex: 1,
  },
  communityName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  joinedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  joinButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: colors.card,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  messageButtonText: {
    color: colors.card,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  activeTabButtonText: {
    color: colors.primary,
  },
  tabContent: {
    paddingBottom: 24,
  },
  aboutTab: {
    padding: 16,
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  featuredMembersSection: {
    marginBottom: 24,
  },
  featuredMembersContainer: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  memberCard: {
    width: 100,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  memberImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  memberRoleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  memberRoleText: {
    fontSize: 10,
    color: colors.card,
    fontWeight: '500',
  },
  viewAllMembersCard: {
    width: 100,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  eventsTab: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  eventMeta: {
    marginBottom: 16,
    gap: 8,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventMetaText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  joinEventButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinEventButtonText: {
    color: colors.card,
    fontWeight: '500',
  },
  createEventButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createEventButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
  discussionsTab: {
    padding: 16,
  },
  discussionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  discussionAuthorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  discussionAuthorInfo: {
    flex: 1,
  },
  discussionAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  discussionDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  discussionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  repliesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repliesText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  createDiscussionButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createDiscussionButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textLight,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textLight,
  },
  shareButton: {
    padding: 8,
  },
});