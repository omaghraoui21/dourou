import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { GoldButton } from '@/components/GoldButton';
import { NumismaticAvatar } from '@/components/NumismaticAvatar';
import { AddMemberModal } from '@/components/AddMemberModal';
import { PayoutSequenceList } from '@/components/PayoutSequenceList';
import { LaunchCelebration } from '@/components/LaunchCelebration';
import { InvitationModal } from '@/components/InvitationModal';
import { RoundCard } from '@/components/RoundCard';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import { useTontines } from '@/contexts/TontineContext';
import { useUser } from '@/contexts/UserContext';
import { generateToursFromTontine, TontineMember } from '@/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TontineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const {
    getTontineById,
    addMemberToTontine,
    removeMemberFromTontine,
    reorderMembers,
    launchTontine,
  } = useTontines();
  const rtl = i18n.language === 'ar';

  const tontine = getTontineById(id || '');

  const [activeTab, setActiveTab] = useState<string>('members');
  const { user } = useUser();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [rounds, setRounds] = useState<any[]>([]);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }, []);

  const getDateLocale = () => {
    if (i18n.language === 'ar') return 'ar-TN';
    if (i18n.language === 'en') return 'en-US';
    return 'fr-FR';
  };

  // Error state
  if (!tontine) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, rtl && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={[styles.backIcon, { color: colors.gold }]}>
              {rtl ? '\u2192' : '\u2190'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{t('tontine.not_found')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorState}>
          <Text style={{ fontSize: 64, marginBottom: Spacing.md }}>🔍</Text>
          <Text style={[styles.errorTitle, { color: colors.text }]}>{t('tontine.not_found')}</Text>
          <Text style={[styles.errorDescription, { color: colors.textSecondary }]}>
            {t('tontine.not_found_description')}
          </Text>
          <GoldButton title={t('common.back')} onPress={handleBack} variant="secondary" style={{ marginTop: Spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  const isDraft = tontine.status === 'draft';
  const isActive = tontine.status === 'active';
  const isCompleted = tontine.status === 'completed';
  const isFull = tontine.members.length >= tontine.totalMembers;
  const canLaunch = isDraft && isFull;
  const membersNeeded = tontine.totalMembers - tontine.members.length;

  // Tabs based on status
  const tabs: string[] = isDraft
    ? ['members', 'sequence']
    : isActive
    ? ['tours', 'members', 'history']
    : ['members', 'history'];

  const getTabLabel = (tab: string) => {
    if (tab === 'members') return t('tontine.members_list');
    if (tab === 'sequence') return t('tontine.sequence');
    if (tab === 'tours') return t('tontine.tours');
    return t('tontine.history');
  };

  // Status badge colors
  const getStatusStyle = () => {
    if (isDraft) return { bg: colors.gold + '20', text: colors.gold };
    if (isActive) return { bg: colors.success + '20', text: colors.success };
    return { bg: colors.textSecondary + '20', text: colors.textSecondary };
  };

  const statusStyle = getStatusStyle();

  // Generate tours for active tontines
  const tours = isActive || isCompleted ? generateToursFromTontine(tontine) : [];

  // Fetch rounds from database
  const fetchRounds = useCallback(async () => {
    if (!tontine || !isActive) return;

    try {
      setLoadingRounds(true);
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          beneficiary:tontine_members!beneficiary_id (
            id,
            name,
            phone
          ),
          payments (
            id,
            status,
            member_id,
            amount
          )
        `)
        .eq('tontine_id', tontine.id)
        .order('round_number', { ascending: true });

      if (error) throw error;

      // Transform data to match RoundCard interface
      const transformedRounds = data.map((round: any) => {
        const memberName = round.beneficiary?.name || 'Unknown';
        const initials = memberName
          .trim()
          .split(/\s+/)
          .map((word: string) => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return {
          id: round.id,
          round_number: round.round_number,
          status: round.status,
          scheduled_date: new Date(round.scheduled_date),
          beneficiary: {
            id: round.beneficiary?.id || '',
            name: memberName,
            initials,
          },
          payments: round.payments || [],
          total_amount: tontine.contribution * tontine.totalMembers,
        };
      });

      setRounds(transformedRounds);
    } catch (error) {
      console.error('Error fetching rounds:', error);
    } finally {
      setLoadingRounds(false);
      setRefreshing(false);
    }
  }, [tontine, isActive]);

  useEffect(() => {
    if (isActive) {
      fetchRounds();

      // Set up real-time subscription for rounds and payments
      const roundsChannel = supabase
        .channel(`tontine_rounds_${tontine?.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rounds',
            filter: `tontine_id=eq.${tontine?.id}`,
          },
          () => {
            fetchRounds();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
          },
          () => {
            fetchRounds();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(roundsChannel);
      };
    }
  }, [isActive, tontine?.id, fetchRounds]);

  // Handlers
  const handleAddMember = async (name: string, phone: string) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await addMemberToTontine(tontine.id, name, phone);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAddMember(false);
    } catch (error) {
      console.error('Error adding member:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      t('tontine.remove_confirm_title'),
      t('tontine.remove_confirm_message', { name: memberName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('tontine.remove_member'),
          style: 'destructive',
          onPress: async () => {
            try {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              await removeMemberFromTontine(tontine.id, memberId);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (error) {
              console.error('Error removing member:', error);
            }
          },
        },
      ]
    );
  };

  const handleReorder = async (reorderedMembers: TontineMember[]) => {
    try {
      await reorderMembers(tontine.id, reorderedMembers);
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const handleLaunch = () => {
    if (!canLaunch) return;

    Alert.alert(
      t('tontine.launch_confirm_title'),
      t('tontine.launch_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.launch'),
          onPress: async () => {
            setIsLaunching(true);
            try {
              // Distinct celebratory haptic pattern
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await new Promise((r) => setTimeout(r, 80));
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await new Promise((r) => setTimeout(r, 80));
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await new Promise((r) => setTimeout(r, 120));
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

              await launchTontine(tontine.id);
              setShowCelebration(true);
              setActiveTab('tours');
            } catch (error) {
              console.error('Error launching tontine:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(t('common.error'), String(error));
            } finally {
              setIsLaunching(false);
            }
          },
        },
      ]
    );
  };

  const sortedMembers = [...tontine.members].sort((a, b) => a.payoutOrder - b.payoutOrder);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, rtl && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backIcon, { color: colors.gold }]}>
            {rtl ? '\u2192' : '\u2190'}
          </Text>
        </TouchableOpacity>
        <View style={[styles.titleRow, rtl && { flexDirection: 'row-reverse' }]}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {tontine.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {t(`tontine.status_${tontine.status}`)}
            </Text>
          </View>
        </View>
        {isDraft && user?.id === tontine.creatorId ? (
          <TouchableOpacity
            style={[styles.inviteButton, { borderColor: colors.gold }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowInvitation(true);
            }}
          >
            <Text style={[styles.inviteButtonText, { color: colors.gold }]}>
              {t('tontine.invite')}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
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
              {tontine.contribution} {t('common.tnd')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {t('tontine.frequency')}
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {t(`tontine.${tontine.frequency}`)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {t('tontine.members_list')}
            </Text>
            <Text style={[styles.infoValue, { color: isDraft && !isFull ? colors.warning : colors.text }]}>
              {t('tontine.members_needed', {
                current: tontine.members.length,
                total: tontine.totalMembers,
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Members Needed Banner (Draft only) */}
      {isDraft && !isFull && (
        <View style={[styles.neededBanner, { backgroundColor: colors.gold + '10', borderColor: colors.gold + '30' }]}>
          <View style={[styles.neededRow, rtl && { flexDirection: 'row-reverse' }]}>
            <Text style={{ fontSize: 18 }}>👥</Text>
            <View style={[styles.neededTextCol, rtl && { alignItems: 'flex-end' }]}>
              <Text style={[styles.neededLabel, { color: colors.gold }]}>
                {t('tontine.members_needed_label')}
              </Text>
              <Text style={[styles.neededCount, { color: colors.textSecondary }]}>
                {membersNeeded} {t('common.member').toLowerCase()}{membersNeeded > 1 ? 's' : ''} {t('tontine.pending').toLowerCase()}
              </Text>
            </View>
          </View>
          {/* Progress bar */}
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: colors.gold,
                  width: `${(tontine.members.length / tontine.totalMembers) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Ready to launch banner */}
      {isDraft && isFull && (
        <View style={[styles.neededBanner, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
          <View style={[styles.neededRow, rtl && { flexDirection: 'row-reverse' }]}>
            <Text style={{ fontSize: 18 }}>🚀</Text>
            <Text style={[styles.readyText, { color: colors.success }]}>
              {t('tontine.ready_to_launch')}
            </Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={[styles.tabs, rtl && { flexDirection: 'row-reverse' }]}>
        {tabs.map((tab) => (
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
              {getTabLabel(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          activeTab === 'tours' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchRounds();
              }}
              tintColor={colors.gold}
            />
          ) : undefined
        }
      >
        {/* ===== MEMBERS TAB ===== */}
        {activeTab === 'members' && (
          <View>
            {/* Add Member Button (Draft only, not full) */}
            {isDraft && !isFull && (
              <TouchableOpacity
                style={[
                  styles.addMemberButton,
                  { borderColor: colors.gold, backgroundColor: colors.gold + '08' },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAddMember(true);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.addMemberContent, rtl && { flexDirection: 'row-reverse' }]}>
                  <View style={[styles.addIconCircle, { backgroundColor: colors.gold }]}>
                    <Text style={styles.addIconText}>+</Text>
                  </View>
                  <Text style={[styles.addMemberText, { color: colors.gold }]}>
                    {t('tontine.add_member')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Empty state */}
            {tontine.members.length === 0 && (
              <View style={styles.emptyMembers}>
                <Text style={{ fontSize: 56, marginBottom: Spacing.md }}>👥</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t('tontine.no_members')}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  {t('tontine.add_first_member')}
                </Text>
              </View>
            )}

            {/* Member list — Numismatic design */}
            {sortedMembers.map((member) => (
              <View
                key={member.id}
                style={[
                  styles.memberCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.gold + '30',
                  },
                ]}
              >
                <View style={[styles.memberRow, rtl && { flexDirection: 'row-reverse' }]}>
                  <NumismaticAvatar initials={member.initials} size={50} />
                  <View
                    style={[
                      styles.memberInfo,
                      { marginLeft: rtl ? 0 : Spacing.md, marginRight: rtl ? Spacing.md : 0 },
                      rtl && { alignItems: 'flex-end' },
                    ]}
                  >
                    <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
                      {member.name}
                    </Text>
                    <Text style={[styles.memberPhone, { color: colors.textSecondary }]}>
                      {member.phone}
                    </Text>
                    {(isActive || isCompleted) && (
                      <View style={[styles.orderTag, { backgroundColor: colors.gold + '20' }]}>
                        <Text style={[styles.orderTagText, { color: colors.gold }]}>
                          #{member.payoutOrder}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Remove button (draft only) */}
                  {isDraft && (
                    <TouchableOpacity
                      style={[styles.removeButton, { borderColor: colors.error + '40' }]}
                      onPress={() => handleRemoveMember(member.id, member.name)}
                      activeOpacity={0.6}
                    >
                      <Text style={[styles.removeText, { color: colors.error }]}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {/* Locked notice for active tontines */}
            {(isActive || isCompleted) && tontine.members.length > 0 && (
              <View style={[styles.lockedNotice, { backgroundColor: colors.gold + '08', borderColor: colors.gold + '20' }]}>
                <Text style={[styles.lockedText, { color: colors.gold }]}>
                  🔒 {t('tontine.members_locked')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ===== SEQUENCE TAB ===== */}
        {activeTab === 'sequence' && (
          <PayoutSequenceList
            members={tontine.members}
            frequency={tontine.frequency}
            startDate={tontine.createdAt}
            isLocked={!isDraft}
            onReorder={handleReorder}
          />
        )}

        {/* ===== TOURS TAB ===== */}
        {activeTab === 'tours' && (
          <View>
            {loadingRounds && rounds.length === 0 ? (
              <View style={styles.loadingState}>
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  {t('common.loading')}...
                </Text>
              </View>
            ) : rounds.length > 0 ? (
              rounds.map((round) => (
                <RoundCard
                  key={round.id}
                  round={round}
                  totalMembers={tontine.totalMembers}
                  onPress={() => {
                    router.push(`/tontine/round/${round.id}`);
                  }}
                  rtl={rtl}
                />
              ))
            ) : (
              <View style={styles.emptyMembers}>
                <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>📋</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  {t('tontine.no_rounds')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === 'history' && (
          <View style={styles.emptyMembers}>
            <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>📜</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t('tontine.history_empty')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Launch Button (Draft, bottom) */}
      {isDraft && (
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <GoldButton
            title={canLaunch ? `🚀  ${t('tontine.launch_tontine')}` : `${t('tontine.launch_tontine')} (${tontine.members.length}/${tontine.totalMembers})`}
            onPress={handleLaunch}
            disabled={!canLaunch}
            loading={isLaunching}
          />
        </View>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        visible={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdd={handleAddMember}
        existingPhones={tontine.members.map((m) => m.phone)}
        isFull={isFull}
      />

      {/* Launch Celebration */}
      <LaunchCelebration
        visible={showCelebration}
        onComplete={() => setShowCelebration(false)}
        title={t('tontine.launched_title')}
        message={t('tontine.launched_message')}
      />

      {/* Invitation Modal */}
      <InvitationModal
        visible={showInvitation}
        onClose={() => setShowInvitation(false)}
        tontineId={tontine.id}
        tontineName={tontine.name}
      />
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
    paddingBottom: Spacing.sm,
  },
  backButton: {
    padding: Spacing.sm,
  },
  inviteButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  inviteButtonText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '300',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
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
  neededBanner: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  neededRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  neededTextCol: {
    flex: 1,
  },
  neededLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  neededCount: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  readyText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
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
  // Members
  addMemberButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  addMemberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconText: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '600',
    marginTop: -1,
  },
  addMemberText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  emptyMembers: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  memberCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: FontSizes.sm,
    marginBottom: 4,
  },
  orderTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  orderTagText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
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
  // Tours timeline
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
  tourStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  tourStatusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  tourInfo: {
    marginBottom: Spacing.md,
  },
  tourRecipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  recipientName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  tourDate: {
    fontSize: FontSizes.sm,
  },
  payButton: {
    marginTop: Spacing.sm,
  },
  loadingState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.md,
  },
  // Footer
  footer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  // Error state
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  errorDescription: {
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
});
