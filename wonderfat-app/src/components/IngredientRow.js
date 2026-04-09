import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';

export default function IngredientRow({ name, percent, risk }) {
  const getRiskIcon = () => {
    switch (risk) {
      case 'high':
        return { name: 'alert-circle', color: COLORS.poor };
      case 'moderate':
        return { name: 'warning', color: COLORS.mediocre };
      case 'safe':
        return { name: 'checkmark-circle', color: COLORS.excellent };
      default:
        return { name: 'ellipse', color: COLORS.gray };
    }
  };

  const icon = getRiskIcon();

  return (
    <View style={styles.row}>
      <Ionicons name={icon.name} size={20} color={icon.color} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {percent != null && (
          <Text style={styles.percent}>{percent.toFixed(1)}%</Text>
        )}
      </View>
      {risk && (
        <View style={[styles.riskBadge, { backgroundColor: icon.color + '20' }]}>
          <Text style={[styles.riskText, { color: icon.color }]}>
            {risk}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  name: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  percent: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  riskText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
