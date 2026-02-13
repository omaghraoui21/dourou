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
  const { t, i18n } = useTranslation();
  const rtl = i18n.language === 'ar';

  const isDraft = tontine.status === 'draft';
  const progress = isDraft ? 0 : tontine.currentTour / tontine.totalMembers;
  const daysUntilDeadline = isDraft
    ? 0
    : Math.ceil(
        (tontine.nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/tontine/${tontine.id}`);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card + 'F5',
          borderColor: isDraft ? colors.gold + '60' : colors.gold,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Glassmorphism overlay */}
      <View style={styles.glassOverlay} />

      <View style={[styles.header, rtl && { flexDirection: 'row-reverse' }]}>
        <View style={[styles.titleContainer, rtl && { marginRight: 0, marginLeft: Spacing.md }]}>
          <View style={[styles.nameRow, rtl && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
              {tontine.name}
            </Text>
            {isDraft && (
              <View style={[styles.draftBadge, { backgroundColor: colors.gold + '20' }]}>
                <Text style={[styles.draftBadgeText, { color: colors.gold }]}>
                  {t('tontine.draft_badge')}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
            {isDraft
              ? `${tontine.members?.length || 0}/${tontine.totalMembers} ${t('tontine.members_list')}`
              : `${tontine.totalMembers} ${t('tontine.members')} • ${t(`tontine.${tontine.frequency}`)}`}
          </Text>
        </View>
        {!isDraft && <ProgressRing progress={progress} size={50} />}
        {isDraft && (
          <View style={[styles.draftProgress, { borderColor: colors.gold + '40' }]}>
            <Text style={[styles.draftProgressText, { color: colors.gold }]}>
              {tontine.members?.length || 0}/{tontine.totalMembers}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.details, rtl && { flexDirection: 'row-reverse' }]}>
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
            {isDraft ? t('tontine.status_draft') : t('tontine.current')}
          </Text>
          <Text style={[styles.detailValue, { color: isDraft ? colors.gold : colors.text }]}>
            {isDraft
              ? t('tontine.status_draft')
              : `${tontine.currentTour}/${tontine.totalMembers}`}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            {isDraft ? t('tontine.frequency') : t('dashboard.upcoming_deadlines')}
          </Text>
          <Text
            style={[
              styles.detailValue,
              {
                color: isDraft
                  ? colors.text
                  : daysUntilDeadline <= 3
                  ? colors.warning
                  : colors.text,
              },
            ]}
          >
            {isDraft
              ? t(`tontine.${tontine.frequency}`)
              : t('common.days_short', { count: daysUntilDeadline })}
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
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
    borderRadius: BorderRadius.md,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    flexShrink: 1,
  },
  draftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  draftBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: FontSizes.sm,
  },
  draftProgress: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftProgressText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
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
