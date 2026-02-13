import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'flouci';
  style?: any;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const getButtonStyle = () => {
    if (variant === 'flouci') {
      return { backgroundColor: colors.flouci };
    }
    if (variant === 'secondary') {
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.gold,
      };
    }
    return { backgroundColor: colors.gold };
  };

  const getTextColor = () => {
    if (variant === 'secondary') return colors.gold;
    return '#0F172A';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  text: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
