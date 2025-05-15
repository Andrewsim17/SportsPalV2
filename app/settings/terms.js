import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors } from '../../constants/colors';
import { FileText, Shield, ChevronRight } from 'lucide-react-native';

export default function TermsPoliciesScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Pressable style={styles.docItem}>
            <View style={styles.docLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
                <FileText size={20} color={colors.primary} />
              </View>
              <Text style={styles.docText}>Terms of Service</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </Pressable>
          
          <Pressable style={styles.docItem}>
            <View style={styles.docLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
                <Shield size={20} color={colors.primary} />
              </View>
              <Text style={styles.docText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </Pressable>
          
          <Pressable style={styles.docItem}>
            <View style={styles.docLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#A29BFE20' }]}>
                <FileText size={20} color={colors.primary} />
              </View>
              <Text style={styles.docText}>Community Guidelines</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </Pressable>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About SportSync</Text>
          <Text style={styles.infoText}>
            SportSync is a platform designed to connect sports enthusiasts and enable them to find 
            games, connect with players, and track their activities.
          </Text>
          
          <Text style={styles.versionInfo}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2023 SportSync. All rights reserved.</Text>
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
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  docLeft: {
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
  docText: {
    fontSize: 16,
    color: colors.text,
  },
  infoSection: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  versionInfo: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: colors.textLight,
  },
}); 