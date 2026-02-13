/**
 * Legal Center - Main Index
 * Entry point for Terms of Service, Privacy Policy, and legal documents
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

const LegalCenter = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const rtl = i18n.language === 'ar';

  const handleNavigate = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path);
  };

  const legalItems = [
    {
      id: 'terms',
      title: t('legal.terms_of_service'),
      subtitle: t('legal.terms_subtitle'),
      icon: '📜',
      path: '/legal/terms',
    },
    {
      id: 'privacy',
      title: t('legal.privacy_policy'),
      subtitle: t('legal.privacy_subtitle'),
      icon: '🔒',
      path: '/legal/privacy',
    },
  ];

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
          <Text style={styles.headerTitle}>{t('legal.legal_center')}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroIcon}>⚖️</Text>
            <Text style={[styles.heroTitle, rtl && styles.textRTL]}>
              {t('legal.hero_title')}
            </Text>
            <Text style={[styles.heroSubtitle, rtl && styles.textRTL]}>
              {t('legal.hero_subtitle')}
            </Text>
          </View>

          {/* Legal Items */}
          {legalItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleNavigate(item.path)}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.card} tint="dark">
                <LinearGradient
                  colors={['rgba(212, 175, 55, 0.1)', 'transparent']}
                  style={styles.cardGradient}
                >
                  <View style={[styles.cardContent, rtl && styles.cardContentRTL]}>
                    <View style={[styles.iconContainer, rtl && styles.iconContainerRTL]}>
                      <Text style={styles.itemIcon}>{item.icon}</Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={[styles.itemTitle, rtl && styles.textRTL]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.itemSubtitle, rtl && styles.textRTL]}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <View style={[styles.chevronContainer, rtl && styles.chevronContainerRTL]}>
                      <Text style={styles.chevron}>{rtl ? '←' : '→'}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          ))}

          {/* Footer Note */}
          <View style={styles.footerNote}>
            <Text style={[styles.footerText, rtl && styles.textRTL]}>
              {t('legal.last_updated')}: {new Date().toLocaleDateString(i18n.language)}
            </Text>
          </View>
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
    fontSize: 24,
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
  heroSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContentRTL: {
    flexDirection: 'row-reverse',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerRTL: {
    marginRight: 0,
    marginLeft: 16,
  },
  itemIcon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  chevronContainerRTL: {
    marginLeft: 0,
    marginRight: 12,
  },
  chevron: {
    fontSize: 20,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  footerNote: {
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'right',
  },
});

export default LegalCenter;
