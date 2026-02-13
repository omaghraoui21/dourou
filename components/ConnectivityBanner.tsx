import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { FontSizes, Spacing } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface ConnectivityBannerProps {
  isOnline: boolean;
}

export const ConnectivityBanner: React.FC<ConnectivityBannerProps> = ({ isOnline }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (!isOnline && !wasOffline) {
      // Just went offline
      setWasOffline(true);
      setShowBanner(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else if (isOnline && wasOffline) {
      // Just came back online
      setWasOffline(false);
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowBanner(false));
      }, 2000); // Show "reconnected" message for 2 seconds
    }
  }, [isOnline, wasOffline, slideAnim]);

  if (!showBanner) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: isOnline ? colors.success : colors.warning,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.bannerText}>
        {isOnline ? '✓ ' + t('connectivity.reconnected') : '⚠ ' + t('connectivity.offline')}
      </Text>
      {!isOnline && (
        <Text style={styles.bannerSubtext}>{t('connectivity.trying_reconnect')}</Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: 40, // Account for safe area
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  bannerSubtext: {
    color: '#FFFFFF',
    fontSize: FontSizes.xs,
    marginTop: 2,
    opacity: 0.9,
  },
});
