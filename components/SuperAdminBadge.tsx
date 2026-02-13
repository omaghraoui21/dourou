import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SUPER_ADMIN_CONFIG } from '@/config/superAdmin';
import { FontSizes, BorderRadius, Spacing } from '@/constants/theme';

interface SuperAdminBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: any;
}

export const SuperAdminBadge: React.FC<SuperAdminBadgeProps> = ({
  size = 'medium',
  showLabel = true,
  style,
}) => {
  const shineAnim = useRef(new Animated.Value(0)).current;

  const sizeConfig = {
    small: {
      iconSize: 16,
      fontSize: FontSizes.xs,
      padding: Spacing.xs,
    },
    medium: {
      iconSize: 20,
      fontSize: FontSizes.sm,
      padding: Spacing.sm,
    },
    large: {
      iconSize: 24,
      fontSize: FontSizes.md,
      padding: Spacing.md,
    },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    // Periodic shine effect every 3 seconds
    const shineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.delay(2400), // Wait 2.4s before next shine
      ])
    );
    shineLoop.start();

    return () => shineLoop.stop();
  }, [shineAnim]);

  const scale = shineAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.08, 1],
  });

  const opacity = shineAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.85, 1],
  });

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <LinearGradient
        colors={['#FFD700', '#FFA500', '#FF8C00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { padding: config.padding }, style]}
      >
        <Text style={[styles.icon, { fontSize: config.iconSize }]}>
          {SUPER_ADMIN_CONFIG.badge.icon}
        </Text>
        {showLabel && (
          <Text style={[styles.label, { fontSize: config.fontSize }]}>
            {SUPER_ADMIN_CONFIG.badge.label}
          </Text>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  icon: {
    lineHeight: 24,
  },
  label: {
    color: '#0F172A',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
