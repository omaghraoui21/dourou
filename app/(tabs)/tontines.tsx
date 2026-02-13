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
import * as Haptics from 'expo-haptics';
import { useTontines } from '@/contexts/TontineContext';

export default function TontinesScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { tontines } = useTontines();
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const rtl = i18n.language === 'ar';

  const filteredTontines = tontines.filter((tontine) => {
    if (filter === 'active') return tontine.status === 'active' || tontine.status === 'draft';
    return tontine.status === 'completed';
  });
  const activeCount = tontines.filter((tontine) => tontine.status === 'active' || tontine.status === 'draft').length;
  const completedCount = tontines.filter((tontine) => tontine.status === 'completed').length;

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
