import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NOTIFICATION_ICONS: Record<string, string> = {
  payment_confirmed: '✅',
  round_started: '🔄',
  joined_tontine: '👋',
  member_joined: '👥',
  payment_reminder: '⏰',
  invitation: '📨',
  default: '🔔',
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { notifications, unreadCount, loading, refreshNotifications, markAsRead, markAllAsRead } =
    useNotifications();
  const insets = useSafeAreaInsets();
  const rtl = i18n.language === 'ar';

  const handleNotificationPress = async (notification: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.tontineId) {
      router.push(`/tontine/${notification.tontineId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markAllAsRead();
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? t('notifications.just_now') : t('notifications.minutes_ago', { count: minutes });
    }
    if (hours < 24) {
      return t('notifications.hours_ago', { count: hours });
    }
    if (days < 7) {
      return t('notifications.days_ago', { count: days });
    }

    return date.toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric',
    });
  };

  const getNotificationIcon = (type: string) => {
    return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border },
          rtl && { flexDirection: 'row-reverse' },
        ]}
      >
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.backIcon, { color: colors.text }]}>
            {rtl ? '→' : '←'}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('notifications.title')}
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.headerBadge, { backgroundColor: colors.gold }]}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            style={styles.markAllButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.markAllText, { color: colors.gold }]}>
              {t('notifications.mark_all_read')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {loading && notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>🔔</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('notifications.empty')}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {t('notifications.empty_subtext')}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.lg }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshNotifications}
              tintColor={colors.gold}
              colors={[colors.gold]}
            />
          }
        >
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                {
                  backgroundColor: notification.read ? colors.card : colors.card + 'EE',
                  borderColor: notification.read ? colors.border : colors.gold + '60',
                  borderLeftWidth: notification.read ? 1 : 4,
                },
                rtl && { flexDirection: 'row-reverse' },
              ]}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: notification.read
                      ? colors.border + '40'
                      : colors.gold + '20',
                  },
                ]}
              >
                <Text style={styles.icon}>{getNotificationIcon(notification.type)}</Text>
              </View>

              <View style={[styles.notificationContent, rtl && { alignItems: 'flex-end' }]}>
                <View style={[styles.notificationHeader, rtl && { flexDirection: 'row-reverse' }]}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      { color: colors.text },
                      !notification.read && { fontWeight: '700' },
                    ]}
                    numberOfLines={1}
                  >
                    {notification.title}
                  </Text>
                  <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                    {formatDate(notification.createdAt)}
                  </Text>
                </View>

                {notification.body && (
                  <Text
                    style={[
                      styles.notificationBody,
                      { color: colors.textSecondary },
                      rtl && { textAlign: 'right' },
                    ]}
                    numberOfLines={2}
                  >
                    {notification.body}
                  </Text>
                )}

                {!notification.read && (
                  <View style={[styles.unreadDot, { backgroundColor: colors.gold }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.xs,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  headerBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  headerBadgeText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  markAllButton: {
    padding: Spacing.xs,
  },
  markAllText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  notificationTitle: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: FontSizes.xs,
  },
  notificationBody: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
