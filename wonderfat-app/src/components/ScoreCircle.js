import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, getScoreColor, getScoreLabel } from '../utils/theme';

export default function ScoreCircle({ score, size = 120, showLabel = true }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const borderWidth = size * 0.06;
  const fontSize = size * 0.35;
  const labelSize = size * 0.12;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor: color,
            backgroundColor: color + '15',
          },
        ]}
      >
        <Text style={[styles.score, { fontSize, color }]}>
          {score}
        </Text>
        <Text style={[styles.outOf, { fontSize: labelSize, color: color + 'AA' }]}>
          /100
        </Text>
      </View>
      {showLabel && (
        <View style={[styles.labelBadge, { backgroundColor: color }]}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    fontWeight: '800',
    marginTop: 4,
  },
  outOf: {
    fontWeight: '500',
    marginTop: -4,
  },
  labelBadge: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  labelText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
