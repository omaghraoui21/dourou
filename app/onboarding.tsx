import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GoldButton } from '@/components/GoldButton';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    key: 'screen1',
    icon: '📱',
  },
  {
    key: 'screen2',
    icon: '📊',
  },
  {
    key: 'screen3',
    icon: '⭐',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const rtl = i18n.language === 'ar';
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: width * nextIndex, animated: true });
      setCurrentIndex(nextIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      router.replace('/auth/phone');
    }
  };

  const handleSkip = () => {
    router.replace('/auth/phone');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={[styles.skipButton, rtl && styles.skipButtonRTL]} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: colors.gold }]}>{t('common.skip')}</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {onboardingData.map((item, index) => (
          <View key={item.key} style={styles.slide}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {t(`onboarding.${item.key}.title`)}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {t(`onboarding.${item.key}.description`)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex ? colors.gold : colors.border,
                  width: index === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <GoldButton
          title={
            currentIndex === onboardingData.length - 1
              ? t('common.continue')
              : t('common.next')
          }
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipButtonRTL: {
    right: undefined,
    left: Spacing.lg,
  },
  skipText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: BorderRadius.full,
  },
  button: {
    width: '100%',
  },
});
