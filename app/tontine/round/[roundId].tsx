import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { NumismaticAvatar } from '@/components/NumismaticAvatar';
import { PaymentStatusList, PaymentWithMember } from '@/components/PaymentStatusList';
import { GoldButton } from '@/components/GoldButton';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import * as Haptics from 'expo-haptics';

interface Round {
  id: string;
  tontine_id: string;
  round_number: number;
  status: 'current' | 'upcoming' | 'completed';
  scheduled_date: string;
  beneficiary_id: string;
  beneficiary: {
    id: string;
    name: string;
    phone: string;
  };
}

interface Tontine {
  id: string;
  title: string;
  amount: number;
  currency: string;
  total_members: number;
  creator_id: string;
}

export default function RoundDetailScreen() {
  const { roundId } = useLocalSearchParams<{ roundId: string }>();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const rtl = i18n.language === 'ar';

  const [round, setRound] = useState<Round | null>(null);
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [payments, setPayments] = useState<PaymentWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadRoundData = useCallback(async () => {
    if (!roundId) return;

    try {
      // Fetch round with beneficiary
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select(`
          *,
          beneficiary:tontine_members!beneficiary_id (
            id,
            name,
            phone
          )
        `)
        .eq('id', roundId)
        .single();

      if (roundError) throw roundError;

      setRound(roundData as Round);

      // Fetch tontine details
      const { data: tontineData, error: tontineError } = await supabase
        .from('tontines')
        .select('id, title, amount, currency, total_members, creator_id')
        .eq('id', roundData.tontine_id)
        .single();

      if (tontineError) throw tontineError;

      setTontine(tontineData);

      // Check if current user is admin
      const isCreator = user?.id === tontineData.creator_id;
      const isAdminRole = user?.role === 'admin' || user?.role === 'super_admin';
      setIsAdmin(isCreator || isAdminRole);

      // Fetch payments with member details
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          member:tontine_members!member_id (
            id,
            name,
            user_id
          )
        `)
        .eq('round_id', roundId);

      if (paymentsError) throw paymentsError;

      // Transform payments data
      const transformedPayments: PaymentWithMember[] = paymentsData.map((payment: any) => {
        const memberName = payment.member?.name || 'Unknown';
        const initials = memberName
          .trim()
          .split(/\s+/)
          .map((word: string) => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return {
          id: payment.id,
          member_id: payment.member?.id || '',
          member_name: memberName,
          member_initials: initials,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          declared_at: payment.declared_at ? new Date(payment.declared_at) : undefined,
          confirmed_at: payment.confirmed_at ? new Date(payment.confirmed_at) : undefined,
        };
      });

      setPayments(transformedPayments);
    } catch (error) {
      console.error('Error loading round data:', error);
      Alert.alert(t('common.error'), t('tontine.load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [roundId, user, t]);

  useEffect(() => {
    loadRoundData();

    // Set up real-time subscription for payments
    const paymentsChannel = supabase
      .channel(`payments_${roundId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `round_id=eq.${roundId}`,
        },
        () => {
          loadRoundData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentsChannel);
    };
  }, [roundId, loadRoundData]);

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      Alert.alert(
        t('payment.confirm_title'),
        t('payment.confirm_mark_paid'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.confirm'),
            onPress: async () => {
              const { error } = await supabase
                .from('payments')
                .update({
                  status: 'paid',
                  confirmed_at: new Date().toISOString(),
                })
                .eq('id', paymentId);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              loadRoundData();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      Alert.alert(t('common.error'), t('payment.update_error'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDeclarePayment = async (paymentId: string) => {
    try {
      // Show method selection dialog
      Alert.alert(
        t('payment.declare_title'),
        t('payment.select_method'),
        [
          {
            text: t('payment.method_cash'),
            onPress: () => submitPaymentDeclaration(paymentId, 'cash'),
          },
          {
            text: t('payment.method_bank'),
            onPress: () => submitPaymentDeclaration(paymentId, 'bank'),
          },
          {
            text: t('payment.method_d17'),
            onPress: () => submitPaymentDeclaration(paymentId, 'd17'),
          },
          {
            text: t('payment.method_flouci'),
            onPress: () => submitPaymentDeclaration(paymentId, 'flouci'),
          },
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error declaring payment:', error);
    }
  };

  const submitPaymentDeclaration = async (paymentId: string, method: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          method,
          declared_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('payment.success_title'), t('payment.declared_success'));
      loadRoundData();
    } catch (error) {
      console.error('Error submitting payment declaration:', error);
      Alert.alert(t('common.error'), t('payment.update_error'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadRoundData();
  }, [loadRoundData]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {t('common.loading')}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!round || !tontine) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {t('tontine.round_not_found')}
          </Text>
          <GoldButton title={t('common.back')} onPress={handleBack} style={styles.backButton} />
        </View>
      </SafeAreaView>
    );
  }

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formattedDate = new Date(round.scheduled_date).toLocaleDateString(
    i18n.language === 'ar' ? 'ar-TN' : i18n.language === 'en' ? 'en-US' : 'fr-FR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  const paidCount = payments.filter((p) => p.status === 'paid').length;
  const potProgress = (paidCount / tontine.total_members) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, rtl && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backIcon, { color: colors.gold }]}>
            {rtl ? '→' : '←'}
          </Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('tontine.tour_number', { number: round.round_number })}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {tontine.title}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.gold}
          />
        }
      >
        {/* Beneficiary Card */}
        <View style={[styles.beneficiaryCard, { backgroundColor: colors.card, borderColor: colors.gold }]}>
          <View style={[styles.beneficiaryContent, rtl && { flexDirection: 'row-reverse' }]}>
            <NumismaticAvatar initials={getInitials(round.beneficiary.name)} size={64} />
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
              <Text style={[styles.beneficiaryDate, { color: colors.gold }]}>
                📅 {formattedDate}
              </Text>
            </View>
          </View>

          {/* Pot Summary */}
          <View style={[styles.potSummary, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.potRow, rtl && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.potLabel, { color: colors.textSecondary }]}>
                💰 {t('tontine.total_pot')}
              </Text>
              <Text style={[styles.potAmount, { color: colors.gold }]}>
                {(tontine.amount * tontine.total_members).toLocaleString()} {tontine.currency || 'TND'}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[styles.progressFill, { backgroundColor: colors.gold, width: `${potProgress}%` }]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {Math.round(potProgress)}% {t('tontine.collected').toLowerCase()} ({paidCount}/{tontine.total_members})
            </Text>
          </View>
        </View>

        {/* Payment Status List */}
        <View style={styles.paymentsContainer}>
          <PaymentStatusList
            payments={payments}
            isAdmin={isAdmin}
            currentUserId={user?.id}
            onMarkAsPaid={handleMarkAsPaid}
            onDeclarePayment={handleDeclarePayment}
            rtl={rtl}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '300',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  beneficiaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  beneficiaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  beneficiaryInfo: {
    flex: 1,
  },
  beneficiaryLabel: {
    fontSize: FontSizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  beneficiaryName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  beneficiaryDate: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  potSummary: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  potRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  potLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  potAmount: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  paymentsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: FontSizes.lg,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
});
