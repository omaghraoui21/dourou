import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GoldButton } from '@/components/GoldButton';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function OTPScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const rtl = i18n.language === 'ar';

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const setRef = (index: number) => (ref: TextInput | null) => {
    inputRefs.current[index] = ref;
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: phone as string,
        token: otpCode,
        type: 'sms',
      });

      if (verifyError) {
        console.error('OTP verify error:', verifyError);
        setError(verifyError.message);
        Alert.alert(t('common.error'), verifyError.message);
        return;
      }

      if (data.session) {
        // Check if user already has a profile with a name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.session.user.id)
          .single();

        if (profile && profile.full_name && profile.full_name.trim().length > 0) {
          // Existing user with name - go to dashboard
          router.replace('/(tabs)');
        } else {
          // New user or no name - go to profile setup
          router.replace({
            pathname: '/auth/profile',
            params: { phone: phone as string },
          });
        }
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        phone: phone as string,
      });
      if (resendError) {
        setError(resendError.message);
      } else {
        Alert.alert(t('auth.otp_resent_title'), t('auth.otp_resent_message'));
      }
    } catch (err) {
      console.error('Resend error:', err);
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
          {t('auth.otp_title')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
          {t('auth.otp_subtitle', { phone })}
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={setRef(index)}
              style={[
                styles.otpInput,
                {
                  backgroundColor: colors.card,
                  borderColor: error ? colors.error : digit ? colors.gold : colors.border,
                  color: colors.text,
                },
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : null}

        <GoldButton
          title={t('common.continue')}
          onPress={handleVerify}
          loading={loading}
          disabled={otp.join('').length < 6}
          style={styles.button}
        />

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={resending}
        >
          <Text style={[styles.resendText, { color: colors.gold, opacity: resending ? 0.5 : 1 }]}>
            {resending ? t('auth.otp_resending') : t('auth.otp_resend')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  errorText: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  resendButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  resendText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
