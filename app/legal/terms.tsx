/**
 * Terms of Service
 * High-end glassmorphic design with scrollable legal content
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const TermsOfService = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const rtl = i18n.language === 'ar';

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={[styles.header, rtl && styles.headerRTL]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={[styles.backButton, rtl && styles.backButtonRTL]}
          >
            <Text style={styles.backText}>{rtl ? '→' : '←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('legal.terms_of_service')}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <BlurView intensity={20} style={styles.contentCard} tint="dark">
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.05)', 'transparent', 'rgba(212, 175, 55, 0.05)']}
              style={styles.cardGradient}
            >
              {/* Icon */}
              <View style={styles.iconHeader}>
                <Text style={styles.icon}>📜</Text>
                <Text style={[styles.documentTitle, rtl && styles.textRTL]}>
                  {t('legal.terms_of_service')}
                </Text>
                <Text style={[styles.lastUpdated, rtl && styles.textRTL]}>
                  {t('legal.last_updated')}: {new Date().toLocaleDateString(i18n.language)}
                </Text>
              </View>

              {/* Content Sections */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
                  1. {t('legal.terms_acceptance')}
                </Text>
                <Text style={[styles.sectionText, rtl && styles.textRTL]}>
                  {t('legal.terms_acceptance_text')}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
                  2. {t('legal.terms_service_description')}
                </Text>
                <Text style={[styles.sectionText, rtl && styles.textRTL]}>
                  {t('legal.terms_service_description_text')}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
                  3. {t('legal.terms_user_obligations')}
                </Text>
                <Text style={[styles.sectionText, rtl && styles.textRTL]}>
                  {t('legal.terms_user_obligations_text')}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
                  4. {t('legal.terms_tontine_rules')}
                </Text>
                <Text style={[styles.sectionText, rtl && styles.textRTL]}>
                  {t('legal.terms_tontine_rules_text')}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
                  5. {t('legal.terms_payment_responsibility')}
                </Text>
                <Text style={[styles.sectionText, rtl && styles.textRTL]}>
                  {t('legal.terms_payment_responsibility_text')}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
                  6. {t('legal.terms_trust_score')}
                </Text>
                <Text style={[styles.sectionText, rtl && styles.textRTL]}>
                  {t('legal.terms_trust_score_text')}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
                  7. {t('legal.terms_liability')}
                </Text>
                <Text style={[styles.sectionText, rtl && styles.textRTL]}>
                  {t('legal.terms_liability_text')}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
                  8. {t('legal.terms_termination')}
                </Text>
                <Text style={[styles.sectionText, rtl && styles.textRTL]}>
                  {t('legal.terms_termination_text')}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
                  9. {t('legal.terms_changes')}
                </Text>
                <Text style={[styles.sectionText, rtl && styles.textRTL]}>
                  {t('legal.terms_changes_text')}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, rtl && styles.textRTL]}>
                  10. {t('legal.terms_contact')}
                </Text>
                <Text style={[styles.sectionText, rtl && styles.textRTL]}>
                  {t('legal.terms_contact_text')}
                </Text>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <LinearGradient
                  colors={['transparent', 'rgba(212, 175, 55, 0.1)']}
                  style={styles.footerGradient}
                >
                  <Text style={[styles.footerText, rtl && styles.textRTL]}>
                    © {new Date().getFullYear()} Dourou (دورو)
                  </Text>
                  <Text style={[styles.footerSubtext, rtl && styles.textRTL]}>
                    {t('legal.all_rights_reserved')}
                  </Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </BlurView>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backButtonRTL: {
    marginRight: 0,
    marginLeft: 16,
  },
  backText: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    fontFamily: 'PlayfairDisplay-Bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  contentCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  cardGradient: {
    padding: 24,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#94A3B8',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  sectionText: {
    fontSize: 15,
    color: '#CBD5E1',
    lineHeight: 24,
  },
  footer: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
  },
  footerGradient: {
    paddingTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#94A3B8',
  },
  textRTL: {
    textAlign: 'right',
  },
});

export default TermsOfService;
