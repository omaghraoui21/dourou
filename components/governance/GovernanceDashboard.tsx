/**
 * GovernanceDashboard Component
 *
 * Admin dashboard for monitoring:
 * - Orphaned tontines (admin suspended/banned)
 * - Abuse metrics and velocity violations
 * - Pending payment proofs
 * - User status management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes } from '@/constants/theme';
import { useGovernanceSecurity } from '@/hooks/useGovernanceSecurity';
import type {
  GovernanceSummary,
  OrphanedTontine,
  AbuseMetric,
} from '@/hooks/useGovernanceSecurity';

export function GovernanceDashboard() {
  const { colors } = useTheme();
  const {
    getGovernanceSummary,
    getOrphanedTontines,
    getAbuseMetrics,
    flagOrphanedTontine,
  } = useGovernanceSecurity();

  const [summary, setSummary] = useState<GovernanceSummary | null>(null);
  const [orphanedTontines, setOrphanedTontines] = useState<OrphanedTontine[]>([]);
  const [abuseMetrics, setAbuseMetrics] = useState<AbuseMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'orphaned' | 'abuse'>('summary');

  const loadData = async () => {
    try {
      const [summaryData, orphanedData, abuseData] = await Promise.all([
        getGovernanceSummary(),
        getOrphanedTontines(),
        getAbuseMetrics(),
      ]);

      setSummary(summaryData);
      setOrphanedTontines(orphanedData);
      setAbuseMetrics(abuseData);
    } catch (error) {
      console.error('Error loading governance data:', error);
      Alert.alert('Error', 'Failed to load governance data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleFlagOrphanedTontine = async (tontineId: string) => {
    try {
      const result = await flagOrphanedTontine(tontineId);
      if (result.success) {
        Alert.alert(
          'Tontine Flagged',
          result.requires_intervention
            ? 'This tontine requires immediate intervention - no other admins available.'
            : `This tontine has ${result.admin_count} other admin(s) who can manage it.`,
        );
        loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Error flagging tontine:', error);
      Alert.alert('Error', 'Failed to flag tontine');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Governance Dashboard</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'summary' && { borderBottomColor: colors.gold, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('summary')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'summary' ? colors.gold : colors.textSecondary },
            ]}
          >
            Summary
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'orphaned' && { borderBottomColor: colors.gold, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('orphaned')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'orphaned' ? colors.gold : colors.textSecondary },
            ]}
          >
            Orphaned ({orphanedTontines.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'abuse' && { borderBottomColor: colors.gold, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('abuse')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'abuse' ? colors.gold : colors.textSecondary },
            ]}
          >
            Risk ({abuseMetrics.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.gold} />
        }
      >
        {activeTab === 'summary' && summary && (
          <View>
            <MetricCard
              title="Orphaned Tontines"
              value={summary.orphaned_tontines}
              description="Tontines with suspended/banned admins"
              color={summary.orphaned_tontines > 0 ? colors.error : colors.success}
              colors={colors}
            />
            <MetricCard
              title="High Risk Users"
              value={summary.high_risk_users}
              description="Users with suspicious patterns"
              color={summary.high_risk_users > 0 ? colors.error : colors.success}
              colors={colors}
            />
            <MetricCard
              title="Velocity Violations (24h)"
              value={summary.velocity_violations_24h}
              description="Users exceeding join limits"
              color={summary.velocity_violations_24h > 0 ? colors.warning : colors.success}
              colors={colors}
            />
            <MetricCard
              title="Pending Payment Proofs"
              value={summary.pending_payment_proofs}
              description="Payments awaiting confirmation"
              color={colors.textSecondary}
              colors={colors}
            />
            <MetricCard
              title="Suspended Users"
              value={summary.suspended_users}
              description="Accounts temporarily suspended"
              color={colors.textSecondary}
              colors={colors}
            />
            <MetricCard
              title="Banned Users"
              value={summary.banned_users}
              description="Permanently banned accounts"
              color={colors.error}
              colors={colors}
            />

            <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
              Last updated: {new Date(summary.last_updated).toLocaleString()}
            </Text>
          </View>
        )}

        {activeTab === 'orphaned' && (
          <View>
            {orphanedTontines.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No orphaned tontines found
                </Text>
              </View>
            ) : (
              orphanedTontines.map((tontine) => (
                <OrphanedTontineCard
                  key={tontine.tontine_id}
                  tontine={tontine}
                  colors={colors}
                  onFlag={() => handleFlagOrphanedTontine(tontine.tontine_id)}
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'abuse' && (
          <View>
            {abuseMetrics.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No high-risk users detected
                </Text>
              </View>
            ) : (
              abuseMetrics.map((metric) => (
                <AbuseMetricCard key={metric.user_id} metric={metric} colors={colors} />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ===========================
// Metric Card Component
// ===========================

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  color: string;
  colors: any;
}

function MetricCard({ title, value, description, color, colors }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={[styles.metricTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.metricDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
}

// ===========================
// Orphaned Tontine Card
// ===========================

interface OrphanedTontineCardProps {
  tontine: OrphanedTontine;
  colors: any;
  onFlag: () => void;
}

function OrphanedTontineCard({ tontine, colors, onFlag }: OrphanedTontineCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{tontine.tontine_name}</Text>
      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
        Status: {tontine.tontine_status} • Round {tontine.current_round}
      </Text>

      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Creator:</Text>
        <Text style={[styles.cardValue, { color: colors.text }]}>
          {tontine.creator_name} ({tontine.creator_status})
        </Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Other Admins:</Text>
        <Text style={[styles.cardValue, { color: colors.text }]}>
          {tontine.admin_count > 0 ? tontine.other_admins : 'None'}
        </Text>
      </View>

      {tontine.admin_count === 0 && (
        <View style={[styles.alertBanner, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.alertText, { color: colors.error }]}>
            ⚠️ Requires immediate intervention - no other admins
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.flagButton, { backgroundColor: colors.gold }]}
        onPress={onFlag}
      >
        <Text style={styles.flagButtonText}>Flag for Review</Text>
      </TouchableOpacity>
    </View>
  );
}

// ===========================
// Abuse Metric Card
// ===========================

interface AbuseMetricCardProps {
  metric: AbuseMetric;
  colors: any;
}

function AbuseMetricCard({ metric, colors }: AbuseMetricCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return colors.error;
      case 'high':
        return '#FF6B35';
      case 'medium':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{metric.full_name}</Text>
        <View style={[styles.riskBadge, { backgroundColor: getRiskColor(metric.risk_level) }]}>
          <Text style={styles.riskBadgeText}>{metric.risk_level.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Trust Score:</Text>
        <Text style={[styles.cardValue, { color: colors.text }]}>{metric.trust_score}</Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
          Tontines Joined (24h):
        </Text>
        <Text style={[styles.cardValue, { color: colors.text }]}>
          {metric.velocity_tontines_24h}
        </Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Late Payments:</Text>
        <Text style={[styles.cardValue, { color: colors.text }]}>
          {metric.late_payments_count}
        </Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Overdue Payments:</Text>
        <Text style={[styles.cardValue, { color: colors.text }]}>
          {metric.overdue_payments_count}
        </Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Active Tontines:</Text>
        <Text style={[styles.cardValue, { color: colors.text }]}>
          {metric.active_tontines_count}
        </Text>
      </View>
    </View>
  );
}

// ===========================
// Styles
// ===========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  metricCard: {
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  metricTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  metricDescription: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cardLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: FontSizes.sm,
  },
  alertBanner: {
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  alertText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  flagButton: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  flagButtonText: {
    color: '#000',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  riskBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  riskBadgeText: {
    color: '#FFF',
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
  },
});
