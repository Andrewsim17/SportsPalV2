import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  Settings, 
  Edit, 
  LogOut, 
  MapPin, 
  Calendar, 
  Award,
  Activity,
  Users,
  Heart,
  Wallet,
  CreditCard,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle,
  X,
  Star
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth-store';
import { LinearGradient } from 'expo-linear-gradient';
import { activitiesApi } from '../../lib/api';
import { formatTimeAgo } from '../../utils/date';

const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'deposit',
    amount: 50,
    date: '2 days ago',
    description: 'Added funds'
  },
  {
    id: '2',
    type: 'payment',
    amount: -25,
    date: '1 week ago',
    description: 'Court booking'
  },
  {
    id: '3',
    type: 'reward',
    amount: 10,
    date: '2 weeks ago',
    description: 'Activity bonus'
  }
];

function ActivityItem({ activity, router }) {
  return (
    <Pressable 
      style={styles.activityCard}
      onPress={() => {
        if (activity.id) {
          router.push(`/activity/${activity.id}`);
        }
      }}
    >
      <View style={styles.activityIconContainer}>
        <Activity size={20} color={colors.primary} />
      </View>
      
      <View style={styles.activityInfo}>
        <Text style={styles.activityType}>{activity.title || activity.type || 'Activity'}</Text>
        <Text style={styles.activityMeta}>{activity.date || formatTimeAgo(activity.created_at)} • {activity.details?.location_name || 'No location'}</Text>
        <View style={styles.activityDetails}>
          {activity.details?.duration_min && (
            <Text style={styles.activityDetail}>
              {activity.details.duration_min} min
            </Text>
          )}
          {activity.details?.distance_km && (
            <Text style={styles.activityDetail}>
              {activity.details.distance_km.toFixed(1)} km
            </Text>
          )}
          <Text style={styles.activityDetail}>
            {activity.likes_count || (activity.likes && activity.likes.length) || 0} likes
          </Text>
        </View>
      </View>
      
      <ChevronRight size={20} color={colors.textLight} />
    </Pressable>
  );
}

