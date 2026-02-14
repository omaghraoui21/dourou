import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useToast } from '@/contexts/ToastContext';
import arTN from '@/i18n/locales/ar-TN.json';

export default function TranslationLabScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  // Flatten translation keys
  const translationKeys = useMemo(() => {
    const flatten = (obj: any, prefix = ''): { key: string; value: string }[] => {
      let result: { key: string; value: string }[] = [];

      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null) {
          result = result.concat(flatten(obj[key], fullKey));
        } else {
          result.push({
            key: fullKey,
            value: String(obj[key])
          });
        }
      }

      return result;
    };

    return flatten(arTN);
  }, []);

  // Filter keys based on search
  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) return translationKeys;

    const query = searchQuery.toLowerCase();
    return translationKeys.filter(
      item =>
        item.key.toLowerCase().includes(query) ||
        item.value.toLowerCase().includes(query)
    );
  }, [searchQuery, translationKeys]);

  const handleExportJSON = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowExportModal(true);
  };

  const handleCopyJSON = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const jsonString = JSON.stringify(arTN, null, 2);
    await Clipboard.setStringAsync(jsonString);
    showToast({
      message: 'JSON copied to clipboard!',
      type: 'success',
    });
    setShowExportModal(false);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const renderItem = ({ item }: { item: { key: string; value: string } }) => (
    <View
      style={[
        styles.keyCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.keyText, { color: colors.gold }]} numberOfLines={1}>
        {item.key}
      </Text>
      <Text style={[styles.valueText, { color: colors.text }]} numberOfLines={3}>
        {item.value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.gold }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: colors.text }]}>Translation Lab</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            🇹🇳 Tunisian Darija (ar-TN)
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Search keys or values..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.gold }]}>
            {filteredKeys.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {searchQuery ? 'Matches' : 'Total Keys'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.gold }]}
          onPress={handleExportJSON}
        >
          <Text style={styles.exportButtonText}>📋 Export JSON</Text>
        </TouchableOpacity>
      </View>

      {/* Translation Keys List */}
      <FlatList
        data={filteredKeys}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No keys found
            </Text>
          </View>
        }
      />

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowExportModal(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              ar-TN.json
            </Text>

            <ScrollView
              style={styles.jsonScroll}
              contentContainerStyle={styles.jsonScrollContent}
            >
              <Text
                style={[styles.jsonText, { color: colors.textSecondary }]}
                selectable
              >
                {JSON.stringify(arTN, null, 2)}
              </Text>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.gold }]}
                onPress={handleCopyJSON}
              >
                <Text style={styles.modalButtonText}>Copy to Clipboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                ]}
                onPress={() => setShowExportModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 28,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  exportButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  keyCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  keyText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  valueText: {
    fontSize: FontSizes.md,
    lineHeight: 20,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  jsonScroll: {
    maxHeight: 400,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginBottom: Spacing.md,
  },
  jsonScrollContent: {
    padding: Spacing.md,
  },
  jsonText: {
    fontSize: FontSizes.xs,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  modalActions: {
    gap: Spacing.sm,
  },
  modalButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#0F172A',
  },
});
