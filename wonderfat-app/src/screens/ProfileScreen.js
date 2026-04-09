import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { getDailyScans } from '../services/storage';

export default function ProfileScreen({ navigation }) {
  const { state } = useApp();
  const { user, scanHistory, favorites } = state;
  const [dailyScans, setDailyScans] = useState(0);

  useEffect(() => {
    loadDailyScans();
  }, []);

  const loadDailyScans = async () => {
    const data = await getDailyScans();
    setDailyScans(data.count);
  };

  const stats = [
    { label: 'Total Scans', value: scanHistory.length, icon: 'scan-outline' },
    { label: 'Favorites', value: favorites.length, icon: 'heart-outline' },
    { label: 'Today', value: dailyScans, icon: 'today-outline' },
  ];

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
        { icon: 'shield-outline', label: 'Privacy Settings', onPress: () => {} },
      ],
    },
    {
      section: 'WonderFat',
      items: [
        {
          icon: 'cart-outline',
          label: 'Shop WonderFat',
          subtitle: 'Clean, natural tallow skincare',
          onPress: () => Linking.openURL('https://getwonderfat.com'),
        },
        {
          icon: 'logo-amazon',
          label: 'Find Us on Amazon',
          onPress: () => Linking.openURL('https://www.amazon.com/s?k=wonderfat'),
        },
        {
          icon: 'gift-outline',
          label: 'Refer a Friend',
          subtitle: 'Share WonderFat and earn rewards',
          onPress: () => {},
        },
      ],
    },
    {
      section: 'App',
      items: [
        { icon: 'star-outline', label: 'Rate the App', onPress: () => {} },
        { icon: 'help-circle-outline', label: 'Help & FAQ', onPress: () => {} },
        { icon: 'document-text-outline', label: 'Terms of Service', onPress: () => {} },
        { icon: 'lock-closed-outline', label: 'Privacy Policy', onPress: () => {} },
        { icon: 'information-circle-outline', label: 'About', subtitle: 'Version 1.0.0', onPress: () => {} },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]?.toUpperCase() || 'W'}
              {user?.lastName?.[0]?.toUpperCase() || 'F'}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>
          {user?.firstName
            ? `${user.firstName} ${user.lastName || ''}`
            : 'WonderFat Member'}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email || 'Tap to create your account'}
        </Text>
        {user?.source === 'amazon' && (
          <View style={styles.amazonBadge}>
            <Ionicons name="logo-amazon" size={14} color={COLORS.accent} />
            <Text style={styles.amazonBadgeText}>Amazon Customer</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Ionicons name={stat.icon} size={22} color={COLORS.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu Sections */}
      {menuItems.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{section.section}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.menuItem,
                  itemIndex < section.items.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
                activeOpacity={0.6}
              >
                <Ionicons name={item.icon} size={22} color={COLORS.primarySoft} />
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* WonderFat branding footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLogo}>WonderFat</Text>
        <Text style={styles.footerTagline}>Pure. Natural. Honest.</Text>
        <Text style={styles.footerVersion}>Scanner v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header
  header: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  avatarContainer: {
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  userName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.white,
  },
  userEmail: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  amazonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
    gap: 4,
  },
  amazonBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.accentLight,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    marginTop: -20,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  // Menu
  menuSection: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  menuSectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuItemSubtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingBottom: 40,
  },
  footerLogo: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  footerTagline: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  footerVersion: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.lightGray,
    marginTop: SPACING.xs,
  },
});
