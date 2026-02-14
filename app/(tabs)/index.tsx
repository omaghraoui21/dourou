import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { TontineCard } from '@/components/TontineCard';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUser } from '@/contexts/UserContext';
import { SuperAdminBadge } from '@/components/SuperAdminBadge';
import { useTontines } from '@/contexts/TontineContext';
import { TontineCardSkeleton } from '@/components/SkeletonLoader';
import { PremiumEmptyState } from '@/components/PremiumEmptyState';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, isSuperAdmin } = useUser();
  const { tontines, isLoading, refreshTontines } = useTontines();
  const rtl = i18n.language === 'ar';
  const [refreshing, setRefreshing] = useState(false);

  // Filter active tontines (include draft for display)
  const activeTontines = tontines.filter((item) => item.status === 'active' || item.status === 'draft');

  // Total savings = sum of all active tontines contribution amounts
  const totalSavings = activeTontines.reduce(
    (sum, tontine) => sum + tontine.contribution,
    0
  );

  // Upcoming deadlines from active tontines sorted by next deadline
  const upcomingDeadlines = [...activeTontines]
    .filter((item) => item.status === 'active')
    .sort((a, b) => a.nextDeadline.getTime() - b.nextDeadline.getTime());

  // Recent tontines (first 3)
  const recentTontines = tontines.slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting_morning');
    if (hour < 18) return t('dashboard.greeting_afternoon');
    return t('dashboard.greeting_evening');
  };

  const handleCreateTontine = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/tontine/create');
  };

  const handleJoinGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/tontine/join');
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTontines();
    } catch (error) {
      console.error('Pull-to-refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshTontines]);

  // Loading state
  if (isLoading && tontines.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, rtl && styles.headerRTL]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                {getGreeting()}
              </Text>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.firstName || t('common.member')}
              </Text>
            </View>
          </View>
          <TontineCardSkeleton />
          <TontineCardSkeleton />
          <TontineCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, rtl && styles.headerRTL]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
              {getGreeting()}
            </Text>
            <View style={[styles.userNameRow, rtl && styles.rowRTL]}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.firstName || t('common.member')}
              </Text>
              {isSuperAdmin && <SuperAdminBadge size="small" showLabel={false} />}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.joinButton, { borderColor: colors.gold }]}
            onPress={handleJoinGroup}
            activeOpacity={0.7}
          >
            <Text style={[styles.joinButtonText, { color: colors.gold }]}>
              {t('dashboard.join_group')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Total Savings Card */}
        <View
          style={[
            styles.totalCard,
            { backgroundColor: colors.card, borderColor: colors.gold },
          ]}
        >
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            {t('dashboard.total_savings')}
          </Text>
          <Text style={[styles.totalAmount, { color: colors.gold }]}>
            {totalSavings.toLocaleString()} {t('common.tnd')}
          </Text>
          <Text style={[styles.totalSubtext, { color: colors.textSecondary }]}>
            {activeTontines.length} {t('dashboard.active_tontines')}
          </Text>
        </View>

        {/* Empty State */}
        {tontines.length === 0 ? (
          <PremiumEmptyState
            icon="🪙"
            title={t('dashboard.create_first_tontine')}
            message={t('dashboard.no_tontines')}
            actionLabel={t('tontine.create')}
            onAction={handleCreateTontine}
            secondaryActionLabel={t('dashboard.join_group')}
            onSecondaryAction={handleJoinGroup}
          />
        ) : (
          <>
            {/* Active Tontines */}
            <View style={styles.section}>
              <View style={[styles.sectionHeader, rtl && styles.rowRTL]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('dashboard.active_tontines')}
                </Text>
                {recentTontines.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/(tabs)/tontines');
                    }}
                  >
                    <Text style={[styles.viewAll, { color: colors.gold }]}>
                      {t('dashboard.view_all')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {recentTontines.map((tontine) => (
                <TontineCard key={tontine.id} tontine={tontine} />
              ))}
            </View>

            {/* Upcoming Deadlines */}
            {upcomingDeadlines.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
                  {t('dashboard.upcoming_deadlines')}
                </Text>

                {upcomingDeadlines.map((tontine) => {
                  const daysUntil = Math.ceil(
                    (tontine.nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <View
                      key={tontine.id}
                      style={[
                        styles.deadlineCard,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        rtl && styles.rowRTL,
                      ]}
                    >
                      <View style={styles.deadlineInfo}>
                        <Text style={[styles.deadlineName, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
                          {tontine.name}
                        </Text>
                        <Text style={[styles.deadlineAmount, { color: colors.gold, textAlign: rtl ? 'right' : 'left' }]}>
                          {tontine.contribution} {t('common.tnd')}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.deadlineDays,
                          { color: daysUntil <= 3 ? colors.warning : colors.textSecondary },
                        ]}
                      >
                        {t('common.days_short', { count: daysUntil })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.gold }, rtl && styles.fabRTL]}
        onPress={handleCreateTontine}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl + 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.md,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  headerLeft: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  greeting: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  userName: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  joinButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  joinButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  totalCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  totalSubtext: {
    fontSize: FontSizes.sm,
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  createButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  createButtonText: {
    color: '#0F172A',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  deadlineCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  deadlineAmount: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  deadlineDays: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabRTL: {
    right: undefined,
    left: 24,
  },
  fabIcon: {
    fontSize: 32,
    color: '#0F172A',
    fontWeight: '300',
  },
});
