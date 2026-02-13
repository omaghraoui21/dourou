import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

interface TontineCelebrationProps {
  tontineName: string;
  totalAmount: number;
  totalRounds: number;
  totalMembers: number;
  completionDate: Date;
}

export const TontineCelebration: React.FC<TontineCelebrationProps> = ({
  tontineName,
  totalAmount,
  totalRounds,
  totalMembers,
  completionDate,
}) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 8 }, () => ({
      translateY: new Animated.Value(-100),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Main content animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Confetti animation
    confettiAnims.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.translateY, {
          toValue: 600,
          duration: 2000 + index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.rotate, {
          toValue: 360 * (index % 2 === 0 ? 1 : -1),
          duration: 2000 + index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 2000,
          delay: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [scaleAnim, fadeAnim, confettiAnims]);

  const formatDate = () => {
    const locale = i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-US' : 'fr-FR';
    return completionDate.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Confetti */}
      {confettiAnims.map((anim, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.confetti,
            {
              left: `${10 + index * 12}%`,
              transform: [
                { translateY: anim.translateY },
                { rotate: anim.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) },
              ],
              opacity: anim.opacity,
            },
          ]}
        >
          {['🎉', '✨', '🏆', '💰', '🥇'][index % 5]}
        </Animated.Text>
      ))}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Trophy Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.gold,
              },
            ]}
          >
            <LinearGradient
              colors={[colors.gold + '20', colors.gold + '10']}
              style={styles.iconGradient}
            >
              <Text style={styles.trophyIcon}>🏆</Text>
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {t('celebration.tontine_completed')}
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('celebration.congratulations_message')}
          </Text>

          {/* Tontine Name */}
          <View
            style={[
              styles.nameCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.gold,
              },
            ]}
          >
            <Text style={[styles.nameLabel, { color: colors.textSecondary }]}>
              {t('celebration.tontine_name')}
            </Text>
            <Text style={[styles.name, { color: colors.gold }]} numberOfLines={2}>
              {tontineName}
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.statIcon}>💰</Text>
              <Text style={[styles.statValue, { color: colors.gold }]}>
                {totalAmount.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('common.tnd')}
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.statIcon}>🔄</Text>
              <Text style={[styles.statValue, { color: colors.gold }]}>{totalRounds}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('celebration.rounds')}
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.statIcon}>👥</Text>
              <Text style={[styles.statValue, { color: colors.gold }]}>{totalMembers}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('celebration.members')}
              </Text>
            </View>
          </View>

          {/* Completion Date */}
          <Text style={[styles.completionDate, { color: colors.textSecondary }]}>
            {t('celebration.completed_on')} {formatDate()}
          </Text>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.gold }]}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
              {t('celebration.back_to_dashboard')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    fontSize: 32,
    zIndex: 10,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyIcon: {
    fontSize: 72,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  nameCard: {
    width: '100%',
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  nameLabel: {
    fontSize: FontSizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  completionDate: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    width: '100%',
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
});
