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
import { Tontine, Activity } from '@/types';
import * as Haptics from 'expo-haptics';

// Mock data
const mockTontines: Tontine[] = [
  {
    id: '1',
    name: 'Famille Ben Ali',
    contribution: 200,
    frequency: 'monthly',
    totalMembers: 6,
    currentTour: 3,
    distributionLogic: 'fixed',
    status: 'active',
    createdAt: new Date(),
    nextDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    name: 'Collègues Bureau',
    contribution: 150,
    frequency: 'weekly',
    totalMembers: 4,
    currentTour: 2,
    distributionLogic: 'random',
    status: 'active',
    createdAt: new Date(),
    nextDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
];

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'payment',
    message: 'Ahmed a payé 200 TND',
    timestamp: new Date(),
    tontineId: '1',
    tontineName: 'Famille Ben Ali',
  },
  {
    id: '2',
    type: 'tour_start',
    message: 'Tour 3 a commencé',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tontineId: '1',
    tontineName: 'Famille Ben Ali',
  },
];

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const totalSavings = mockTontines.reduce(
    (sum, t) => sum + t.contribution * t.currentTour,
    0
  );

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
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {new Date().getHours() < 12
                ? 'Bonjour'
                : new Date().getHours() < 18
                ? 'Bon après-midi'
                : 'Bonsoir'}
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>Ahmed</Text>
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
            {mockTontines.length} {t('dashboard.active_tontines')}
          </Text>
        </View>

        {/* Active Tontines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('dashboard.active_tontines')}
            </Text>
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
          </View>

          {mockTontines.map((tontine) => (
            <TontineCard key={tontine.id} tontine={tontine} />
          ))}
        </View>

        {/* Upcoming Deadlines */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('dashboard.upcoming_deadlines')}
          </Text>

          {mockTontines
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
                  ]}
                >
                  <View style={styles.deadlineInfo}>
                    <Text style={[styles.deadlineName, { color: colors.text }]}>
                      {tontine.name}
                    </Text>
                    <Text style={[styles.deadlineAmount, { color: colors.gold }]}>
                      {tontine.contribution} {t('common.tnd')}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.deadlineDays,
                      { color: daysUntil <= 3 ? colors.warning : colors.textSecondary },
                    ]}
                  >
                    {daysUntil}j
                  </Text>
                </View>
              );
            })}
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, { marginBottom: Spacing.xxl }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('dashboard.recent_activity')}
          </Text>

          {mockActivities.map((activity) => (
            <View
              key={activity.id}
              style={[
                styles.activityCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.activityDot}>
                <View style={[styles.dot, { backgroundColor: colors.gold }]} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityMessage, { color: colors.text }]}>
                  {activity.message}
                </Text>
                <Text style={[styles.activityMeta, { color: colors.textSecondary }]}>
                  {activity.tontineName} • Il y a{' '}
                  {Math.floor((Date.now() - activity.timestamp.getTime()) / (1000 * 60 * 60))}h
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.gold }]}
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
  fabIcon: {
    fontSize: 32,
    color: '#0F172A',
    fontWeight: '300',
  },
});
