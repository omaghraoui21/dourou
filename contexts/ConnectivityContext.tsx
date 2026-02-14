import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Spacing, FontSizes } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface ConnectivityContextType {
  isConnected: boolean;
  isReconnecting: boolean;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  isConnected: true,
  isReconnecting: false,
});

export const useConnectivity = () => useContext(ConnectivityContext);

interface ConnectivityProviderProps {
  children: ReactNode;
}

/**
 * Connectivity Provider
 *
 * Monitors network connectivity and provides global state
 * Shows a banner when offline/reconnecting
 *
 * Note: For React Native, we'd need @react-native-community/netinfo
 * For web, we use navigator.onLine
 */
export const ConnectivityProvider: React.FC<ConnectivityProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [bannerOpacity] = useState(new Animated.Value(0));
  const { t } = useTranslation();

  useEffect(() => {
    // For web platform, use navigator.onLine
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        setIsReconnecting(true);
        setTimeout(() => {
          setIsConnected(true);
          setIsReconnecting(false);
        }, 1000);
      };

      const handleOffline = () => {
        setIsConnected(false);
        setIsReconnecting(false);
      };

      // Initial check
      setIsConnected(navigator.onLine);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // For native platforms, we'd use @react-native-community/netinfo
    // Since it's not installed, we'll assume always connected on native for now
    // In production, you should add: npm install @react-native-community/netinfo
    // and implement native connectivity detection

    return () => {
      // Cleanup
    };
  }, []);

  // Animate banner in/out
  useEffect(() => {
    if (!isConnected || isReconnecting) {
      Animated.timing(bannerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(bannerOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, isReconnecting, bannerOpacity]);

  const getBannerStyle = () => {
    if (isReconnecting) {
      return { backgroundColor: '#F59E0B' };
    }
    if (!isConnected) {
      return { backgroundColor: '#EF4444' };
    }
    return { backgroundColor: '#10B981' };
  };

  const getBannerText = () => {
    if (isReconnecting) {
      return t('connectivity.trying_reconnect');
    }
    if (!isConnected) {
      return t('connectivity.offline');
    }
    return t('connectivity.reconnected');
  };

  return (
    <ConnectivityContext.Provider value={{ isConnected, isReconnecting }}>
      {children}

      {/* Connectivity Banner */}
      {(!isConnected || isReconnecting) && (
        <Animated.View
          style={[
            styles.banner,
            getBannerStyle(),
            {
              opacity: bannerOpacity,
              transform: [
                {
                  translateY: bannerOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.bannerText}>
            {isReconnecting ? '🔄' : '⚠️'} {getBannerText()}
          </Text>
        </Animated.View>
      )}
    </ConnectivityContext.Provider>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 999,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});
