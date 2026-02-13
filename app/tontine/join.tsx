import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { GoldButton } from '@/components/GoldButton';
import * as Haptics from 'expo-haptics';
import { useTontines } from '@/contexts/TontineContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@fastshot/auth';
// getInitials available from @/types if needed for avatar display

export default function JoinGroupScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { refreshTontines } = useTontines();
  const rtl = i18n.language === 'ar';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ name: string; id: string } | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleCodeChange = (text: string) => {
    // Auto-uppercase and limit to 6 chars, alphanumeric only
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(cleaned);
    setError('');
  };

  const handleJoin = async () => {
    if (code.length !== 6) {
      setError(t('invitation.invalid_code', { defaultValue: 'Please enter a valid 6-character code' }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!user?.id) {
      setError(t('common.error', { defaultValue: 'Error' }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Look up the invitation code
      const { data: invitation, error: lookupError } = await supabase
        .from('invitations')
        .select('*')
        .eq('code', code)
        .single();

      if (lookupError || !invitation) {
        setError(t('invitation.code_not_found', { defaultValue: 'Invitation code not found' }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
        return;
      }

      // 2. Validate expiration
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      if (now > expiresAt) {
        setError(t('invitation.code_expired', { defaultValue: 'This invitation code has expired' }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
        return;
      }

      // 3. Validate usage count
      const usedCount = invitation.used_count ?? 0;
      const maxUses = invitation.max_uses ?? 10;
      if (usedCount >= maxUses) {
        setError(t('invitation.code_max_uses', { defaultValue: 'This invitation code has reached its maximum uses' }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
        return;
      }

      // 4. Fetch the tontine to get its name and details
      const { data: tontine, error: tontineError } = await supabase
        .from('tontines')
        .select('*')
        .eq('id', invitation.tontine_id)
        .single();

      if (tontineError || !tontine) {
        setError(t('invitation.tontine_not_found', { defaultValue: 'The tontine for this invitation could not be found' }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
        return;
      }

      // 5. Check if user is already a member
      const { data: existingMember } = await supabase
        .from('tontine_members')
        .select('id')
        .eq('tontine_id', invitation.tontine_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMember) {
        setError(t('invitation.already_member', { defaultValue: 'You are already a member of this group' }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
        return;
      }

      // 6. Check if the tontine is full
      const { count: memberCount } = await supabase
        .from('tontine_members')
        .select('id', { count: 'exact', head: true })
        .eq('tontine_id', invitation.tontine_id);

      if (memberCount !== null && memberCount >= tontine.total_members) {
        setError(t('invitation.group_full', { defaultValue: 'This group is already full' }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
        return;
      }

      // 7. Add the user as a member
      const memberName = user.user_metadata?.full_name ?? user.email ?? 'Member';
      const nextPayoutOrder = (memberCount ?? 0) + 1;

      const { error: insertError } = await supabase
        .from('tontine_members')
        .insert({
          tontine_id: invitation.tontine_id,
          user_id: user.id,
          name: memberName,
          phone: user.phone ?? null,
          role: 'member',
          payout_order: nextPayoutOrder,
        });

      if (insertError) {
        console.error('Error inserting member:', insertError);
        setError(t('invitation.join_error', { defaultValue: 'Failed to join the group. Please try again.' }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
        return;
      }

      // 8. Increment used_count on the invitation
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ used_count: usedCount + 1 })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation used_count:', updateError);
        // Non-critical: the user has already joined, so don't block on this
      }

      // 9. Success
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessInfo({ name: tontine.title, id: tontine.id });

      // Refresh tontines list
      await refreshTontines();

      // Navigate to the tontine detail after a brief moment
      setTimeout(() => {
        router.replace(`/tontine/${tontine.id}`);
      }, 1500);
    } catch (err) {
      console.error('Join error:', err);
      setError(t('invitation.join_error', { defaultValue: 'Failed to join the group. Please try again.' }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, rtl && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={[styles.backIcon, { color: colors.gold }]}>
              {rtl ? '\u2192' : '\u2190'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('invitation.join_group', { defaultValue: 'Join Group' })}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.gold + '15' }]}>
            <Text style={styles.iconText}>🔑</Text>
          </View>

          {/* Title & Subtitle */}
          <Text style={[styles.title, { color: colors.text, textAlign: rtl ? 'right' : 'center' }]}>
            {t('invitation.enter_code_title', { defaultValue: 'Enter Invitation Code' })}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'center' }]}>
            {t('invitation.enter_code_subtitle', { defaultValue: 'Ask the group admin for the 6-character code' })}
          </Text>

          {/* Code Input */}
          <TextInput
            style={[
              styles.codeInput,
              {
                backgroundColor: colors.card,
                borderColor: error ? colors.error : code.length === 6 ? colors.gold : colors.border,
                color: colors.text,
                borderWidth: error ? 2 : code.length === 6 ? 2 : 1,
              },
            ]}
            placeholder="XXXXXX"
            placeholderTextColor={colors.textSecondary + '60'}
            value={code}
            onChangeText={handleCodeChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            autoFocus
            editable={!loading && !successInfo}
          />

          {/* Error */}
          {error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          ) : null}

          {/* Success state */}
          {successInfo ? (
            <View style={[styles.successCard, { backgroundColor: colors.success + '15', borderColor: colors.success + '40' }]}>
              <Text style={styles.successIcon}>🎉</Text>
              <Text style={[styles.successTitle, { color: colors.success }]}>
                {t('invitation.join_success', { defaultValue: 'Successfully Joined!' })}
              </Text>
              <Text style={[styles.successName, { color: colors.text }]}>
                {successInfo.name}
              </Text>
              <ActivityIndicator
                color={colors.gold}
                size="small"
                style={{ marginTop: Spacing.md }}
              />
              <Text style={[styles.redirectText, { color: colors.textSecondary }]}>
                {t('invitation.redirecting', { defaultValue: 'Redirecting...' })}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Join Button */}
        {!successInfo && (
          <View style={styles.footer}>
            <GoldButton
              title={t('invitation.join_button', { defaultValue: 'Join' })}
              onPress={handleJoin}
              disabled={code.length !== 6}
              loading={loading}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    lineHeight: 24,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  codeInput: {
    width: '100%',
    height: 72,
    borderRadius: BorderRadius.md,
    fontSize: 32,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 12,
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  successCard: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  successName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  redirectText: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
  },
  footer: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
});
