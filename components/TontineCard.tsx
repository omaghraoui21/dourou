import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { ProgressRing } from './ProgressRing';
import { Tontine } from '@/types';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

interface TontineCardProps {
  tontine: Tontine;
}

export const TontineCard: React.FC<TontineCardProps> = ({ tontine }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const progress = tontine.currentTour / tontine.totalMembers;
  const daysUntilDeadline = Math.ceil(
    (tontine.nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/tontine/${tontine.id}`);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.gold }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{tontine.name}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {tontine.totalMembers} {t('tontine.members')} • {t(`tontine.${tontine.frequency}`)}
          </Text>
        </View>
        <ProgressRing progress={progress} size={50} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            {t('tontine.contribution')}
          </Text>
          <Text style={[styles.detailValue, { color: colors.gold }]}>
            {tontine.contribution.toLocaleString()} {t('common.tnd')}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            {t('tontine.current')}
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {tontine.currentTour}/{tontine.totalMembers}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            {t('dashboard.upcoming_deadlines')}
          </Text>
          <Text
            style={[
              styles.detailValue,
              { color: daysUntilDeadline <= 3 ? colors.warning : colors.text },
            ]}
          >
            {t('common.days_short', { count: daysUntilDeadline })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FontSizes.xs,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
