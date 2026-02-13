import React, { useState } from 'react';
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
import { Spacing, FontSizes } from '@/constants/theme';
import { TontineCard } from '@/components/TontineCard';
import { Tontine } from '@/types';
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
    name: 'Coll\u00e8gues Bureau',
    contribution: 150,
    frequency: 'weekly',
    totalMembers: 4,
    currentTour: 2,
    distributionLogic: 'random',
    status: 'active',
    createdAt: new Date(),
    nextDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    name: 'Amis Sousse',
    contribution: 300,
    frequency: 'monthly',
    totalMembers: 8,
    currentTour: 8,
    distributionLogic: 'trust',
    status: 'completed',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    nextDeadline: new Date(),
  },
];

export default function TontinesScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const rtl = i18n.language === 'ar';

  const filteredTontines = mockTontines.filter((tontine) => tontine.status === filter);
  const activeCount = mockTontines.filter((tontine) => tontine.status === 'active').length;
  const completedCount = mockTontines.filter((tontine) => tontine.status === 'completed').length;

  const handleFilterChange = (newFilter: 'active' | 'completed') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilter(newFilter);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
          {t('tontines.title')}
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, rtl && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'active' && { borderBottomColor: colors.gold, borderBottomWidth: 2 },
          ]}
          onPress={() => handleFilterChange('active')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === 'active' ? colors.gold : colors.textSecondary,
                fontWeight: filter === 'active' ? '700' : '400',
              },
            ]}
          >
            {t('tontines.active_count', { count: activeCount })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'completed' && { borderBottomColor: colors.gold, borderBottomWidth: 2 },
          ]}
          onPress={() => handleFilterChange('completed')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === 'completed' ? colors.gold : colors.textSecondary,
                fontWeight: filter === 'completed' ? '700' : '400',
              },
            ]}
          >
            {t('tontines.completed_count', { count: completedCount })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tontines List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTontines.length > 0 ? (
          filteredTontines.map((tontine) => (
            <TontineCard key={tontine.id} tontine={tontine} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {filter === 'active'
                ? t('tontines.no_active')
                : t('tontines.no_completed')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  filterText: {
    fontSize: FontSizes.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
  },
});
