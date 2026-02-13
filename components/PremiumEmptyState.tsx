import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface PremiumEmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const PremiumEmptyState: React.FC<PremiumEmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const { colors } = useTheme();

  const handleAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAction?.();
  };

  const handleSecondaryAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSecondaryAction?.();
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.gold + '30',
          },
        ]}
      >
        <LinearGradient
          colors={[colors.gold + '10', colors.gold + '05']}
          style={styles.iconGradient}
        >
          <Text style={styles.icon}>{icon}</Text>
        </LinearGradient>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

      <View style={styles.actions}>
        {actionLabel && onAction && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.gold }]}
            onPress={handleAction}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
              {actionLabel}
            </Text>
          </TouchableOpacity>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.gold }]}
            onPress={handleSecondaryAction}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.gold }]}>
              {secondaryActionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
    maxWidth: 320,
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
