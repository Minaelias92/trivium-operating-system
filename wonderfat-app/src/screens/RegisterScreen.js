import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { saveUserProfile, setOnboardingComplete } from '../services/storage';
import { useApp } from '../context/AppContext';
import { registerForPushNotifications } from '../services/notifications';

export default function RegisterScreen({ onComplete }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dietaryPreferences: [],
    skinType: '',
    notifications: true,
  });
  const [showPreferences, setShowPreferences] = useState(false);

  const dietaryOptions = [
    'Keto', 'Paleo', 'Gluten-Free', 'Dairy-Free',
    'Vegan', 'Carnivore', 'Low Sugar', 'Organic Only',
  ];

  const skinTypes = [
    'Normal', 'Dry', 'Oily', 'Combination', 'Sensitive',
  ];

  const toggleDietary = (option) => {
    setForm(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(option)
        ? prev.dietaryPreferences.filter(d => d !== option)
        : [...prev.dietaryPreferences, option],
    }));
  };

  const handleSubmit = async () => {
    if (!form.email) {
      Alert.alert('Email Required', 'Please enter your email so we can send you exclusive deals and updates.');
      return;
    }

    // Register for push notifications
    let pushToken = null;
    if (form.notifications) {
      pushToken = await registerForPushNotifications();
    }

    const profile = {
      ...form,
      pushToken,
      createdAt: new Date().toISOString(),
    };

    await saveUserProfile(profile);
    await setOnboardingComplete();
    dispatch({ type: 'SET_USER', payload: profile });
    dispatch({ type: 'SET_ONBOARDING_COMPLETE' });
    onComplete();
  };

  const handleSkip = async () => {
    await setOnboardingComplete();
    dispatch({ type: 'SET_ONBOARDING_COMPLETE' });
    onComplete();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>WonderFat</Text>
          <Text style={styles.subtitle}>Scanner</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Join the WonderFat Family</Text>
          <Text style={styles.description}>
            Get exclusive deals, clean-living tips, and be the first to know about new products.
          </Text>

          <View style={styles.inputGroup}>
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Jane"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.firstName}
                  onChangeText={v => setForm(prev => ({ ...prev, firstName: v }))}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Doe"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.lastName}
                  onChangeText={v => setForm(prev => ({ ...prev, lastName: v }))}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="jane@example.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={v => setForm(prev => ({ ...prev, email: v }))}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="(555) 123-4567"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={v => setForm(prev => ({ ...prev, phone: v }))}
              />
            </View>
          </View>

          {/* Notification opt-in */}
          <TouchableOpacity
            style={styles.notificationRow}
            onPress={() => setForm(prev => ({ ...prev, notifications: !prev.notifications }))}
            activeOpacity={0.7}
          >
            <Ionicons
              name={form.notifications ? 'checkbox' : 'square-outline'}
              size={24}
              color={form.notifications ? COLORS.primary : COLORS.gray}
            />
            <Text style={styles.notificationText}>
              Send me deals, promotions, and clean-living tips
            </Text>
          </TouchableOpacity>

          {/* Optional preferences toggle */}
          <TouchableOpacity
            style={styles.preferencesToggle}
            onPress={() => setShowPreferences(!showPreferences)}
          >
            <Text style={styles.preferencesToggleText}>
              Personalize my experience (optional)
            </Text>
            <Ionicons
              name={showPreferences ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          {showPreferences && (
            <View style={styles.preferencesSection}>
              <Text style={styles.sectionLabel}>Dietary Preferences</Text>
              <View style={styles.chipGrid}>
                {dietaryOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.chip,
                      form.dietaryPreferences.includes(option) && styles.chipActive,
                    ]}
                    onPress={() => toggleDietary(option)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.dietaryPreferences.includes(option) && styles.chipTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>Skin Type</Text>
              <View style={styles.chipGrid}>
                {skinTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      form.skinType === type && styles.chipActive,
                    ]}
                    onPress={() => setForm(prev => ({ ...prev, skinType: type }))}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.skinType === type && styles.chipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>Start Scanning</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: SPACING.sm,
  },
  logo: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.accent,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: -4,
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.md,
  },
  row: {
    flexDirection: 'row',
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  notificationText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  preferencesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  preferencesToggleText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  preferencesSection: {
    marginTop: SPACING.sm,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 36,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  skipButton: {
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    marginLeft: SPACING.md,
    gap: 6,
  },
  continueText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
});
