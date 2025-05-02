import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hmobcbozoiykckqnugoc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtb2JjYm96b2l5a2NrcW51Z29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNjkyOTksImV4cCI6MjA1ODg0NTI5OX0.7mFBC-JF_VXNvXCRKcR1bk1fyZ3myFN8B0hc5Prppc8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types based on schema
export const TABLES = {
  PROFILES: 'profiles',
  GAMES: 'games',
  GAME_PARTICIPANTS: 'game_participants',
  VENUES: 'venues',
  ACTIVITIES: 'activities',
  ACTIVITY_COMMENTS: 'activity_comments',
  ACTIVITY_LIKES: 'activity_likes',
  CHATS: 'chats',
  MESSAGES: 'messages',
  CHAT_PARTICIPANTS: 'chat_participants',
  NOTIFICATIONS: 'notifications',
  COURTS: 'courts',
  BOOKINGS: 'bookings',
  COMMUNITIES: 'communities',
  COMMUNITY_MEMBERS: 'community_members',
  COMMUNITY_DISCUSSIONS: 'community_discussions',
  COMMUNITY_EVENTS: 'community_events',
  FOLLOWERS: 'followers',
  COACHING_SESSIONS: 'coaching_sessions',
  COACH_REVIEWS: 'coach_reviews',
  COACH_AVAILABILITY: 'coach_availability',
}; 