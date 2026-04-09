import { Platform } from 'react-native';

let Notifications = null;
let Device = null;
let Constants = null;

if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');
    Constants = require('expo-constants');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {}
}

export async function registerForPushNotifications() {
  if (Platform.OS === 'web' || !Notifications || !Device) return null;

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return null;
    }

    // Get the Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Android needs a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('deals', {
        name: 'Deals & Promotions',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B4332',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('tips', {
        name: 'Health Tips',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('product-alerts', {
        name: 'Product Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    return tokenData.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

// Send the push token to your backend for later use
// Replace this URL with your actual backend endpoint
export async function savePushTokenToServer(token, userEmail) {
  try {
    // TODO: Replace with your actual backend URL
    // This is where you'd send the token to store it for sending promotions
    //
    // Example backend call:
    // await fetch('https://api.getwonderfat.com/push-tokens', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ token, email: userEmail }),
    // });
    //
    console.log('Push token to save:', token, 'for user:', userEmail);
  } catch (error) {
    console.error('Failed to save push token:', error);
  }
}

// Schedule a local notification (useful for reminders)
export async function scheduleLocalNotification({ title, body, data, seconds = 1 }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: { seconds },
  });
}

// Example notification templates for your marketing
export const NOTIFICATION_TEMPLATES = {
  welcomeDiscount: {
    title: 'Welcome to WonderFat! 🌿',
    body: 'Save 15% on your first Subscribe & Save order. Tap to claim your discount!',
    data: { type: 'promo', url: 'https://www.amazon.com/dp/B0F96NJLYC?th=1&subscribe=1' },
  },
  subscribeReminder: {
    title: 'Never Run Out of WonderFat',
    body: 'Set up Subscribe & Save on Amazon and save 10% on every order. Your skin will thank you!',
    data: { type: 'subscribe_save', url: 'https://www.amazon.com/dp/B0F96NJLYC?th=1&subscribe=1' },
  },
  newProduct: {
    title: 'Something New from WonderFat',
    body: 'We just launched a new product! Be the first to try it.',
    data: { type: 'new_product', url: 'https://getwonderfat.com' },
  },
  weeklyTip: {
    title: 'Clean Living Tip of the Week',
    body: 'Did you know? Grass-fed tallow contains the same fats found naturally in healthy skin.',
    data: { type: 'tip' },
  },
  restock: {
    title: 'Time for a Restock?',
    body: 'It\'s been 30 days! Reorder your WonderFat Tallow Balm with Subscribe & Save for 10% off.',
    data: { type: 'restock', url: 'https://www.amazon.com/dp/B0F96NJLYC?th=1&subscribe=1' },
  },
};
