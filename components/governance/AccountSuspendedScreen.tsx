import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface AccountSuspendedScreenProps {
  status: 'suspended' | 'banned';
  reason?: string;
  suspendedAt?: string;
  bannedAt?: string;
}

export default function AccountSuspendedScreen({
  status,
  reason,
  suspendedAt,
  bannedAt,
}: AccountSuspendedScreenProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const handleContactSupport = () => {
    // Open email client or support page
    // You can implement this based on your support system
  };

  const isBanned = status === 'banned';
  const timestamp = isBanned ? bannedAt : suspendedAt;
  const date = timestamp ? new Date(timestamp).toLocaleDateString() : 'Unknown';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={isBanned ? ['#7F1D1D', '#991B1B', '#DC2626'] : ['#78350F', '#92400E', '#D97706']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BlurView intensity={40} style={styles.blurContainer}>
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, isBanned && styles.iconCircleBanned]}>
                  <Text style={styles.iconText}>
                    {isBanned ? '🚫' : '⚠️'}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.title}>
                {isBanned ? 'Account Banned' : 'Account Suspended'}
              </Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>
                {isBanned
                  ? 'Your account has been permanently banned'
                  : 'Your account has been temporarily suspended'}
              </Text>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <Text style={styles.infoLabel}>Status</Text>
                </View>
                <Text style={styles.infoValue}>
                  {isBanned ? 'Permanently Banned' : 'Temporarily Suspended'}
                </Text>

                <View style={[styles.infoRow, styles.infoRowMargin]}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <Text style={styles.infoLabel}>Date</Text>
                </View>
                <Text style={styles.infoValue}>{date}</Text>

                {reason && (
                  <>
                    <View style={[styles.infoRow, styles.infoRowMargin]}>
                      <Text style={styles.infoIcon}>ℹ️</Text>
                      <Text style={styles.infoLabel}>Reason</Text>
                    </View>
                    <Text style={styles.infoValue}>{reason}</Text>
                  </>
                )}
              </View>

              {/* Message */}
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>
                  {isBanned
                    ? 'Your account has been permanently banned due to violation of our Terms of Service. This action is final and cannot be reversed.'
                    : 'Your account has been temporarily suspended. You can still view your data, but you cannot create or modify any information until your account is reactivated.'}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {!isBanned && (
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={handleContactSupport}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonIcon}>✉️</Text>
                    <Text style={styles.contactButtonText}>Contact Support</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.signOutButton}
                  onPress={handleSignOut}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonIcon}>🚪</Text>
                  <Text style={styles.signOutButtonText}>Sign Out</Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <Text style={styles.footer}>
                If you believe this is a mistake, please contact our support
                team at support@dourou.app
              </Text>
            </View>
          </BlurView>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleBanned: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  iconText: {
    fontSize: 56,
  },
  infoIcon: {
    fontSize: 18,
  },
  buttonIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoRowMargin: {
    marginTop: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  messageBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  messageText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
