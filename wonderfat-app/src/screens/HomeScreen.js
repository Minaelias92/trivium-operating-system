import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, getScoreColor } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { calculateHealthScore } from '../services/productDatabase';

const { width } = Dimensions.get('window');

const TIPS = [
  {
    icon: 'leaf',
    title: 'Why Tallow?',
    body: 'Tallow is bio-identical to human skin oils. It absorbs deeply, nourishes completely, and contains vitamins A, D, E & K.',
    color: COLORS.primary,
  },
  {
    icon: 'alert-circle',
    title: 'Avoid Parabens',
    body: 'Parabens are synthetic preservatives linked to hormone disruption. Check your skincare labels!',
    color: COLORS.poor,
  },
  {
    icon: 'shield-checkmark',
    title: 'Read Labels',
    body: 'If you can\'t pronounce it, your skin probably doesn\'t want it. Choose products with simple, natural ingredients.',
    color: COLORS.primarySoft,
  },
  {
    icon: 'nutrition',
    title: 'Sugar Watch',
    body: 'High sugar intake can cause inflammation and accelerate skin aging. Keep daily sugar under 25g for women, 36g for men.',
    color: COLORS.mediocre,
  },
];

export default function HomeScreen({ navigation }) {
  const { state } = useApp();
  const { user, scanHistory } = state;

  const recentScans = scanHistory.slice(0, 5);

  const handleProductPress = (item) => {
    const analysis = calculateHealthScore(item);
    navigation.navigate('ProductResult', {
      scanResult: { product: item, analysis },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <Text style={styles.greeting}>
            {user?.firstName ? `Hi, ${user.firstName}` : 'Welcome'}
          </Text>
          <Text style={styles.heroTitle}>WonderFat</Text>
          <Text style={styles.heroSubtitle}>Scanner</Text>
          <Text style={styles.heroDescription}>
            Know exactly what's in your food and skincare. Scan any product for an instant health analysis.
          </Text>
        </View>
      </View>

      {/* Scan Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scanner')}
        activeOpacity={0.85}
      >
        <View style={styles.scanButtonInner}>
          <View style={styles.scanIconCircle}>
            <Ionicons name="scan" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.scanButtonText}>
            <Text style={styles.scanButtonTitle}>Scan a Product</Text>
            <Text style={styles.scanButtonSubtitle}>Point your camera at any barcode</Text>
          </View>
          <Ionicons name="arrow-forward" size={22} color={COLORS.primary} />
        </View>
      </TouchableOpacity>

      {/* Quick Stats */}
      {scanHistory.length > 0 && (
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{scanHistory.length}</Text>
            <Text style={styles.statLabel}>Products Scanned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {scanHistory.filter(s => (s.score || 0) >= 50).length}
            </Text>
            <Text style={styles.statLabel}>Good or Better</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.round(scanHistory.reduce((sum, s) => sum + (s.score || 0), 0) / scanHistory.length) || 0}
            </Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>
      )}

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentScans.map((item, index) => (
            <TouchableOpacity
              key={`${item.barcode}_${index}`}
              style={styles.recentItem}
              onPress={() => handleProductPress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.recentScore, { backgroundColor: getScoreColor(item.score || 0) }]}>
                <Text style={styles.recentScoreText}>{item.score || 0}</Text>
              </View>
              <View style={styles.recentInfo}>
                <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.recentBrand} numberOfLines={1}>{item.brand}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Health Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Tips</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tipsContainer}
        >
          {TIPS.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View style={[styles.tipIconBg, { backgroundColor: tip.color + '15' }]}>
                <Ionicons name={tip.icon} size={24} color={tip.color} />
              </View>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipBody}>{tip.body}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Subscribe & Save Banner */}
      <TouchableOpacity
        style={styles.subscribeBanner}
        activeOpacity={0.85}
        onPress={() => Linking.openURL('https://www.amazon.com/dp/B0F96NJLYC?th=1&subscribe=1')}
      >
        <View style={styles.subscribeBannerContent}>
          <Text style={styles.subscribeBannerLabel}>Amazon Subscribe & Save</Text>
          <Text style={styles.subscribeBannerTitle}>Save 10% Every Order</Text>
          <Text style={styles.subscribeBannerBody}>Never run out of WonderFat. Auto-delivered to your door.</Text>
        </View>
        <View style={styles.subscribeBannerButton}>
          <Text style={styles.subscribeBannerButtonText}>Set Up</Text>
        </View>
      </TouchableOpacity>

      {/* WonderFat Promo */}
      <View style={styles.promoCard}>
        <Text style={styles.promoLabel}>FROM THE MAKERS</Text>
        <Text style={styles.promoTitle}>WonderFat Whipped Tallow Balm</Text>
        <Text style={styles.promoBody}>
          Pure grass-fed tallow, Manuka honey, jojoba oil, mango butter & vitamin E. Just 5 clean ingredients for radiant skin.
        </Text>
        <View style={styles.promoIngredients}>
          {['Grass-Fed Tallow', 'Manuka Honey', 'Jojoba Oil', 'Mango Butter', 'Vitamin E'].map((ing, i) => (
            <View key={i} style={styles.promoIngBadge}>
              <Ionicons name="checkmark" size={12} color={COLORS.excellent} />
              <Text style={styles.promoIngText}>{ing}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.promoButton} activeOpacity={0.8}>
          <Text style={styles.promoButtonText}>Learn More</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Hero
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: 64,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {},
  greeting: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: FONTS.sizes.hero,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1,
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.accentLight,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: -4,
  },
  heroDescription: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginTop: SPACING.sm,
  },
  // Scan button
  scanButton: {
    marginTop: -24,
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    ...SHADOWS.large,
  },
  scanButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  scanIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: {
    flex: 1,
  },
  scanButtonTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scanButtonSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  // Quick stats
  quickStats: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  // Sections
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primarySoft,
  },
  // Recent items
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: 6,
    ...SHADOWS.small,
  },
  recentScore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentScoreText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
  },
  recentInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  recentName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  recentBrand: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  // Tips
  tipsContainer: {
    paddingTop: SPACING.xs,
    gap: 12,
  },
  tipCard: {
    width: width * 0.6,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  tipIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  tipBody: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  // Subscribe & Save
  subscribeBanner: {
    margin: SPACING.md,
    marginTop: SPACING.lg,
    backgroundColor: '#FF9900',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscribeBannerContent: {
    flex: 1,
  },
  subscribeBannerLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subscribeBannerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: '#1A1715',
    marginTop: 2,
  },
  subscribeBannerBody: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(0,0,0,0.7)',
    marginTop: 2,
  },
  subscribeBannerButton: {
    backgroundColor: '#1A1715',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginLeft: SPACING.sm,
  },
  subscribeBannerButtonText: {
    color: '#FF9900',
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
  },
  // Promo
  promoCard: {
    margin: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  promoLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.accentLight,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  promoTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.white,
  },
  promoBody: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  promoIngredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.sm,
  },
  promoIngBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  promoIngText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  promoButton: {
    backgroundColor: COLORS.accent,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
  },
  promoButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
