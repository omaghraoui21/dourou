import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SplashScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the circle drawing
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      // Navigate to onboarding after animation
      setTimeout(() => {
        router.replace('/onboarding');
      }, 500);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logoContainer}>
        <Svg width={200} height={200} viewBox="0 0 200 200">
          {/* Outer gold circle */}
          <AnimatedCircle
            cx="100"
            cy="100"
            r="80"
            stroke={colors.gold}
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
          {/* Inner tree motif - simplified */}
          <Circle cx="100" cy="70" r="8" fill={colors.gold} opacity={0.6} />
          <Circle cx="90" cy="85" r="6" fill={colors.gold} opacity={0.6} />
          <Circle cx="110" cy="85" r="6" fill={colors.gold} opacity={0.6} />
          <Circle cx="85" cy="100" r="5" fill={colors.gold} opacity={0.6} />
          <Circle cx="100" cy="100" r="7" fill={colors.gold} opacity={0.6} />
          <Circle cx="115" cy="100" r="5" fill={colors.gold} opacity={0.6} />
        </Svg>

        <Text style={[styles.title, { color: colors.gold }]}>Dourou</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>دورو</Text>
      </View>

      <Text style={[styles.tagline, { color: colors.textSecondary }]}>
        {t('splash.tagline')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    marginTop: 24,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 32,
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
});
