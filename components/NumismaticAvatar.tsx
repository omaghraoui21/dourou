import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NumismaticAvatarProps {
  initials: string;
  size?: number;
  isHighlighted?: boolean;
}

export const NumismaticAvatar: React.FC<NumismaticAvatarProps> = ({
  initials,
  size = 48,
  isHighlighted = false,
}) => {
  const borderWidth = isHighlighted ? 3 : 2;
  const innerSize = size - borderWidth * 2;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor: isHighlighted ? '#FFD700' : '#D4AF37',
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        <Text
          style={[
            styles.initials,
            { fontSize: size * 0.32 },
          ]}
          numberOfLines={1}
        >
          {initials}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  inner: {
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#D4AF37',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
