import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface PremiumInputProps extends TextInputProps {
  label: string;
  error?: string;
  success?: boolean;
  validationRules?: ValidationRule[];
  showValidation?: boolean;
  icon?: string;
  helpText?: string;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  error,
  success,
  validationRules = [],
  showValidation = true,
  icon,
  helpText,
  value,
  onChangeText,
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>(error);
  const [isValid, setIsValid] = useState(false);
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setInternalError(error);
  }, [error]);

  useEffect(() => {
    // Animate border color
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, borderColorAnim]);

  const validateInput = (text: string) => {
    if (!showValidation || validationRules.length === 0) return;

    for (const rule of validationRules) {
      if (!rule.test(text)) {
        setInternalError(rule.message);
        setIsValid(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // Shake animation
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
        return;
      }
    }

    setInternalError(undefined);
    setIsValid(true);
    if (text.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleChangeText = (text: string) => {
    onChangeText?.(text);

    // Debounced validation
    if (showValidation && text.length > 0) {
      const timer = setTimeout(() => validateInput(text), 500);
      return () => clearTimeout(timer);
    }
  };

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      internalError ? colors.error : colors.border,
      isValid ? colors.success : colors.gold,
    ],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: shakeAnim }] },
      ]}
    >
      {/* Label */}
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
      </Text>

      {/* Input Container */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.card,
            borderColor,
            borderWidth: isFocused ? 2 : 1,
          },
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              flex: 1,
            },
          ]}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (value) validateInput(value);
          }}
          {...textInputProps}
        />

        {/* Status Indicator */}
        {showValidation && value && value.length > 0 && (
          <View style={styles.statusContainer}>
            {isValid && !internalError && (
              <Text style={[styles.statusIcon, { color: colors.success }]}>✓</Text>
            )}
            {internalError && (
              <Text style={[styles.statusIcon, { color: colors.error }]}>✕</Text>
            )}
          </View>
        )}
      </Animated.View>

      {/* Help Text or Error */}
      {(internalError || helpText) && (
        <View style={styles.feedbackContainer}>
          {internalError ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              ⚠ {internalError}
            </Text>
          ) : (
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              {helpText}
            </Text>
          )}
        </View>
      )}

      {/* Success Message */}
      {success && !internalError && (
        <Text style={[styles.successText, { color: colors.success }]}>
          ✓ {label} is valid
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
  },
  icon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  input: {
    fontSize: FontSizes.md,
    paddingVertical: Spacing.sm,
  },
  statusContainer: {
    marginLeft: Spacing.sm,
  },
  statusIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  feedbackContainer: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  errorText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  helpText: {
    fontSize: FontSizes.xs,
  },
  successText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
});
