/**
 * Delete Account Modal
 * Secure flow with confirmation and haptic feedback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';

interface DeleteAccountModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userName: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  userName,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const rtl = i18n.language === 'ar';

  const [step, setStep] = useState<'warning' | 'confirmation'>('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const CONFIRMATION_PHRASE = 'DELETE';

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('warning');
    setConfirmationText('');
    setError('');
    onClose();
  };

  const handleProceedToConfirmation = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setStep('confirmation');
  };

  const handleConfirmDelete = async () => {
    if (confirmationText.toUpperCase() !== CONFIRMATION_PHRASE) {
      setError(t('profile.delete_account_error_mismatch'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setIsDeleting(true);
      setError('');

      // Heavy haptic before destructive action
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      await onConfirm();

      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Delete account failed:', err);
      setError(t('profile.delete_account_error_generic'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection="down"
      style={styles.modal}
      backdropOpacity={0.8}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <BlurView intensity={30} style={styles.modalContent} tint="dark">
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.1)', 'transparent']}
          style={styles.gradient}
        >
          {/* Swipe Indicator */}
          <View style={styles.swipeIndicator} />

          {step === 'warning' ? (
            // Warning Step
            <>
              <View style={styles.iconContainer}>
                <Text style={styles.warningIcon}>⚠️</Text>
              </View>

              <Text style={[styles.title, { color: colors.error }, rtl && styles.textRTL]}>
                {t('profile.delete_account_title')}
              </Text>

              <Text style={[styles.subtitle, { color: colors.textSecondary }, rtl && styles.textRTL]}>
                {t('profile.delete_account_warning')}
              </Text>

              <View style={[styles.warningBox, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
                <Text style={[styles.warningText, { color: colors.error }, rtl && styles.textRTL]}>
                  • {t('profile.delete_account_warning_1')}
                </Text>
                <Text style={[styles.warningText, { color: colors.error }, rtl && styles.textRTL]}>
                  • {t('profile.delete_account_warning_2')}
                </Text>
                <Text style={[styles.warningText, { color: colors.error }, rtl && styles.textRTL]}>
                  • {t('profile.delete_account_warning_3')}
                </Text>
                <Text style={[styles.warningText, { color: colors.error }, rtl && styles.textRTL]}>
                  • {t('profile.delete_account_warning_4')}
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.dangerButton, { backgroundColor: colors.error }]}
                  onPress={handleProceedToConfirmation}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                    {t('profile.delete_account_proceed')}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Confirmation Step
            <>
              <View style={styles.iconContainer}>
                <Text style={styles.dangerIcon}>🔒</Text>
              </View>

              <Text style={[styles.title, { color: colors.error }, rtl && styles.textRTL]}>
                {t('profile.delete_account_confirm_title')}
              </Text>

              <Text style={[styles.subtitle, { color: colors.textSecondary }, rtl && styles.textRTL]}>
                {t('profile.delete_account_confirm_subtitle')}
              </Text>

              <View style={[styles.userBox, { backgroundColor: colors.gold + '10', borderColor: colors.gold + '30' }]}>
                <Text style={[styles.userBoxLabel, { color: colors.textSecondary }, rtl && styles.textRTL]}>
                  {t('profile.delete_account_user')}:
                </Text>
                <Text style={[styles.userBoxName, { color: colors.gold }, rtl && styles.textRTL]}>
                  {userName}
                </Text>
              </View>

              <Text style={[styles.confirmationLabel, { color: colors.text }, rtl && styles.textRTL]}>
                {t('profile.delete_account_type_delete')}:
              </Text>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: error ? colors.error : colors.border,
                    color: colors.text,
                    textAlign: rtl ? 'right' : 'left',
                  },
                ]}
                value={confirmationText}
                onChangeText={(text) => {
                  setConfirmationText(text);
                  setError('');
                }}
                placeholder={CONFIRMATION_PHRASE}
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
                editable={!isDeleting}
              />

              {error && (
                <Text style={[styles.errorText, { color: colors.error }, rtl && styles.textRTL]}>
                  {error}
                </Text>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={handleClose}
                  activeOpacity={0.8}
                  disabled={isDeleting}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.dangerButton,
                    {
                      backgroundColor: colors.error,
                      opacity: confirmationText.toUpperCase() === CONFIRMATION_PHRASE && !isDeleting ? 1 : 0.5,
                    },
                  ]}
                  onPress={handleConfirmDelete}
                  activeOpacity={0.8}
                  disabled={confirmationText.toUpperCase() !== CONFIRMATION_PHRASE || isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                      {t('profile.delete_account_confirm')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </LinearGradient>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  gradient: {
    padding: 24,
    paddingBottom: 40,
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 64,
  },
  dangerIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  warningBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 8,
  },
  userBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: 'center',
  },
  userBoxLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  userBoxName: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'PlayfairDisplay-Bold',
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  dangerButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
  },
});
