import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { NumismaticAvatar } from './NumismaticAvatar';
import * as Haptics from 'expo-haptics';

export interface PaymentWithMember {
  id: string;
  member_id: string;
  member_name: string;
  member_initials: string;
  amount: number;
  status: 'paid' | 'pending' | 'late';
  method?: 'cash' | 'bank' | 'd17' | 'flouci';
  declared_at?: Date;
  confirmed_at?: Date;
}

interface PaymentStatusListProps {
  payments: PaymentWithMember[];
  isAdmin: boolean;
  currentUserId?: string;
  onMarkAsPaid?: (paymentId: string) => void;
  onDeclarePayment?: (paymentId: string) => void;
  rtl?: boolean;
}

export const PaymentStatusList: React.FC<PaymentStatusListProps> = ({
  payments,
  isAdmin,
  currentUserId,
  onMarkAsPaid,
  onDeclarePayment,
  rtl = false,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'late':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return '✓';
      case 'late':
        return '⚠';
      default:
        return '○';
    }
  };

  const getMethodLabel = (method?: string) => {
    if (!method) return '';
    return t(`payment.method_${method}`);
  };

  const handleMarkAsPaid = (paymentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onMarkAsPaid) {
      onMarkAsPaid(paymentId);
    }
  };

  const handleDeclarePayment = (paymentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onDeclarePayment) {
      onDeclarePayment(paymentId);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, rtl && { alignItems: 'flex-end' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('tontine.member_payments')}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {payments.filter(p => p.status === 'paid').length} / {payments.length} {t('tontine.paid').toLowerCase()}
        </Text>
      </View>

      {payments.map((payment) => {
        const statusColor = getStatusColor(payment.status);
        const isCurrentUser = currentUserId && payment.member_id === currentUserId;

        return (
          <View
            key={payment.id}
            style={[
              styles.paymentCard,
              {
                backgroundColor: colors.card,
                borderColor: payment.status === 'paid' ? colors.success + '30' : colors.border,
              },
            ]}
          >
            <View style={[styles.paymentRow, rtl && { flexDirection: 'row-reverse' }]}>
              {/* Avatar & Info */}
              <View style={[styles.memberInfo, rtl && { flexDirection: 'row-reverse' }]}>
                <NumismaticAvatar initials={payment.member_initials} size={42} />
                <View
                  style={[
                    styles.memberDetails,
                    { marginLeft: rtl ? 0 : Spacing.sm, marginRight: rtl ? Spacing.sm : 0 },
                    rtl && { alignItems: 'flex-end' },
                  ]}
                >
                  <Text style={[styles.memberName, { color: colors.text }]}>
                    {payment.member_name}
                    {isCurrentUser && (
                      <Text style={[styles.youBadge, { color: colors.gold }]}> ({t('common.you')})</Text>
                    )}
                  </Text>
                  <View style={[styles.detailRow, rtl && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.amount, { color: colors.textSecondary }]}>
                      {payment.amount} {t('common.tnd')}
                    </Text>
                    {payment.method && (
                      <>
                        <Text style={[styles.separator, { color: colors.border }]}> • </Text>
                        <Text style={[styles.method, { color: colors.textSecondary }]}>
                          {getMethodLabel(payment.method)}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>

              {/* Status & Actions */}
              <View style={[styles.statusSection, rtl && { alignItems: 'flex-start' }]}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + '20', borderColor: statusColor },
                  ]}
                >
                  <Text style={[styles.statusIcon, { color: statusColor }]}>
                    {getStatusIcon(payment.status)}
                  </Text>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {t(`payment.status_${payment.status}`)}
                  </Text>
                </View>

                {/* Admin can mark as paid */}
                {isAdmin && payment.status !== 'paid' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success + '15', borderColor: colors.success }]}
                    onPress={() => handleMarkAsPaid(payment.id)}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.success }]}>
                      ✓ {t('payment.mark_paid')}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Member can declare payment (if it's their payment and status is pending) */}
                {!isAdmin && isCurrentUser && payment.status === 'pending' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.gold + '15', borderColor: colors.gold }]}
                    onPress={() => handleDeclarePayment(payment.id)}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.gold }]}>
                      {t('payment.declare')}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Show declaration timestamp if declared but not confirmed */}
                {payment.declared_at && !payment.confirmed_at && (
                  <Text style={[styles.declaredText, { color: colors.warning }]}>
                    ⏳ {t('payment.awaiting_confirmation')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
  },
  paymentCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  youBadge: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: FontSizes.sm,
  },
  separator: {
    fontSize: FontSizes.xs,
  },
  method: {
    fontSize: FontSizes.xs,
    textTransform: 'uppercase',
  },
  statusSection: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: 4,
  },
  statusIcon: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  actionButtonText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  declaredText: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
});
