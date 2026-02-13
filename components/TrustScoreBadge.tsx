import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { FontSizes, BorderRadius, Spacing } from '@/constants/theme';
import { TrustTier } from '@/types';

interface TrustScoreBadgeProps {
  score: number;
  tier: TrustTier;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showScore?: boolean;
  style?: any;
}

const TIER_CONFIG = {
  novice: {
    label: 'Novice',
    icon: '🌱',
    colors: ['#64748B', '#475569'] as const,
    borderColor: '#64748B',
  },
  reliable: {
    label: 'Reliable',
    icon: '⭐',
    colors: ['#3B82F6', '#2563EB'] as const,
    borderColor: '#3B82F6',
  },
  trusted: {
    label: 'Trusted',
    icon: '💎',
    colors: ['#8B5CF6', '#7C3AED'] as const,
    borderColor: '#8B5CF6',
  },
  elite: {
    label: 'Elite',
    icon: '👑',
    colors: ['#D4AF37', '#B8941F'] as const,
    borderColor: '#D4AF37',
  },
  master: {
    label: 'Master',
    icon: '💠',
    colors: ['#FFD700', '#FFA500', '#FF8C00'] as const,
    borderColor: '#FFD700',
  },
};

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  score,
  tier,
  size = 'medium',
  showLabel = true,
  showScore = true,
  style,
}) => {
  const { colors } = useTheme();
  const config = TIER_CONFIG[tier];

  const sizeConfig = {
    small: {
      iconSize: 14,
      fontSize: FontSizes.xs,
      padding: Spacing.xs,
      scoreFontSize: 10,
    },
    medium: {
      iconSize: 18,
      fontSize: FontSizes.sm,
      padding: Spacing.sm,
      scoreFontSize: 12,
    },
    large: {
      iconSize: 24,
      fontSize: FontSizes.md,
      padding: Spacing.md,
      scoreFontSize: 14,
    },
  };

  const sConfig = sizeConfig[size];

  return (
    <View style={[styles.wrapper, style]}>
      <LinearGradient
        colors={config.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { padding: sConfig.padding }]}
      >
        <Text style={[styles.icon, { fontSize: sConfig.iconSize }]}>
          {config.icon}
        </Text>
        {showLabel && (
          <Text style={[styles.label, { fontSize: sConfig.fontSize }]}>
            {config.label}
          </Text>
        )}
      </LinearGradient>
      {showScore && (
        <View style={[styles.scoreContainer, { backgroundColor: colors.card, borderColor: config.borderColor }]}>
          <Text style={[styles.scoreText, { fontSize: sConfig.scoreFontSize, color: colors.text }]}>
            {score.toFixed(1)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  icon: {
    lineHeight: 20,
  },
  label: {
    color: '#0F172A',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scoreContainer: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
  },
  scoreText: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
