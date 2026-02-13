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
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { GoldButton } from '@/components/GoldButton';
import * as Haptics from 'expo-haptics';

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
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
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
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.back();
      router.push('/(tabs)/tontines');
    }, 1500);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.name.length > 0;
      case 2:
        return data.contribution.length > 0 && parseInt(data.contribution) > 0;
      case 3:
        return data.members.length > 0 && parseInt(data.members) >= 2;
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backIcon, { color: colors.gold }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('tontine.create')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((step) => (
          <View key={step} style={styles.progressItem}>
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
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                {t('tontine.name')}
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Donnez un nom à votre tontine
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Ex: Famille Ben Ali"
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
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                {t('tontine.contribution')}
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Montant et fréquence de cotisation
              </Text>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="200"
                  placeholderTextColor={colors.textSecondary}
                  value={data.contribution}
                  onChangeText={(text) => setData({ ...data, contribution: text })}
                  keyboardType="numeric"
                />
                <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>
                  {t('common.tnd')}
                </Text>
              </View>

              <View style={styles.frequencyButtons}>
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
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                {t('tontine.members')}
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Nombre total de participants
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="6"
                placeholderTextColor={colors.textSecondary}
                value={data.members}
                onChangeText={(text) => setData({ ...data, members: text })}
                keyboardType="numeric"
              />
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                Minimum 2 membres requis
              </Text>
            </View>
          )}

          {/* Step 4: Distribution Logic */}
          {currentStep === 4 && (
            <View style={styles.step}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                {t('tontine.distribution')}
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Comment les tours seront attribués
              </Text>

              <TouchableOpacity
                style={[
                  styles.distributionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor:
                      data.distribution === 'fixed' ? colors.gold : colors.border,
                    borderWidth: data.distribution === 'fixed' ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setData({ ...data, distribution: 'fixed' });
                }}
              >
                <Text style={[styles.distributionTitle, { color: colors.text }]}>
                  📋 {t('tontine.fixed')}
                </Text>
                <Text
                  style={[styles.distributionDescription, { color: colors.textSecondary }]}
                >
                  L&apos;ordre est défini à l&apos;avance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.distributionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor:
                      data.distribution === 'random' ? colors.gold : colors.border,
                    borderWidth: data.distribution === 'random' ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setData({ ...data, distribution: 'random' });
                }}
              >
                <Text style={[styles.distributionTitle, { color: colors.text }]}>
                  🎲 {t('tontine.random')}
                </Text>
                <Text
                  style={[styles.distributionDescription, { color: colors.textSecondary }]}
                >
                  Tirage au sort à chaque tour
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.distributionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor:
                      data.distribution === 'trust' ? colors.gold : colors.border,
                    borderWidth: data.distribution === 'trust' ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setData({ ...data, distribution: 'trust' });
                }}
              >
                <Text style={[styles.distributionTitle, { color: colors.text }]}>
                  ⭐ {t('tontine.trust')}
                </Text>
                <Text
                  style={[styles.distributionDescription, { color: colors.textSecondary }]}
                >
                  Basé sur le score de confiance
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 5: Summary */}
          {currentStep === 5 && (
            <View style={styles.step}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Récapitulatif
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Vérifiez les informations
              </Text>

              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('tontine.name')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {data.name}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('tontine.contribution')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.gold }]}>
                    {data.contribution} {t('common.tnd')}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('tontine.frequency')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {t(`tontine.${data.frequency}`)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('tontine.members')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {data.members}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('tontine.distribution')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {t(`tontine.${data.distribution}`)}
                  </Text>
                </View>
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
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
