import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { GoldButton } from '@/components/GoldButton';
import * as Haptics from 'expo-haptics';

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, phone: string) => void;
  existingPhones: string[];
  isFull: boolean;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  visible,
  onClose,
  onAdd,
  existingPhones,
  isFull,
}) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const rtl = i18n.language === 'ar';

  const handleAdd = () => {
    if (!name.trim()) {
      setError(t('tontine.name_required'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!phone.trim()) {
      setError(t('tontine.phone_required'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (existingPhones.includes(phone.trim())) {
      setError(t('tontine.phone_exists'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (isFull) {
      setError(t('tontine.group_full'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAdd(name.trim(), phone.trim());
    setName('');
    setPhone('');
    setError('');
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setError('');
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          {/* Gold accent line at top */}
          <View style={[styles.accentLine, { backgroundColor: colors.gold }]} />

          {/* Header */}
          <View style={[styles.headerRow, rtl && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.title, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
              {t('tontine.add_member')}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <Text style={[styles.label, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
            {t('tontine.member_name')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
                textAlign: rtl ? 'right' : 'left',
              },
            ]}
            placeholder={t('tontine.member_name_placeholder')}
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError('');
            }}
            autoFocus
          />

          {/* Phone Input */}
          <Text style={[styles.label, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
            {t('tontine.member_phone')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
                textAlign: rtl ? 'right' : 'left',
              },
            ]}
            placeholder={t('tontine.member_phone_placeholder')}
            placeholderTextColor={colors.textSecondary}
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError('');
            }}
            keyboardType="phone-pad"
          />

          {/* Error */}
          {error ? (
            <Text style={[styles.error, { color: colors.error, textAlign: rtl ? 'right' : 'left' }]}>
              {error}
            </Text>
          ) : null}

          {/* Buttons */}
          <View style={[styles.buttons, rtl && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <View style={styles.addButtonContainer}>
              <GoldButton
                title={t('tontine.add_member')}
                onPress={handleAdd}
                disabled={isFull || !name.trim() || !phone.trim()}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: Spacing.lg,
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
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  input: {
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
  },
  error: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  addButtonContainer: {
    flex: 1,
  },
});
