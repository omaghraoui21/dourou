import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { GoldButton } from '@/components/GoldButton';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@fastshot/auth';
import { generateInviteCode } from '@/types';

interface InvitationModalProps {
  visible: boolean;
  onClose: () => void;
  tontineId: string;
  tontineName: string;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({
  visible,
  onClose,
  tontineId,
  tontineName,
}) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const rtl = i18n.language === 'ar';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateAndSaveCode = useCallback(async () => {
    if (!user?.id) {
      setError(t('common.error', { defaultValue: 'Error' }));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newCode = generateInviteCode();

      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error: insertError } = await supabase
        .from('invitations')
        .insert({
          code: newCode,
          tontine_id: tontineId,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
          max_uses: 10,
          used_count: 0,
        });

      if (insertError) {
        // If the code already exists (unlikely but possible), retry once
        if (insertError.code === '23505') {
          const retryCode = generateInviteCode();
          const { error: retryError } = await supabase
            .from('invitations')
            .insert({
              code: retryCode,
              tontine_id: tontineId,
              created_by: user.id,
              expires_at: expiresAt.toISOString(),
              max_uses: 10,
              used_count: 0,
            });

          if (retryError) {
            console.error('Error saving invitation (retry):', retryError);
            setError(t('invitation.generate_error', { defaultValue: 'Failed to generate invitation code' }));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setLoading(false);
            return;
          }

          setCode(retryCode);
        } else {
          console.error('Error saving invitation:', insertError);
          setError(t('invitation.generate_error', { defaultValue: 'Failed to generate invitation code' }));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setLoading(false);
          return;
        }
      } else {
        setCode(newCode);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Generate code error:', err);
      setError(t('invitation.generate_error', { defaultValue: 'Failed to generate invitation code' }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, tontineId, t]);

  // Generate a new code when the modal opens
  useEffect(() => {
    if (visible) {
      generateAndSaveCode();
    } else {
      // Reset state when modal closes
      setCode('');
      setError('');
      setCopied(false);
    }
  }, [visible, generateAndSaveCode]);

  const handleCopy = async () => {
    if (!code) return;

    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleShare = async () => {
    if (!code) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const message = t('invitation.share_message', {
        defaultValue: 'Join my tontine "{{name}}"! Use code: {{code}}',
        name: tontineName,
        code: code,
      });

      await Share.share({
        message,
      });
    } catch (err) {
      // User cancelled share or error occurred
      if ((err as Error).message !== 'User did not share') {
        console.error('Share error:', err);
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      style={styles.modal}
      avoidKeyboard
      backdropOpacity={0.7}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        {/* Gold accent line at top */}
        <View style={[styles.accentLine, { backgroundColor: colors.gold }]} />

        {/* Header */}
        <View style={[styles.headerRow, rtl && { flexDirection: 'row-reverse' }]}>
          <Text style={[styles.title, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
            {t('invitation.invite_members', { defaultValue: 'Invite Members' })}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
          {t('invitation.share_code_subtitle', {
            defaultValue: 'Share this code with people you want to invite to "{{name}}"',
            name: tontineName,
          })}
        </Text>

        {/* Code Display */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.gold} size="large" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t('invitation.generating', { defaultValue: 'Generating code...' })}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <GoldButton
              title={t('common.retry', { defaultValue: 'Retry' })}
              onPress={generateAndSaveCode}
              variant="secondary"
              style={{ marginTop: Spacing.md }}
            />
          </View>
        ) : (
          <>
            {/* Code box */}
            <View style={[styles.codeBox, { backgroundColor: colors.background, borderColor: colors.gold }]}>
              <Text style={[styles.codeText, { color: colors.gold }]}>
                {code}
              </Text>
            </View>

            {/* Expiry note */}
            <Text style={[styles.expiryText, { color: colors.textSecondary }]}>
              {t('invitation.expires_in', { defaultValue: 'Expires in 7 days  |  Max 10 uses' })}
            </Text>

            {/* Action buttons */}
            <View style={[styles.buttons, rtl && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: copied ? colors.success + '15' : colors.gold + '15',
                    borderColor: copied ? colors.success : colors.gold,
                  },
                ]}
                onPress={handleCopy}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>{copied ? '✓' : '📋'}</Text>
                <Text
                  style={[
                    styles.actionLabel,
                    { color: copied ? colors.success : colors.gold },
                  ]}
                >
                  {copied
                    ? t('invitation.copied', { defaultValue: 'Copied!' })
                    : t('invitation.copy_code', { defaultValue: 'Copy Code' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.gold + '15',
                    borderColor: colors.gold,
                  },
                ]}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>📤</Text>
                <Text style={[styles.actionLabel, { color: colors.gold }]}>
                  {t('invitation.share', { defaultValue: 'Share' })}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.xs,
  },
  accentLine: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  errorText: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  codeBox: {
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  codeText: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    letterSpacing: 10,
  },
  expiryText: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
