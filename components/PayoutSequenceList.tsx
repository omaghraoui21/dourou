import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { TontineMember } from '@/types';
import { NumismaticAvatar } from './NumismaticAvatar';
import * as Haptics from 'expo-haptics';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PayoutSequenceListProps {
  members: TontineMember[];
  frequency: 'weekly' | 'monthly';
  startDate: Date;
  isLocked: boolean;
  onReorder: (members: TontineMember[]) => void;
}

export const PayoutSequenceList: React.FC<PayoutSequenceListProps> = ({
  members,
  frequency,
  startDate,
  isLocked,
  onReorder,
}) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const rtl = i18n.language === 'ar';

  const getPayoutDate = (order: number): Date => {
    const date = new Date(startDate);
    if (frequency === 'weekly') {
      date.setDate(date.getDate() + (order - 1) * 7);
    } else {
      date.setMonth(date.getMonth() + (order - 1));
    }
    return date;
  };

  const getDateLocale = () => {
    if (i18n.language === 'ar') return 'ar-TN';
    if (i18n.language === 'en') return 'en-US';
    return 'fr-FR';
  };

  const animateLayout = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    animateLayout();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMembers = [...sorted];
    const temp = newMembers[index];
    newMembers[index] = newMembers[index - 1];
    newMembers[index - 1] = temp;
    newMembers.forEach((m, i) => {
      m.payoutOrder = i + 1;
    });
    onReorder(newMembers);
  };

  const moveDown = (index: number) => {
    if (index === sorted.length - 1) return;
    animateLayout();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMembers = [...sorted];
    const temp = newMembers[index];
    newMembers[index] = newMembers[index + 1];
    newMembers[index + 1] = temp;
    newMembers.forEach((m, i) => {
      m.payoutOrder = i + 1;
    });
    onReorder(newMembers);
  };

  const shuffle = async () => {
    animateLayout();
    // Distinct haptic pattern for shuffle
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
    setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 350);

    const shuffled = [...members];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    shuffled.forEach((m, i) => {
      m.payoutOrder = i + 1;
    });
    onReorder(shuffled);
  };

  const sorted = [...members].sort((a, b) => a.payoutOrder - b.payoutOrder);

  if (members.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyEmoji]}>📋</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('tontine.set_sequence_hint')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Magic Shuffle Button */}
      {!isLocked && members.length > 1 && (
        <TouchableOpacity
          style={[
            styles.shuffleButton,
            {
              backgroundColor: colors.gold + '12',
              borderColor: colors.gold,
            },
          ]}
          onPress={shuffle}
          activeOpacity={0.7}
        >
          <Text style={styles.shuffleIcon}>✨</Text>
          <Text style={[styles.shuffleText, { color: colors.gold }]}>
            {t('tontine.magic_shuffle')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Sequence List */}
      {sorted.map((member, index) => {
        const payoutDate = getPayoutDate(index + 1);
        const isFirst = index === 0;
        const isLast = index === sorted.length - 1;

        return (
          <View
            key={member.id}
            style={[
              styles.sequenceCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.gold + '30',
              },
            ]}
          >
            <View style={[styles.cardContent, rtl && { flexDirection: 'row-reverse' }]}>
              {/* Order Number Badge */}
              <View style={[styles.orderBadge, { backgroundColor: colors.gold }]}>
                <Text style={styles.orderNumber}>{index + 1}</Text>
              </View>

              {/* Avatar */}
              <View style={[styles.avatarWrap, rtl && { marginLeft: Spacing.md, marginRight: 0 }]}>
                <NumismaticAvatar initials={member.initials} size={42} />
              </View>

              {/* Member Info */}
              <View style={[styles.memberTextContainer, rtl && { alignItems: 'flex-end' }]}>
                <Text
                  style={[styles.memberName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {member.name}
                </Text>
                <Text style={[styles.payoutDate, { color: colors.textSecondary }]}>
                  {t('tontine.payout_date', {
                    date: payoutDate.toLocaleDateString(getDateLocale(), {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }),
                  })}
                </Text>
              </View>

              {/* Reorder Buttons */}
              {!isLocked && (
                <View style={[styles.reorderButtons, rtl && { flexDirection: 'column' }]}>
                  <TouchableOpacity
                    style={[
                      styles.arrowButton,
                      {
                        backgroundColor: isFirst ? colors.border + '40' : colors.gold + '20',
                        borderColor: isFirst ? colors.border + '60' : colors.gold + '40',
                      },
                    ]}
                    onPress={() => moveUp(index)}
                    disabled={isFirst}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.arrowText,
                        { color: isFirst ? colors.textSecondary + '60' : colors.gold },
                      ]}
                    >
                      ▲
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.dragHandle}>
                    <Text style={[styles.handleText, { color: colors.textSecondary + '80' }]}>
                      ⋮⋮
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.arrowButton,
                      {
                        backgroundColor: isLast ? colors.border + '40' : colors.gold + '20',
                        borderColor: isLast ? colors.border + '60' : colors.gold + '40',
                      },
                    ]}
                    onPress={() => moveDown(index)}
                    disabled={isLast}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.arrowText,
                        { color: isLast ? colors.textSecondary + '60' : colors.gold },
                      ]}
                    >
                      ▼
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Locked indicator */}
              {isLocked && (
                <View style={styles.lockedIcon}>
                  <Text style={{ fontSize: 16 }}>🔒</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {/* Locked notice */}
      {isLocked && (
        <View style={[styles.lockedNotice, { backgroundColor: colors.gold + '10', borderColor: colors.gold + '30' }]}>
          <Text style={[styles.lockedText, { color: colors.gold }]}>
            🔒 {t('tontine.sequence_locked')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  shuffleIcon: {
    fontSize: 20,
  },
  shuffleText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  sequenceCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  orderNumber: {
    color: '#0F172A',
    fontSize: FontSizes.sm,
    fontWeight: '800',
  },
  avatarWrap: {
    marginRight: Spacing.md,
  },
  memberTextContainer: {
    flex: 1,
  },
  memberName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  payoutDate: {
    fontSize: FontSizes.xs,
  },
  reorderButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    marginLeft: Spacing.sm,
  },
  arrowButton: {
    width: 28,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dragHandle: {
    paddingVertical: 1,
  },
  handleText: {
    fontSize: 12,
    letterSpacing: 2,
  },
  lockedIcon: {
    marginLeft: Spacing.sm,
  },
  lockedNotice: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  lockedText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
