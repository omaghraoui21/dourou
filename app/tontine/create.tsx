import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { GoldButton } from '@/components/GoldButton';
import * as Haptics from 'expo-haptics';
import { useTontines } from '@/contexts/TontineContext';

type Step = 1 | 2 | 3 | 4 | 5;

interface TontineData {
  name: string;
  contribution: string;
  frequency: 'weekly' | 'monthly';
  members: string;
  distribution: 'fixed' | 'random' | 'trust';
}

export default function CreateTontineScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { addTontine } = useTontines();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const rtl = i18n.language === 'ar';
  const [data, setData] = useState<TontineData>({
    name: '',
    contribution: '',
    frequency: 'monthly',
    members: '',
    distribution: 'fixed',
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      handleCreate();
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      // Calculate next deadline based on frequency
      const now = new Date();
      const nextDeadline = new Date(now);
      if (data.frequency === 'weekly') {
        nextDeadline.setDate(now.getDate() + 7);
      } else {
        nextDeadline.setMonth(now.getMonth() + 1);
      }

      // Create the tontine object
      const newTontine = await addTontine({
        name: data.name,
        contribution: parseInt(data.contribution),
        frequency: data.frequency,
        totalMembers: parseInt(data.members),
        distributionLogic: data.distribution,
        nextDeadline,
      });

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to the new tontine detail screen to add members
      router.replace(`/tontine/${newTontine.id}`);
    } catch (error) {
      console.error('Error creating tontine:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('common.error'),
        t('tontine.create_error'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.name.length > 0;
      case 2:
        return data.contribution.length > 0 && parseInt(data.contribution) > 0;
      case 3:
        const memberCount = parseInt(data.members);
        return data.members.length > 0 && memberCount >= 3 && memberCount <= 50;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, rtl && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backIcon, { color: colors.gold }]}>{rtl ? '\u2192' : '\u2190'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('tontine.create')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress indicator */}
      <View style={[styles.progressContainer, rtl && { flexDirection: 'row-reverse' }]}>
        {[1, 2, 3, 4, 5].map((step) => (
          <View key={step} style={[styles.progressItem, rtl && { flexDirection: 'row-reverse' }]}>
            <View
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    step <= currentStep ? colors.gold : colors.border,
                },
              ]}
            />
            {step < 5 && (
              <View
                style={[
                  styles.progressLine,
                  {
                    backgroundColor:
                      step < currentStep ? colors.gold : colors.border,
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step 1: Name */}
          {currentStep === 1 && (
            <View style={styles.step}>
              <Text style={[styles.stepTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
                {t('tontine.name')}
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
                {t('tontine.name_description')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                    textAlign: rtl ? 'right' : 'left',
                  },
                ]}
                placeholder={t('tontine.name_placeholder')}
                placeholderTextColor={colors.textSecondary}
                value={data.name}
                onChangeText={(text) => setData({ ...data, name: text })}
                autoFocus
              />
            </View>
          )}

          {/* Step 2: Contribution & Frequency */}
          {currentStep === 2 && (
            <View style={styles.step}>
              <Text style={[styles.stepTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
                {t('tontine.contribution')}
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
                {t('tontine.contribution_description')}
              </Text>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text,
                      textAlign: rtl ? 'right' : 'left',
                    },
                  ]}
                  placeholder="200"
                  placeholderTextColor={colors.textSecondary}
                  value={data.contribution}
                  onChangeText={(text) => setData({ ...data, contribution: text })}
                  keyboardType="numeric"
                />
                <Text style={[styles.inputSuffix, { color: colors.textSecondary }, rtl && { right: undefined, left: Spacing.md }]}>
                  {t('common.tnd')}
                </Text>
              </View>

              <View style={[styles.frequencyButtons, rtl && { flexDirection: 'row-reverse' }]}>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    {
                      backgroundColor:
                        data.frequency === 'weekly' ? colors.gold : colors.card,
                      borderColor: colors.gold,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setData({ ...data, frequency: 'weekly' });
                  }}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      {
                        color:
                          data.frequency === 'weekly' ? '#0F172A' : colors.text,
                      },
                    ]}
                  >
                    {t('tontine.weekly')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    {
                      backgroundColor:
                        data.frequency === 'monthly' ? colors.gold : colors.card,
                      borderColor: colors.gold,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setData({ ...data, frequency: 'monthly' });
                  }}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      {
                        color:
                          data.frequency === 'monthly' ? '#0F172A' : colors.text,
                      },
                    ]}
                  >
                    {t('tontine.monthly')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: Members */}
          {currentStep === 3 && (
            <View style={styles.step}>
              <Text style={[styles.stepTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
                {t('tontine.members')}
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
                {t('tontine.members_description')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                    textAlign: rtl ? 'right' : 'left',
                  },
                ]}
                placeholder="6"
                placeholderTextColor={colors.textSecondary}
                value={data.members}
                onChangeText={(text) => setData({ ...data, members: text })}
                keyboardType="numeric"
              />
              <Text style={[styles.helperText, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
                {t('tontine.members_min_max', { defaultValue: 'Minimum 3 members, maximum 50 members' })}
              </Text>
            </View>
          )}

          {/* Step 4: Distribution Logic */}
          {currentStep === 4 && (
            <View style={styles.step}>
              <Text style={[styles.stepTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
                {t('tontine.distribution')}
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
                {t('tontine.distribution_description')}
              </Text>

              {(['fixed', 'random', 'trust'] as const).map((dist) => {
                const icons = { fixed: '\uD83D\uDCCB', random: '\uD83C\uDFB2', trust: '\u2B50' };
                return (
                  <TouchableOpacity
                    key={dist}
                    style={[
                      styles.distributionCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: data.distribution === dist ? colors.gold : colors.border,
                        borderWidth: data.distribution === dist ? 2 : 1,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setData({ ...data, distribution: dist });
                    }}
                  >
                    <Text style={[styles.distributionTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
                      {icons[dist]} {t(`tontine.${dist}`)}
                    </Text>
                    <Text style={[styles.distributionDescription, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
                      {t(`tontine.${dist}_description`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Step 5: Summary */}
          {currentStep === 5 && (
            <View style={styles.step}>
              <Text style={[styles.stepTitle, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
                {t('tontine.summary')}
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
                {t('tontine.summary_description')}
              </Text>

              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {[
                  { label: t('tontine.name'), value: data.name, isGold: false },
                  { label: t('tontine.contribution'), value: `${data.contribution} ${t('common.tnd')}`, isGold: true },
                  { label: t('tontine.frequency'), value: t(`tontine.${data.frequency}`), isGold: false },
                  { label: t('tontine.members'), value: data.members, isGold: false },
                  { label: t('tontine.distribution'), value: t(`tontine.${data.distribution}`), isGold: false },
                ].map((item, idx) => (
                  <View key={idx} style={[styles.summaryRow, rtl && { flexDirection: 'row-reverse' }, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.summaryValue, { color: item.isGold ? colors.gold : colors.text }]}>
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <GoldButton
            title={currentStep === 5 ? t('common.confirm') : t('common.next')}
            onPress={handleNext}
            disabled={!isStepValid()}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  progressItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  step: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  stepDescription: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  input: {
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.lg,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  inputSuffix: {
    position: 'absolute',
    right: Spacing.md,
    top: 18,
    fontSize: FontSizes.lg,
  },
  helperText: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  frequencyButton: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  distributionCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  distributionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  distributionDescription: {
    fontSize: FontSizes.sm,
  },
  summaryCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontSize: FontSizes.md,
  },
  summaryValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  footer: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
});
