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
import { useUser } from '@/contexts/UserContext';
import { SuperAdminBadge } from '@/components/SuperAdminBadge';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { colors, toggleTheme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, isSuperAdmin, logout } = useUser();
  const rtl = i18n.language === 'ar';

  const trustScore = user?.trustScore || 4.2;
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
          <View style={[styles.avatar, { borderColor: isSuperAdmin ? '#FFD700' : colors.gold }]}>
            {isSuperAdmin ? (
              <Text style={styles.avatarText}>{'\uD83D\uDC51'}</Text>
            ) : (
              <Text style={styles.avatarText}>{user?.avatar || 'AB'}</Text>
            )}
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          {isSuperAdmin && (
            <View style={styles.badgeContainer}>
              <SuperAdminBadge size="medium" showLabel={true} />
            </View>
          )}
          <Text style={[styles.phone, { color: colors.textSecondary }]}>{user?.phone}</Text>
          {user?.email && (
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
          )}
          {user?.isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.verifiedText, { color: colors.success }]}>
                {'\u2713'} {t('common.verified')}
              </Text>
            </View>
          )}
        </View>

        {/* Trust Score Card */}
        <View
          style={[
            styles.trustCard,
            { backgroundColor: colors.card, borderColor: colors.gold },
          ]}
        >
          <Text style={[styles.trustTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
            {t('trust.title')}
          </Text>

          <View style={[styles.trustContent, rtl && { flexDirection: 'row-reverse' }]}>
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
                  rtl && { alignSelf: 'flex-end' },
                ]}
              >
                <Text style={[styles.tierText, { color: colors.gold }]}>
                  {'\u2B50'} {t(`trust.${tier}`)}
                </Text>
              </View>

              <Text style={[styles.trustDescription, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
                {t('trust.description')}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
            {t('profile.settings')}
          </Text>

          {/* Language */}
          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.settingLabel, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('profile.language')}
            </Text>
            <View style={[styles.languageButtons, rtl && { flexDirection: 'row-reverse' }]}>
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
            <View style={[styles.settingRow, rtl && { flexDirection: 'row-reverse' }]}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
                  {t('profile.theme')}
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
            {t('profile.statistics')}
          </Text>

          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.gold }]}>8</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('profile.stat_completed')}
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
                {t('profile.stat_active')}
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
                {t('profile.stat_payment_rate')}
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
                {t('profile.stat_tenure')}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.error }]}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              await logout();
              // Navigate to onboarding after successful logout
              router.replace('/onboarding');
            } catch (error) {
              console.error('Logout failed:', error);
            }
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
  email: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  badgeContainer: {
    marginVertical: Spacing.sm,
  },
  verifiedBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  verifiedText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
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
