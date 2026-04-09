// Local storage service for user data, scan history, and favorites
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PROFILE: '@wonderfat_user_profile',
  SCAN_HISTORY: '@wonderfat_scan_history',
  FAVORITES: '@wonderfat_favorites',
  ONBOARDING_COMPLETE: '@wonderfat_onboarding_complete',
  DAILY_SCANS: '@wonderfat_daily_scans',
};

// User Profile
export async function saveUserProfile(profile) {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function getUserProfile() {
  const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
}

// Scan History
export async function addToHistory(scan) {
  const history = await getScanHistory();
  const entry = {
    ...scan,
    scannedAt: new Date().toISOString(),
    id: `${scan.barcode}_${Date.now()}`,
  };
  history.unshift(entry);
  // Keep last 500 scans
  const trimmed = history.slice(0, 500);
  await AsyncStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(trimmed));
  return entry;
}

export async function getScanHistory() {
  const data = await AsyncStorage.getItem(KEYS.SCAN_HISTORY);
  return data ? JSON.parse(data) : [];
}

export async function clearHistory() {
  await AsyncStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify([]));
}

// Favorites
export async function addToFavorites(product) {
  const favorites = await getFavorites();
  if (!favorites.find(f => f.barcode === product.barcode)) {
    favorites.unshift({
      ...product,
      favoritedAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
  }
}

export async function removeFromFavorites(barcode) {
  const favorites = await getFavorites();
  const filtered = favorites.filter(f => f.barcode !== barcode);
  await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(filtered));
}

export async function getFavorites() {
  const data = await AsyncStorage.getItem(KEYS.FAVORITES);
  return data ? JSON.parse(data) : [];
}

export async function isFavorite(barcode) {
  const favorites = await getFavorites();
  return favorites.some(f => f.barcode === barcode);
}

// Onboarding
export async function setOnboardingComplete() {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
}

export async function isOnboardingComplete() {
  const data = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
  return data === 'true';
}

// Daily scan tracking
export async function getDailyScans() {
  const data = await AsyncStorage.getItem(KEYS.DAILY_SCANS);
  if (!data) return { date: null, count: 0 };
  const parsed = JSON.parse(data);
  const today = new Date().toISOString().split('T')[0];
  if (parsed.date !== today) return { date: today, count: 0 };
  return parsed;
}

export async function incrementDailyScans() {
  const today = new Date().toISOString().split('T')[0];
  const current = await getDailyScans();
  const updated = {
    date: today,
    count: current.date === today ? current.count + 1 : 1,
  };
  await AsyncStorage.setItem(KEYS.DAILY_SCANS, JSON.stringify(updated));
  return updated;
}
