import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();
  const insets = useSafeAreaInsets();

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/notifications');
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom || 8,
          height: (insets.bottom || 0) + 64,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard.title'),
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} focused={focused} />,
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleNotificationPress}
              style={styles.notificationButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 24, color: colors.text }}>🔔</Text>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.gold }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="tontines"
        options={{
          title: t('tontines.title'),
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="list" color={color} focused={focused} />,
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleNotificationPress}
              style={styles.notificationButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 24, color: colors.text }}>🔔</Text>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.gold }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="person" color={color} focused={focused} />,
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleNotificationPress}
              style={styles.notificationButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 24, color: colors.text }}>🔔</Text>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.gold }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}

function TabBarIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [focused, scaleAnim]);

  const icons: Record<string, string> = {
    home: '\uD83C\uDFE0',
    list: '\uD83D\uDCCB',
    person: '\uD83D\uDC64',
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Text style={{ fontSize: 24, color }}>{icons[name]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '700',
  },
});
