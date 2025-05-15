import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Bell, 
  Lock, 
  HelpCircle, 
  FileText, 
  LogOut,
  ChevronRight,
  Moon,
  Edit
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode setting on mount
  useEffect(() => {
    loadDarkModeSetting();
  }, []);

  const loadDarkModeSetting = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode === 'true');
      }
    } catch (error) {
      console.error('Failed to load dark mode setting:', error);
    }
  };

  const handleDarkModeToggle = async (value) => {
    setDarkMode(value);
    try {
      await AsyncStorage.setItem('darkMode', value.toString());
      // In a real app, you would apply the theme change here
      // For now, we'll show an alert to inform the user
      Alert.alert(
        value ? 'Dark Mode Enabled' : 'Dark Mode Disabled',
        'This setting will be saved for your next session. Note: Theme changes not fully implemented in this version.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to save dark mode setting:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleNotifications = () => {
    router.push('/settings/notifications');
  };

  const handlePrivacySecurity = () => {
    router.push('/settings/privacy');
  };

  const handleHelpCenter = () => {
    router.push('/settings/help');
  };

  const handleTermsPolicies = () => {
    router.push('/settings/terms');
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Pressable style={styles.settingItem} onPress={handleNotifications}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
              <Bell size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <ChevronRight size={20} color={colors.textLight} />
        </Pressable>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
              <Moon size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={darkMode ? colors.primary : colors.card}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Pressable style={styles.settingItem} onPress={handleEditProfile}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
              <Edit size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Edit Profile</Text>
          </View>
          <ChevronRight size={20} color={colors.textLight} />
        </Pressable>
        <Pressable style={styles.settingItem} onPress={handlePrivacySecurity}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
              <Lock size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Privacy & Security</Text>
          </View>
          <ChevronRight size={20} color={colors.textLight} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <Pressable style={styles.settingItem} onPress={handleHelpCenter}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
              <HelpCircle size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Help Center</Text>
          </View>
          <ChevronRight size={20} color={colors.textLight} />
        </Pressable>

        <Pressable style={styles.settingItem} onPress={handleTermsPolicies}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
              <FileText size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Terms & Policies</Text>
          </View>
          <ChevronRight size={20} color={colors.textLight} />
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <Text style={styles.versionText}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 12,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 24,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 14,
  },
}); 