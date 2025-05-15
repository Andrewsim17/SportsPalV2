import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { colors } from '../../constants/colors';

export default function NotificationsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [activitiesNotifications, setActivitiesNotifications] = useState(true);
  const [messagesNotifications, setMessagesNotifications] = useState(true);
  const [gamesNotifications, setGamesNotifications] = useState(true);
  const [followersNotifications, setFollowersNotifications] = useState(true);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingText}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications on your device</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={pushEnabled ? colors.primary : colors.card}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingText}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications via email</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={emailEnabled ? colors.primary : colors.card}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingText}>Activities</Text>
              <Text style={styles.settingDescription}>Updates on activities you're interested in</Text>
            </View>
            <Switch
              value={activitiesNotifications}
              onValueChange={setActivitiesNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={activitiesNotifications ? colors.primary : colors.card}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingText}>Messages</Text>
              <Text style={styles.settingDescription}>When you receive new messages</Text>
            </View>
            <Switch
              value={messagesNotifications}
              onValueChange={setMessagesNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={messagesNotifications ? colors.primary : colors.card}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingText}>Games</Text>
              <Text style={styles.settingDescription}>Game invites and updates</Text>
            </View>
            <Switch
              value={gamesNotifications}
              onValueChange={setGamesNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={gamesNotifications ? colors.primary : colors.card}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingText}>Followers</Text>
              <Text style={styles.settingDescription}>When someone follows you</Text>
            </View>
            <Switch
              value={followersNotifications}
              onValueChange={setFollowersNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={followersNotifications ? colors.primary : colors.card}
            />
          </View>
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