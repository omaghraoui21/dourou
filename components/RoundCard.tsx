import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { NumismaticAvatar } from './NumismaticAvatar';
import * as Haptics from 'expo-haptics';

interface Payment {
  id: string;
  status: 'paid' | 'pending' | 'late';
  member_id: string;
  amount: number;
}

interface Round {
  id: string;
  round_number: number;
  status: 'current' | 'upcoming' | 'completed';
  scheduled_date: Date;
  beneficiary: {
    id: string;
    name: string;
    initials: string;
  };
  payments: Payment[];
  total_amount: number;
}

interface RoundCardProps {
  round: Round;
  totalMembers: number;
  onPress?: () => void;
  rtl?: boolean;
}

export const RoundCard: React.FC<RoundCardProps> = ({
  round,
  totalMembers,
  onPress,
  rtl = false,
}) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();

  // Calculate pot progress
  const paidPayments = round.payments.filter(p => p.status === 'paid').length;
  const potProgress = totalMembers > 0 ? (paidPayments / totalMembers) * 100 : 0;

  // Format date
  const getDateLocale = () => {
    if (i18n.language === 'ar') return 'ar-TN';
    if (i18n.language === 'en') return 'en-US';
    return 'fr-FR';
  };

  const formattedDate = new Date(round.scheduled_date).toLocaleDateString(getDateLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Status colors
  const getStatusStyle = () => {
    if (round.status === 'current') return { bg: colors.gold + '20', text: colors.gold };
    if (round.status === 'completed') return { bg: colors.success + '20', text: colors.success };
    return { bg: colors.border, text: colors.textSecondary };
  };

  const statusStyle = getStatusStyle();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card + 'F5',
            borderColor: round.status === 'current' ? colors.gold : colors.border,
            borderWidth: round.status === 'current' ? 2 : 1,
          },
        ]}
      >
        {/* Glassmorphism overlay */}
        <View style={styles.glassOverlay} />
        {/* Header */}
        <View style={[styles.header, rtl && { flexDirection: 'row-reverse' }]}>
          <View style={[styles.headerLeft, rtl && { alignItems: 'flex-end' }]}>
            <Text style={[styles.roundNumber, { color: colors.text }]}>
              {t('tontine.tour_number', { number: round.round_number })}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {formattedDate}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {t(`tontine.${round.status}`)}
            </Text>
          </View>
        </View>

        {/* Beneficiary */}
        <View style={[styles.beneficiarySection, rtl && { flexDirection: 'row-reverse' }]}>
          <NumismaticAvatar initials={round.beneficiary.initials} size={48} />
          <View
            style={[
              styles.beneficiaryInfo,
              { marginLeft: rtl ? 0 : Spacing.md, marginRight: rtl ? Spacing.md : 0 },
              rtl && { alignItems: 'flex-end' },
            ]}
          >
            <Text style={[styles.beneficiaryLabel, { color: colors.textSecondary }]}>
              {t('tontine.beneficiary')}
            </Text>
            <Text style={[styles.beneficiaryName, { color: colors.text }]}>
              {round.beneficiary.name}
            </Text>
          </View>
        </View>

        {/* Pot Progress */}
        <View style={styles.potSection}>
          <View style={[styles.potHeader, rtl && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.potLabelRow, rtl && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.potIcon}>💰</Text>
              <Text style={[styles.potLabel, { color: colors.text }]}>
                {t('tontine.pot_progress')}
              </Text>
            </View>
            <Text style={[styles.potPercentage, { color: colors.gold }]}>
              {Math.round(potProgress)}%
            </Text>
          </View>

          {/* Luxury Progress Bar */}
          <View style={[styles.progressBarContainer, { backgroundColor: colors.background }]}>
            <LinearGradient
              colors={['#D4AF37', '#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${potProgress}%` }]}
            >
              {/* Shine effect */}
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressShine}
              />
            </LinearGradient>
          </View>

          {/* Payment Stats */}
          <View style={[styles.paymentStats, rtl && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.paymentStatsText, { color: colors.textSecondary }]}>
              {paidPayments} / {totalMembers} {t('tontine.paid').toLowerCase()}
            </Text>
            <Text style={[styles.totalAmount, { color: colors.gold }]}>
              {round.total_amount.toLocaleString()} {t('common.tnd')}
            </Text>
          </View>
        </View>

        {/* Current Round Indicator */}
        {round.status === 'current' && (
          <View style={[styles.currentIndicator, { backgroundColor: colors.gold + '15' }]}>
            <Text style={[styles.currentIndicatorText, { color: colors.gold }]}>
              ⚡ {t('tontine.active_round')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
    borderRadius: BorderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  roundNumber: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  date: {
    fontSize: FontSizes.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  beneficiarySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  beneficiaryInfo: {
    flex: 1,
  },
  beneficiaryLabel: {
    fontSize: FontSizes.xs,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  beneficiaryName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  potSection: {
    marginTop: Spacing.xs,
  },
  potHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  potLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  potIcon: {
    fontSize: 16,
  },
  potLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  potPercentage: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    position: 'relative',
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  paymentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentStatsText: {
    fontSize: FontSizes.sm,
  },
  totalAmount: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  currentIndicator: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  currentIndicatorText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
});
