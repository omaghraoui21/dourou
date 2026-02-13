import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { ProgressRing } from '@/components/ProgressRing';
import { getTrustTier } from '@/types';
import * as Haptics from 'expo-haptics';
import { changeLanguage } from '@/i18n/config';

export default function ProfileScreen() {
  const { colors, toggleTheme, isDark } = useTheme();
  const { t, i18n } = useTranslation();

  const trustScore = 4.2;
  const tier = getTrustTier(trustScore);

  const handleLanguageChange = async (lang: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await changeLanguage(lang);
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleTheme();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { borderColor: colors.gold }]}>
            <Text style={styles.avatarText}>AB</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>Ahmed Ben Ali</Text>
          <Text style={[styles.phone, { color: colors.textSecondary }]}>+216 20 123 456</Text>
        </View>

        {/* Trust Score Card */}
        <View
          style={[
            styles.trustCard,
            { backgroundColor: colors.card, borderColor: colors.gold },
          ]}
        >
          <Text style={[styles.trustTitle, { color: colors.text }]}>
            {t('trust.title')}
          </Text>

          <View style={styles.trustContent}>
            <View style={styles.trustLeft}>
              <ProgressRing progress={trustScore / 5} size={100} strokeWidth={8} />
              <View style={styles.trustScoreOverlay}>
                <Text style={[styles.trustScore, { color: colors.gold }]}>
                  {trustScore.toFixed(1)}
                </Text>
                <Text style={[styles.trustMax, { color: colors.textSecondary }]}>/5.0</Text>
              </View>
            </View>

            <View style={styles.trustRight}>
              <View
                style={[
                  styles.tierBadge,
                  { backgroundColor: colors.gold + '20', borderColor: colors.gold },
                ]}
              >
                <Text style={[styles.tierText, { color: colors.gold }]}>
                  ⭐ {t(`trust.${tier}`)}
                </Text>
              </View>

              <Text style={[styles.trustDescription, { color: colors.textSecondary }]}>
                Basé sur votre ponctualité et historique de paiement
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('profile.settings')}
          </Text>

          {/* Language */}
          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t('profile.language')}
            </Text>
            <View style={styles.languageButtons}>
              {['fr', 'ar', 'en'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageButton,
                    {
                      backgroundColor:
                        i18n.language === lang ? colors.gold : 'transparent',
                      borderColor: colors.gold,
                    },
                  ]}
                  onPress={() => handleLanguageChange(lang)}
                >
                  <Text
                    style={[
                      styles.languageText,
                      {
                        color: i18n.language === lang ? '#0F172A' : colors.text,
                      },
                    ]}
                  >
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Theme Toggle */}
          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t('profile.theme')}
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                  {isDark ? t('profile.dark') : t('profile.light')}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.border, true: colors.gold }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques</Text>

          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.gold }]}>8</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Tontines complétées
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.gold }]}>2</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Tontines actives
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.gold }]}>100%</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Taux de paiement
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.gold }]}>12</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Mois d&apos;ancienneté
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.error }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Handle logout
          }}
        >
          <Text style={[styles.logoutText, { color: colors.error }]}>
            {t('profile.logout')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0F172A',
  },
  name: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  phone: {
    fontSize: FontSizes.md,
  },
  trustCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  trustTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  trustContent: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  trustLeft: {
    position: 'relative',
  },
  trustScoreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustScore: {
    fontSize: 28,
    fontWeight: '700',
  },
  trustMax: {
    fontSize: FontSizes.sm,
  },
  trustRight: {
    flex: 1,
    justifyContent: 'center',
  },
  tierBadge: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  trustDescription: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  settingCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  settingLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingSubtext: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  languageButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  languageText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  logoutButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  logoutText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
