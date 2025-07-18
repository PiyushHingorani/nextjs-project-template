/**
 * WhatsApp Push Notification Demo App
 * React Native Firebase FCM Integration
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { CallNotification } from './src/native/CallNotification';

function App() {
  const [fcmToken, setFcmToken] = useState<string>('');
  const [serverKey, setServerKey] = useState<string>('');
  const [notificationTitle, setNotificationTitle] = useState<string>('Incoming Call');
  const [notificationBody, setNotificationBody] = useState<string>('Tap to answer');

  useEffect(() => {
    requestNotificationPermission();
    getFCMToken();
    setupMessageHandlers();
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      } else {
        Alert.alert('Permission Denied', 'Notification permissions were not granted.');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Error', 'Failed to request notification permission');
    }
  };

  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      setFcmToken(token);
      console.log('FCM Token:', token);
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  const setupMessageHandlers = () => {
    // Foreground message handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      try {
        console.log('Foreground message received:', remoteMessage);
        const title = remoteMessage?.notification?.title || 'Incoming Call';
        const body = remoteMessage?.notification?.body || 'Tap to answer';
        CallNotification.showCallNotification(title, body);
      } catch (error) {
        console.error('Error showing foreground notification:', error);
      }
    });

    // Background message handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      try {
        console.log('Background message received:', remoteMessage);
        const title = remoteMessage?.notification?.title || 'Incoming Call';
        const body = remoteMessage?.notification?.body || 'Tap to answer';
        CallNotification.showCallNotification(title, body);
      } catch (error) {
        console.error('Error in background message handler:', error);
      }
    });

    return unsubscribe;
  };

  const sendTestNotification = async () => {
    if (!serverKey.trim()) {
      Alert.alert('Error', 'Please enter your Firebase Server Key');
      return;
    }

    if (!fcmToken.trim()) {
      Alert.alert('Error', 'FCM Token not available');
      return;
    }

    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${serverKey}`,
        },
        body: JSON.stringify({
          to: fcmToken,
          notification: {
            title: notificationTitle,
            body: notificationBody,
          },
          data: {
            screen: 'call',
            type: 'incoming_call',
          },
          priority: 'high',
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Test notification sent successfully!');
      } else {
        Alert.alert('Error', `Failed to send notification: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const showLocalNotification = () => {
    try {
      CallNotification.showCallNotification(notificationTitle, notificationBody);
      Alert.alert('Success', 'Local notification triggered!');
    } catch (error) {
      console.error('Error showing local notification:', error);
      Alert.alert('Error', 'Failed to show local notification');
    }
  };

  const dismissNotification = () => {
    try {
      CallNotification.dismissCallNotification();
      Alert.alert('Success', 'Notification dismissed!');
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const copyTokenToClipboard = () => {
    // In a real app, you'd use @react-native-clipboard/clipboard
    Alert.alert('FCM Token', fcmToken);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>WhatsApp Push Demo</Text>
          <Text style={styles.subtitle}>Firebase Cloud Messaging Integration</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FCM Token</Text>
          <TouchableOpacity onPress={copyTokenToClipboard} style={styles.tokenContainer}>
            <Text style={styles.tokenText} numberOfLines={3}>
              {fcmToken || 'Loading...'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Tap to view full token</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firebase Server Key</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Firebase Server Key"
            value={serverKey}
            onChangeText={setServerKey}
            secureTextEntry
            multiline
          />
          <Text style={styles.hint}>Get this from Firebase Console → Project Settings → Cloud Messaging</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Content</Text>
          <TextInput
            style={styles.input}
            placeholder="Notification Title"
            value={notificationTitle}
            onChangeText={setNotificationTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Notification Body"
            value={notificationBody}
            onChangeText={setNotificationBody}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={sendTestNotification}>
            <Text style={styles.buttonText}>Send FCM Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={showLocalNotification}>
            <Text style={styles.secondaryButtonText}>Show Local Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerButton} onPress={dismissNotification}>
            <Text style={styles.buttonText}>Dismiss Notification</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          <Text style={styles.instructionText}>
            1. Replace google-services.json with your Firebase config{'\n'}
            2. Enter your Firebase Server Key above{'\n'}
            3. Test notifications in foreground, background, and killed states{'\n'}
            4. Notifications will appear as WhatsApp-style heads-up notifications
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#25D366',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  tokenContainer: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  buttonContainer: {
    margin: 10,
  },
  primaryButton: {
    backgroundColor: '#25D366',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#25D366',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#25D366',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#ffffff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default App;
