import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, getScoreColor, getScoreLabel } from '../utils/theme';
import ScoreCircle from '../components/ScoreCircle';
import NutritionBar from '../components/NutritionBar';
import IngredientRow from '../components/IngredientRow';
import { addToFavorites, removeFromFavorites, isFavorite } from '../services/storage';
import { useApp } from '../context/AppContext';

export default function ProductResultScreen({ route, navigation }) {
  const { scanResult } = route.params;
  const { product, analysis } = scanResult;
  const [isFav, setIsFav] = useState(false);
  const { dispatch } = useApp();

  useEffect(() => {
    checkFavorite();
  }, []);

  const checkFavorite = async () => {
    const fav = await isFavorite(product.barcode);
    setIsFav(fav);
  };

  const toggleFavorite = async () => {
    if (isFav) {
      await removeFromFavorites(product.barcode);
      dispatch({ type: 'REMOVE_FAVORITE', payload: product.barcode });
    } else {
      await addToFavorites({ ...product, score: analysis.score });
      dispatch({ type: 'ADD_FAVORITE', payload: { ...product, score: analysis.score } });
    }
    setIsFav(!isFav);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I scanned ${product.name} with WonderFat Scanner and it scored ${analysis.score}/100 (${getScoreLabel(analysis.score)})! Download the app to check your products.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const scoreColor = getScoreColor(analysis.score);
  const isWonderFatProduct = product.brand === 'WonderFat';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Analysis</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={24}
              color={isFav ? COLORS.poor : COLORS.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Info Card */}
        <View style={styles.productCard}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.productImage} />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Ionicons
                name={product.isFood ? 'nutrition' : 'leaf'}
                size={48}
                color={COLORS.gray}
              />
            </View>
          )}
          <Text style={styles.productBrand}>{product.brand}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          {product.categories ? (
            <Text style={styles.productCategory}>{product.categories}</Text>
          ) : null}
        </View>

        {/* Score */}
        <View style={styles.scoreSection}>
          <ScoreCircle score={analysis.score} size={140} />
        </View>

        {/* WonderFat Badge */}
        {isWonderFatProduct && (
          <View style={styles.wonderfatBadge}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
            <Text style={styles.wonderfatBadgeText}>
              WonderFat Verified - Clean, Natural Ingredients
            </Text>
          </View>
        )}

        {/* Score Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          {Object.entries(analysis.breakdown).map(([key, data]) => (
            <View key={key} style={styles.breakdownRow}>
              <View style={styles.breakdownLabel}>
                <Text style={styles.breakdownName}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Text style={styles.breakdownWeight}>{data.weight}</Text>
              </View>
              <View style={styles.breakdownBarBg}>
                <View
                  style={[
                    styles.breakdownBarFill,
                    {
                      width: `${data.score}%`,
                      backgroundColor: getScoreColor(data.score),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.breakdownScore, { color: getScoreColor(data.score) }]}>
                {data.score}
              </Text>
            </View>
          ))}
        </View>

        {/* Concerns */}
        {analysis.concerns && analysis.concerns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Concerns</Text>
            {analysis.concerns.map((concern, index) => (
              <View key={index} style={styles.concernRow}>
                <View style={[styles.concernDot, {
                  backgroundColor: concern.severity === 'high' ? COLORS.poor : COLORS.mediocre
                }]} />
                <View style={styles.concernInfo}>
                  <Text style={styles.concernType}>{concern.type || concern.ingredient}</Text>
                  <Text style={styles.concernValue}>
                    {concern.value || concern.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Positives */}
        {analysis.positives && analysis.positives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Positives</Text>
            {analysis.positives.map((positive, index) => (
              <View key={index} style={styles.positiveRow}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.excellent} />
                <Text style={styles.positiveText}>
                  {positive.type} {positive.value ? `- ${positive.value}` : ''}
                  {positive.description ? ` - ${positive.description}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Nutrition Facts (food only) */}
        {product.isFood && product.nutrition && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition per 100g</Text>
            <View style={styles.nutritionCard}>
              <NutritionBar label="Energy" value={product.nutrition.energy} unit=" kcal" max={500} color={COLORS.primarySoft} />
              <NutritionBar label="Fat" value={product.nutrition.fat} unit="g" max={30} color={product.nutrition.fat > 17.5 ? COLORS.poor : COLORS.primarySoft} />
              <NutritionBar label="Saturated Fat" value={product.nutrition.saturatedFat} unit="g" max={10} color={product.nutrition.saturatedFat > 5 ? COLORS.poor : COLORS.primarySoft} />
              <NutritionBar label="Sugars" value={product.nutrition.sugars} unit="g" max={30} color={product.nutrition.sugars > 22.5 ? COLORS.poor : COLORS.primarySoft} />
              <NutritionBar label="Salt" value={product.nutrition.salt} unit="g" max={3} color={product.nutrition.salt > 1.5 ? COLORS.poor : COLORS.primarySoft} />
              <NutritionBar label="Fiber" value={product.nutrition.fiber} unit="g" max={10} color={COLORS.excellent} />
              <NutritionBar label="Proteins" value={product.nutrition.proteins} unit="g" max={30} color={COLORS.excellent} />
            </View>
          </View>
        )}

        {/* Ingredients */}
        {product.ingredientsList && product.ingredientsList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Ingredients ({product.ingredientsList.length})
            </Text>
            <View style={styles.ingredientsCard}>
              {product.ingredientsList.map((ingredient, index) => (
                <IngredientRow
                  key={index}
                  name={ingredient.name}
                  percent={ingredient.percent}
                />
              ))}
            </View>
          </View>
        )}

        {/* Raw ingredients text */}
        {product.ingredients && !product.ingredientsList?.length && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsTextCard}>
              <Text style={styles.ingredientsText}>{product.ingredients}</Text>
            </View>
          </View>
        )}

        {/* Subscribe & Save CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.subscribeCta}
            activeOpacity={0.85}
            onPress={() => Linking.openURL('https://www.amazon.com/dp/B0F96NJLYC?th=1&subscribe=1')}
          >
            <View style={styles.subscribeCtaIcon}>
              <Ionicons name="repeat" size={24} color="#FF9900" />
            </View>
            <Text style={styles.subscribeCtaTitle}>Subscribe & Save 10%</Text>
            <Text style={styles.subscribeCtaBody}>
              Get WonderFat Whipped Tallow Balm auto-delivered to your door and save 10% on every order.
            </Text>
            <View style={styles.subscribeCtaButton}>
              <Text style={styles.subscribeCtaButtonText}>Set Up on Amazon</Text>
              <Ionicons name="open-outline" size={14} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* WonderFat CTA */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Looking for Clean Skincare?</Text>
            <Text style={styles.ctaDescription}>
              WonderFat Whipped Tallow Balm is made with just 5 pure, natural ingredients. No synthetics, no fillers, no compromises.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.8}
              onPress={() => Linking.openURL('https://getwonderfat.com')}
            >
              <Text style={styles.ctaButtonText}>Shop WonderFat</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scan again */}
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="scan" size={20} color={COLORS.white} />
          <Text style={styles.scanAgainText}>Scan Another Product</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  scrollView: {
    flex: 1,
  },
  // Product card
  productCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.cream,
    marginBottom: SPACING.md,
  },
  productImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  productBrand: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  productName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 4,
  },
  productCategory: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  // Score
  scoreSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  // WonderFat badge
  wonderfatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  wonderfatBadgeText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Sections
  section: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  // Breakdown
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownLabel: {
    width: 90,
  },
  breakdownName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  breakdownWeight: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
  breakdownBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownScore: {
    width: 30,
    textAlign: 'right',
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  // Concerns
  concernRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: COLORS.card,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  concernDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  concernInfo: {
    flex: 1,
  },
  concernType: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  concernValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Positives
  positiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  positiveText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  // Nutrition
  nutritionCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  // Ingredients
  ingredientsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  ingredientsTextCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  ingredientsText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Subscribe & Save
  subscribeCta: {
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
    borderColor: '#FF9900',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  subscribeCtaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF990015',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  subscribeCtaTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: '#1A1715',
  },
  subscribeCtaBody: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  subscribeCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9900',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  subscribeCtaButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  // CTA
  ctaSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  ctaCard: {
    backgroundColor: COLORS.primary + '08',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  ctaDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  ctaButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Scan again
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    gap: 8,
  },
  scanAgainText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
});
