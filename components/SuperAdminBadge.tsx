import React from 'react';
import { Text, StyleSheet } from 'react-native';
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

  return (
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
