import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface MaintenanceScreenProps {
  message?: string;
  isKillSwitch?: boolean;
}

export default function MaintenanceScreen({
  message = 'We are currently performing maintenance. Please check back soon.',
  isKillSwitch = false,
}: MaintenanceScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.gradient}
      >
        <BlurView intensity={40} style={styles.blurContainer}>
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, isKillSwitch && styles.iconCircleError]}>
                <Text style={[styles.iconText, isKillSwitch && styles.iconTextError]}>
                  ⚠️
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {isKillSwitch ? 'Service Unavailable' : 'Under Maintenance'}
            </Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Additional Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {isKillSwitch
                  ? 'The app is currently unavailable. We apologize for any inconvenience.'
                  : 'Our team is working hard to improve your experience. We\'ll be back shortly.'}
              </Text>
            </View>

            {/* Branding */}
            <View style={styles.brandingContainer}>
              <Text style={styles.brandingText}>Dourou</Text>
              <Text style={styles.brandingSubtext}>
                Community Savings, Elevated
              </Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width,
    height,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  iconText: {
    fontSize: 56,
  },
  iconTextError: {
    fontSize: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  brandingContainer: {
    alignItems: 'center',
  },
  brandingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 2,
  },
  brandingSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
