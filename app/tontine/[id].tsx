import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { GoldButton } from '@/components/GoldButton';
import * as Haptics from 'expo-haptics';
import { Tour, Member } from '@/types';
import { isSuperAdmin } from '@/config/superAdmin';
import { SuperAdminBadge } from '@/components/SuperAdminBadge';

// Mock data
const mockTours: Tour[] = [
  {
    id: '1',
    tontineId: '1',
    tourNumber: 1,
    recipientId: 'user1',
    deadline: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    status: 'completed',
    payments: [],
  },
  {
    id: '2',
    tontineId: '1',
    tourNumber: 2,
    recipientId: 'user2',
    deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: 'completed',
    payments: [],
  },
  {
    id: '3',
    tontineId: '1',
    tourNumber: 3,
    recipientId: 'user3',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'current',
    payments: [],
  },
  {
    id: '4',
    tontineId: '1',
    tourNumber: 4,
    recipientId: 'user4',
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    status: 'upcoming',
    payments: [],
  },
];

const mockMembers: Member[] = [
  {
    id: '1',
    tontineId: '1',
    userId: 'user1',
    user: {
      id: 'user1',
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      phone: '+21620123456',
      avatar: 'AB',
      trustScore: 4.5,
      role: 'admin',
      isVerified: true,
      createdAt: new Date(),
    },
    joinedAt: new Date(),
    role: 'admin',
    paymentStatus: 'paid',
  },
  {
    id: '2',
    tontineId: '1',
    userId: 'user2',
    user: {
      id: 'user2',
      firstName: 'Fatma',
      lastName: 'Khaled',
      phone: '+21620234567',
      avatar: 'FK',
      trustScore: 4.2,
      role: 'member',
      isVerified: true,
      createdAt: new Date(),
    },
    joinedAt: new Date(),
    role: 'member',
    paymentStatus: 'paid',
  },
  {
    id: '3',
    tontineId: '1',
    userId: 'user3',
    user: {
      id: 'user3',
      firstName: 'Mohamed',
      lastName: 'Gharbi',
      phone: '+21620345678',
      avatar: 'MG',
      trustScore: 3.8,
      role: 'member',
      isVerified: true,
      createdAt: new Date(),
    },
    joinedAt: new Date(),
    role: 'member',
    paymentStatus: 'pending',
  },
];

