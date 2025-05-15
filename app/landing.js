import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Dimensions,
  Animated,
  useWindowDimensions
} from 'react-native';
import { Stack, Link, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  ArrowRight, 
  Users, 
  MapPin, 
  Calendar, 
  Activity, 
  Award, 
  MessageCircle,
  Wallet,
  Heart
} from 'lucide-react-native';
import { colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const FEATURES = [
  {
    id: 'connect',
    title: 'Connect with Athletes',
    description: 'Find and connect with other sports enthusiasts in your area',
    icon: Users,
    illustration: 'https://cdn.dribbble.com/users/1162077/screenshots/7475318/media/8837a0ae1265548e27a1a8f7b047de57.png'
  },
  {
    id: 'activities',
    title: 'Track Activities',
    description: 'Record and analyze your workouts, runs, and sports activities',
    icon: Activity,
    illustration: 'https://cdn.dribbble.com/users/1162077/screenshots/5427758/media/e8682b03c6c2a0a69f5a3ec41b7a3393.png'
  },
  {
    id: 'games',
    title: 'Join Games',
    description: 'Find and join pickup games and sports events near you',
    icon: Calendar,
    illustration: 'https://cdn.dribbble.com/users/1162077/screenshots/4649464/media/76bd131b4aa3447eb9f9d0887195af75.png'
  },
  {
    id: 'venues',
    title: 'Book Venues',
    description: 'Discover and book sports facilities and courts',
    icon: MapPin,
    illustration: 'https://cdn.dribbble.com/users/1162077/screenshots/6851911/media/af7c1c39ede6e9f9f8732e88c648e8ae.png'
  },
  {
    id: 'social',
    title: 'Sports Social Network',
    description: 'Share achievements, follow friends, and build your sports community',
    icon: Heart,
    illustration: 'https://cdn.dribbble.com/users/1162077/screenshots/5614035/media/9ef3bce9c0e5f5f05c3fe4e6b3d96295.png'
  },
  {
    id: 'rewards',
    title: 'Earn Rewards',
    description: 'Get credits and unlock benefits as you stay active',
    icon: Wallet,
    illustration: 'https://cdn.dribbble.com/users/1162077/screenshots/4618085/media/e5055be314ea02f9a8a9f1315f3a9641.png'
  }
];

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handlePageChange = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  const scrollToPage = (index) => {
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleGetStarted = () => {
    router.push('/auth/register');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />

      <View style={styles.header}>
        <Text style={styles.logo}>SportsPal</Text>
        <Link href="/auth/login" asChild>
          <Pressable style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </Pressable>
        </Link>
      </View>

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handlePageChange}
        scrollEventThrottle={16}
        style={styles.carousel}
      >
        {FEATURES.map((feature, index) => {
          const FeatureIcon = feature.icon;
          return (
            <View key={feature.id} style={[styles.slide, { width }]}>
              <LinearGradient
                colors={['white', 'rgba(108, 92, 231, 0.1)']}
                style={styles.slideBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.illustrationContainer}>
                <Image
                  source={feature.illustration}
                  style={styles.illustration}
                  contentFit="contain"
                />
              </View>
              <View style={styles.slideContent}>
                <View style={styles.iconContainer}>
                  <FeatureIcon size={32} color={colors.card} />
                </View>
                <Text style={styles.slideTitle}>{feature.title}</Text>
                <Text style={styles.slideDescription}>{feature.description}</Text>
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>

      <View style={styles.paginationContainer}>
        {FEATURES.map((_, index) => (
          <Pressable 
            key={index} 
            style={[
              styles.paginationDot,
              currentPage === index && styles.paginationDotActive
            ]}
            onPress={() => scrollToPage(index)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable 
          onPress={handleGetStarted} 
          style={styles.getStartedButton}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
          <ArrowRight size={20} color={colors.card} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
  },
  loginButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  carousel: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  illustrationContainer: {
    width: '100%',
    height: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  slideContent: {
    padding: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 120,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(108, 92, 231, 0.3)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  footer: {
    padding: 24,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  getStartedButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});