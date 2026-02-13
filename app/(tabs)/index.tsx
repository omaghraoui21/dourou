import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { TontineCard } from '@/components/TontineCard';
import { router } from 'expo-router';
import { Activity } from '@/types';
import * as Haptics from 'expo-haptics';
import { useUser } from '@/contexts/UserContext';
import { SuperAdminBadge } from '@/components/SuperAdminBadge';
import { useTontines } from '@/contexts/TontineContext';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, isSuperAdmin } = useUser();
  const { tontines } = useTontines();
  const rtl = i18n.language === 'ar';

  // Filter active tontines (include draft for display)
  const activeTontines = tontines.filter((t) => t.status === 'active' || t.status === 'draft');

  const totalSavings = activeTontines.reduce(
    (sum, tontine) => sum + tontine.contribution * tontine.currentTour,
    0
  );

  // Mock activities for now (will be replaced with real data later)
  const mockActivities: Activity[] = [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting_morning');
    if (hour < 18) return t('dashboard.greeting_afternoon');
    return t('dashboard.greeting_evening');
  };

  const getActivityMessage = (activity: Activity) => {
    if (activity.type === 'payment') {
      return `Ahmed ${t('tontine.paid').toLowerCase()} 200 ${t('common.tnd')}`;
    }
    if (activity.type === 'tour_start') {
      return `${t('tontine.tour_number', { number: 3 })} - ${t('tontine.current').toLowerCase()}`;
    }
    return activity.message;
  };

  const handleCreateTontine = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/tontine/create');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, rtl && styles.headerRTL]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
              {getGreeting()}
            </Text>
            <View style={[styles.userNameRow, rtl && styles.rowRTL]}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.firstName || 'Ahmed'}
              </Text>
              {isSuperAdmin && <SuperAdminBadge size="small" showLabel={false} />}
            </View>
          </View>
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

        {/* Active Tontines */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, rtl && styles.rowRTL]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('dashboard.active_tontines')}
            </Text>
            {activeTontines.length > 0 && (
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

          {activeTontines.length > 0 ? (
            activeTontines.slice(0, 3).map((tontine) => (
              <TontineCard key={tontine.id} tontine={tontine} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('dashboard.no_tontines')}
              </Text>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.gold }]}
                onPress={handleCreateTontine}
              >
                <Text style={styles.createButtonText}>{t('tontine.create')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upcoming Deadlines */}
        {activeTontines.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('dashboard.upcoming_deadlines')}
            </Text>

            {activeTontines
              .sort((a, b) => a.nextDeadline.getTime() - b.nextDeadline.getTime())
              .map((tontine) => {
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

        {/* Recent Activity */}
        {mockActivities.length > 0 && (
          <View style={[styles.section, { marginBottom: Spacing.xxl }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('dashboard.recent_activity')}
            </Text>

            {mockActivities.map((activity) => {
              const hoursAgo = Math.floor(
                (Date.now() - activity.timestamp.getTime()) / (1000 * 60 * 60)
              );
              return (
                <View
                  key={activity.id}
                  style={[
                    styles.activityCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    rtl && styles.rowRTL,
                  ]}
                >
                  <View style={[styles.activityDot, rtl && { paddingRight: 0, paddingLeft: Spacing.sm }]}>
                    <View style={[styles.dot, { backgroundColor: colors.gold }]} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityMessage, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
                      {getActivityMessage(activity)}
                    </Text>
                    <Text style={[styles.activityMeta, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
                      {activity.tontineName} {'\u2022'} {t('common.hours_ago', { count: hoursAgo })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
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
    </SafeAreaView>
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
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.md,
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
  activityCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
  },
  activityDot: {
    paddingTop: 4,
    paddingRight: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xs,
  },
  activityMeta: {
    fontSize: FontSizes.xs,
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