export default function TontineDetailScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'tours' | 'members' | 'history'>('tours');
  const rtl = i18n.language === 'ar';

  const handleTabChange = (tab: 'tours' | 'members' | 'history') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const getDateLocale = () => {
    if (i18n.language === 'ar') return 'ar-TN';
    if (i18n.language === 'en') return 'en-US';
    return 'fr-FR';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, rtl && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backIcon, { color: colors.gold }]}>{rtl ? '\u2192' : '\u2190'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Famille Ben Ali</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Info Card */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.card, borderColor: colors.gold },
        ]}
      >
        <View style={[styles.infoRow, rtl && { flexDirection: 'row-reverse' }]}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {t('tontine.contribution')}
            </Text>
            <Text style={[styles.infoValue, { color: colors.gold }]}>
              200 {t('common.tnd')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {t('tontine.frequency')}
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {t('tontine.monthly')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {t('tontine.members')}
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>6</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, rtl && { flexDirection: 'row-reverse' }]}>
        {(['tours', 'members', 'history'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomColor: colors.gold,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => handleTabChange(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? colors.gold : colors.textSecondary,
                  fontWeight: activeTab === tab ? '700' : '400',
                },
              ]}
            >
              {tab === 'members' ? t('tontine.members_list') : t(`tontine.${tab}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'tours' && (
          <View style={[styles.timeline, rtl && { paddingLeft: 0, paddingRight: Spacing.md }]}>
            {mockTours.map((tour, index) => {
              const recipient = mockMembers.find((m) => m.userId === tour.recipientId)?.user;
              const isLast = index === mockTours.length - 1;

              return (
                <View key={tour.id} style={styles.timelineItem}>
                  {/* Timeline line */}
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor:
                            tour.status === 'completed' ? colors.gold : colors.border,
                        },
                        rtl && { left: undefined, right: 15 },
                      ]}
                    />
                  )}

                  {/* Timeline dot */}
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor:
                          tour.status === 'current'
                            ? colors.gold
                            : tour.status === 'completed'
                            ? colors.gold
                            : colors.background,
                        borderColor:
                          tour.status === 'completed' ? colors.gold : colors.border,
                      },
                      rtl && { left: undefined, right: 0 },
                    ]}
                  >
                    {tour.status === 'current' && (
                      <View
                        style={[styles.pulsingDot, { backgroundColor: colors.gold }]}
                      />
                    )}
                  </View>

                  {/* Tour card */}
                  <View
                    style={[
                      styles.tourCard,
                      {
                        backgroundColor: colors.card,
                        borderColor:
                          tour.status === 'current' ? colors.gold : colors.border,
                        borderWidth: tour.status === 'current' ? 2 : 1,
                      },
                      rtl && { marginLeft: 0, marginRight: 48 },
                    ]}
                  >
                    <View style={[styles.tourHeader, rtl && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.tourNumber, { color: colors.text }]}>
                        {t('tontine.tour_number', { number: tour.tourNumber })}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              tour.status === 'current'
                                ? colors.gold + '20'
                                : tour.status === 'completed'
                                ? colors.success + '20'
                                : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                tour.status === 'current'
                                  ? colors.gold
                                  : tour.status === 'completed'
                                  ? colors.success
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {t(`tontine.${tour.status}`)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tourInfo}>
                      <Text style={[styles.recipientName, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
                        {recipient?.firstName} {recipient?.lastName}
                      </Text>
                      <Text style={[styles.tourDate, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
                        {tour.deadline.toLocaleDateString(getDateLocale(), {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    {tour.status === 'current' && (
                      <GoldButton
                        title={t('payment.declare')}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        }}
                        variant="flouci"
                        style={styles.payButton}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'members' && (
          <View>
            {mockMembers.map((member) => {
              const isMemberSuperAdmin = isSuperAdmin(member.user.phone);
              return (
                <View
                  key={member.id}
                  style={[
                    styles.memberCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isMemberSuperAdmin ? '#FFD700' : colors.border,
                      borderWidth: isMemberSuperAdmin ? 2 : 1,
                    },
                    rtl && { flexDirection: 'row-reverse' },
                  ]}
                >
                  <View
                    style={[
                      styles.memberAvatar,
                      { borderColor: isMemberSuperAdmin ? '#FFD700' : colors.gold },
                      rtl && { marginRight: 0, marginLeft: Spacing.md },
                    ]}
                  >
                    <Text style={styles.memberAvatarText}>
                      {isMemberSuperAdmin ? '\uD83D\uDC51' : member.user.avatar}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <View style={[styles.memberNameRow, rtl && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.memberName, { color: colors.text }]}>
                        {member.user.firstName} {member.user.lastName}
                      </Text>
                      {isMemberSuperAdmin && (
                        <SuperAdminBadge size="small" showLabel={false} />
                      )}
                    </View>
                    <Text style={[styles.memberRole, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
                      {isMemberSuperAdmin
                        ? `\uD83D\uDC51 ${t('profile.master_admin')}`
                        : member.role === 'admin'
                        ? `\uD83D\uDC51 ${t('common.admin')}`
                        : t('common.member')}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.paymentStatusBadge,
                      {
                        backgroundColor:
                          member.paymentStatus === 'paid'
                            ? colors.success + '20'
                            : member.paymentStatus === 'pending'
                            ? colors.warning + '20'
                            : colors.late + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.paymentStatusText,
                        {
                          color:
                            member.paymentStatus === 'paid'
                              ? colors.success
                              : member.paymentStatus === 'pending'
                              ? colors.warning
                              : colors.late,
                        },
                      ]}
                    >
                      {t(`tontine.${member.paymentStatus}`)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('tontine.history_empty')}
            </Text>
          </View>
        )}
      </ScrollView>
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
  infoCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FontSizes.xs,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: FontSizes.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  timeline: {
    paddingLeft: Spacing.md,
  },
  timelineItem: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: '100%',
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tourCard: {
    marginLeft: 48,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tourNumber: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  tourInfo: {
    marginBottom: Spacing.md,
  },
  recipientName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  tourDate: {
    fontSize: FontSizes.sm,
  },
  payButton: {
    marginTop: Spacing.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  memberAvatarText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#0F172A',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  memberName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: FontSizes.sm,
  },
  paymentStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  paymentStatusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
  },
});
