import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Spacing } from '@/constants/theme';

interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.card,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity,
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            colors.gold + '30',
            colors.gold + '50',
            colors.gold + '30',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export const TontineCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.cardSkeleton,
        {
          backgroundColor: colors.card,
          borderColor: colors.gold + '40',
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="70%" height={24} style={{ marginBottom: Spacing.sm }} />
          <SkeletonLoader width="50%" height={16} />
        </View>
        <SkeletonLoader width={50} height={50} borderRadius={25} />
      </View>

      <View style={styles.cardDetails}>
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="60%" height={14} style={{ marginBottom: Spacing.xs }} />
          <SkeletonLoader width="80%" height={18} />
        </View>
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="50%" height={14} style={{ marginBottom: Spacing.xs }} />
          <SkeletonLoader width="70%" height={18} />
        </View>
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="55%" height={14} style={{ marginBottom: Spacing.xs }} />
          <SkeletonLoader width="65%" height={18} />
        </View>
      </View>
    </View>
  );
};

export const RoundCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.roundCardSkeleton,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.roundHeader}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <SkeletonLoader width="60%" height={18} style={{ marginBottom: Spacing.xs }} />
          <SkeletonLoader width="40%" height={14} />
        </View>
        <SkeletonLoader width={80} height={32} borderRadius={BorderRadius.sm} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    position: 'relative',
  },
  cardSkeleton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  roundCardSkeleton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  roundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
