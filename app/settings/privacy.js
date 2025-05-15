import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Pressable, Alert } from 'react-native';
import { colors } from '../../constants/colors';
import { Lock, Eye, Shield, ChevronRight } from 'lucide-react-native';

export default function PrivacySecurityScreen() {
  const [privateProfile, setPrivateProfile] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [activitySharing, setActivitySharing] = useState(true);

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'This feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleTwoFactorAuth = () => {
    Alert.alert(
      'Two-Factor Authentication',
      'This feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleDataPrivacy = () => {
    Alert.alert(
      'Data Privacy',
      'This feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingText}>Private Profile</Text>
              <Text style={styles.settingDescription}>Only followers can see your activities</Text>
            </View>
            <Switch
              value={privateProfile}
              onValueChange={setPrivateProfile}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={privateProfile ? colors.primary : colors.card}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingText}>Location Sharing</Text>
              <Text style={styles.settingDescription}>Share your location on activities</Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={locationSharing ? colors.primary : colors.card}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingText}>Activity Sharing</Text>
              <Text style={styles.settingDescription}>Let others see your activities</Text>
            </View>
            <Switch
              value={activitySharing}
              onValueChange={setActivitySharing}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={activitySharing ? colors.primary : colors.card}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <Pressable style={styles.settingItem} onPress={handleChangePassword}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
                <Lock size={20} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </Pressable>
          
          <Pressable style={styles.settingItem} onPress={handleTwoFactorAuth}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
                <Shield size={20} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>Two-Factor Authentication</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </Pressable>
          
          <Pressable style={styles.settingItem} onPress={handleDataPrivacy}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
                <Eye size={20} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>Data Privacy</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </Pressable>
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
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 16,
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
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
}); 