import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Konfigurasi awal
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Pastikan saluran notifikasi dibuat
async function ensureNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('vibration-alert', {
      name: 'Getaran Motor',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

export async function requestNotificationPermissions() {
  try {
    // Pastikan saluran notifikasi dibuat
    await ensureNotificationChannel();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted!');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
    
    return token;
  } catch (error) {
    console.error('Permission request error:', error);
    return null;
  }
}

export async function sendVibrationNotification(deviceId: string, deviceData: any) {
  try {
    console.log('Attempting to send notification');
    
    const notification = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚨 Getaran Terdeteksi!",
        body: `Motor dengan ID: ${deviceId} mengalami getaran`,
        data: { 
          deviceId: deviceId,
          latitude: deviceData.latitude,
          longitude: deviceData.longitude
        },
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Kirim segera
    });

    console.log('Notification scheduled:', notification);
  } catch (error) {
    console.error('Detailed notification send error:', error);
  }
}

export function setupNotificationListeners() {
  // Log penerimaan notifikasi
  const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification Received FULL DATA:', JSON.stringify(notification, null, 2));
  });

  // Log interaksi notifikasi
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification Tapped FULL DATA:', JSON.stringify(response, null, 2));
  });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}