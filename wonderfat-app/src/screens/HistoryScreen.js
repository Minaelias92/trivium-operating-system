import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { clearHistory } from '../services/storage';
import { calculateHealthScore } from '../services/productDatabase';

export default function HistoryScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('history');

  const data = activeTab === 'history' ? state.scanHistory : state.favorites;

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your scan history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            dispatch({ type: 'CLEAR_HISTORY' });
          },
        },
      ]
    );
  };

  const handleProductPress = (item) => {
    const analysis = calculateHealthScore(item);
    navigation.navigate('ProductResult', {
      scanResult: { product: item, analysis },
    });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={activeTab === 'history' ? 'time-outline' : 'heart-outline'}
        size={64}
        color={COLORS.lightGray}
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'history' ? 'No Scans Yet' : 'No Favorites Yet'}
      </Text>
      <Text style={styles.emptyDescription}>
        {activeTab === 'history'
          ? 'Start scanning products to build your history.'
          : 'Tap the heart icon on any product to save it here.'}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Scanner')}
        activeOpacity={0.8}
      >
        <Ionicons name="scan" size={18} color={COLORS.white} />
        <Text style={styles.emptyButtonText}>Scan a Product</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <ProductCard
      product={item}
      score={item.score || 0}
      onPress={() => handleProductPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.resultCount}>
        {data.length} {data.length === 1 ? 'product' : 'products'}
      </Text>
      {activeTab === 'history' && data.length > 0 && (
        <TouchableOpacity onPress={handleClearHistory}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Products</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color={activeTab === 'history' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
          onPress={() => setActiveTab('favorites')}
        >
          <Ionicons
            name="heart-outline"
            size={18}
            color={activeTab === 'favorites' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
            Favorites
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.barcode}_${index}`}
        ListHeaderComponent={data.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={data.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  // List
  listContent: {
    paddingVertical: SPACING.sm,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  resultCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  clearText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.poor,
    fontWeight: '600',
  },
  // Empty state
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    gap: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
});