function TransactionItem({ transaction }) {
  const isPositive = transaction.amount > 0;
  
  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIconContainer}>
        {transaction.type === 'deposit' && (
          <Plus size={16} color={colors.success} />
        )}
        {transaction.type === 'payment' && (
          <CreditCard size={16} color={colors.danger} />
        )}
        {transaction.type === 'reward' && (
          <Star size={16} color={colors.warning} />
        )}
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        isPositive ? styles.positiveAmount : styles.negativeAmount
      ]}>
        {isPositive ? '+' : ''}{transaction.amount} credits
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, refreshProfile, addFunds } = useAuthStore();
  const router = useRouter();
  const [showWallet, setShowWallet] = useState(false);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user activities from API
  const fetchUserActivities = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const userActivities = await activitiesApi.getUserActivities(user.id, 3);
      console.log('Fetched user activities:', userActivities);
      setActivities(userActivities || []);
    } catch (error) {
      console.error('Failed to fetch user activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh profile data and activities when screen is focused
  useEffect(() => {
    refreshProfile();
    fetchUserActivities();
  }, []);

  const handleAddFunds = (amount) => {
    addFunds(amount);
    Alert.alert('Success', `${amount} credits added to your wallet`);
  };

  const handleRecordActivity = () => {
    router.push('/activity/record-live');
  };

  if (!user) {
    router.replace('/auth/login');
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable 
              onPress={() => router.push('/settings')} 
              style={styles.headerButton}
            >
              <Settings size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView>
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image 
            source={user.avatar} 
            style={styles.avatar}
            contentFit="cover"
          />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          
          {user.location && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color={colors.card} />
              <Text style={styles.location}>{user.location}</Text>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats?.activities || 0}</Text>
              <Text style={styles.statLabel}>Activities</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats?.following || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats?.followers || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Wallet Section */}
          <Pressable 
            style={styles.walletCard}
            onPress={() => setShowWallet(true)}
          >
            <View style={styles.walletHeader}>
              <View style={styles.walletTitleContainer}>
                <Wallet size={20} color={colors.primary} />
                <Text style={styles.walletTitle}>SportSync Wallet</Text>
              </View>
              <ChevronRight size={20} color={colors.primary} />
            </View>
            
            <View style={styles.walletBalance}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>{user.wallet?.balance || 0} credits</Text>
            </View>
            
            <View style={styles.walletActions}>
              <Pressable 
                style={styles.walletAction}
                onPress={() => handleAddFunds(50)}
              >
                <Plus size={16} color={colors.primary} />
                <Text style={styles.walletActionText}>Add Funds</Text>
              </Pressable>
              <View style={styles.walletActionDivider} />
              <Pressable style={styles.walletAction}>
                <CreditCard size={16} color={colors.primary} />
                <Text style={styles.walletActionText}>Withdraw</Text>
              </Pressable>
            </View>
          </Pressable>

          {user.bio ? (
            <View style={styles.bioContainer}>
              <Text style={styles.bioTitle}>About</Text>
              <Text style={styles.bio}>{user.bio}</Text>
            </View>
          ) : null}

          {user.sports && user.sports.length > 0 ? (
            <View style={styles.sportsContainer}>
              <Text style={styles.sectionTitle}>Sports</Text>
              <View style={styles.sportsList}>
                {user.sports.map((sport) => (
                  <View key={sport} style={styles.sportTag}>
                    <Text style={styles.sportText}>{sport}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {user.level ? (
            <View style={styles.levelContainer}>
              <Text style={styles.sectionTitle}>Skill Level</Text>
              <View style={styles.levelTag}>
                <Award size={16} color={colors.primary} />
                <Text style={styles.levelText}>{user.level}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.activitiesContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              <Pressable onPress={() => router.push(`/profile/activities`)}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} router={router} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Wallet Modal */}
      <Modal
        visible={showWallet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWallet(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SportSync Wallet</Text>
              <Pressable 
                style={styles.closeButton}
                onPress={() => setShowWallet(false)}
              >
                <X size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.walletBalanceCard}>
              <Text style={styles.walletBalanceLabel}>Available Balance</Text>
              <Text style={styles.walletBalanceAmount}>{user.wallet?.balance || 0} credits</Text>
              <View style={styles.walletBalanceActions}>
                <Pressable 
                  style={styles.walletBalanceAction}
                  onPress={() => {
                    handleAddFunds(100);
                    setShowWallet(false);
                  }}
                >
                  <Plus size={20} color={colors.card} />
                  <Text style={styles.walletBalanceActionText}>Add Funds</Text>
                </Pressable>
                <Pressable style={styles.walletBalanceAction}>
                  <CreditCard size={20} color={colors.card} />
                  <Text style={styles.walletBalanceActionText}>Withdraw</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.transactionsSection}>
              <View style={styles.transactionsHeader}>
                <Text style={styles.transactionsTitle}>Recent Transactions</Text>
                <Pressable>
                  <Text style={styles.viewAllText}>View All</Text>
                </Pressable>
              </View>

              {(user.wallet?.transactions || MOCK_TRANSACTIONS).map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: 8,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.card,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.card,
    marginTop: 16,
  },
  username: {
    fontSize: 16,
    color: colors.card,
    opacity: 0.8,
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  location: {
    fontSize: 14,
    color: colors.card,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
  },
  statLabel: {
    fontSize: 14,
    color: colors.card,
    opacity: 0.8,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.card,
    opacity: 0.3,
  },
  content: {
    padding: 24,
  },
  walletCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  walletBalance: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  walletActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  walletAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  walletActionDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
  },
  walletActionText: {
    color: colors.primary,
    fontWeight: '500',
  },
  subscriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  currentPlan: {
    marginBottom: 12,
  },
  currentPlanLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    color: colors.card,
    fontWeight: '500',
  },
  subscriptionDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  bioContainer: {
    marginBottom: 24,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sportsContainer: {
    marginBottom: 24,
  },
  sportsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sportText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  levelContainer: {
    marginBottom: 24,
  },
  levelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  levelText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  activitiesContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityDetail: {
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  walletBalanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  walletBalanceLabel: {
    fontSize: 14,
    color: colors.card,
    opacity: 0.8,
    marginBottom: 4,
  },
  walletBalanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.card,
    marginBottom: 16,
  },
  walletBalanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  walletBalanceAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  walletBalanceActionText: {
    color: colors.card,
    fontWeight: '600',
  },
  transactionsSection: {
    flex: 1,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveAmount: {
    color: colors.success,
  },
  negativeAmount: {
    color: colors.danger,
  },
});