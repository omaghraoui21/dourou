import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';

interface CachedImageProps {
  uri: string;
  width: number;
  height: number;
  borderRadius?: number;
  style?: any;
  placeholder?: string;
}

export const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  width,
  height,
  borderRadius = 0,
  style,
  placeholder,
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Image
        source={{ uri }}
        style={[styles.image, { borderRadius }]}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
        priority="high"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        placeholder={placeholder ? { uri: placeholder } : undefined}
      />

      {isLoading && !hasError && (
        <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="small" color={colors.gold} />
        </View>
      )}

      {hasError && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: colors.card, borderRadius },
          ]}
        >
          <View
            style={[
              styles.errorPlaceholder,
              { backgroundColor: colors.gold + '20' },
            ]}
          >
            <Text style={[styles.errorIcon, { color: colors.gold }]}>👤</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
  },
});
