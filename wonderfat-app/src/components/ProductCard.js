import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, getScoreColor, getScoreLabel } from '../utils/theme';

export default function ProductCard({ product, score, onPress, compact = false }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.compactScore, { backgroundColor: color }]}>
          <Text style={styles.compactScoreText}>{score}</Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.compactBrand} numberOfLines={1}>{product.brand}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name={product.isFood ? 'nutrition' : 'leaf'}
              size={28}
              color={COLORS.gray}
            />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <View style={styles.labelRow}>
            <View style={[styles.scoreBadge, { backgroundColor: color }]}>
              <Text style={styles.scoreBadgeText}>{score}/100 - {label}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    ...SHADOWS.small,
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cream,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  brand: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  labelRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  scoreBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  compactScore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactScoreText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
  },
  compactInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  compactName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  compactBrand: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
