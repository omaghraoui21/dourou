import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NUM_SPARKLES = 20;

interface LaunchCelebrationProps {
  visible: boolean;
  onComplete: () => void;
  title: string;
  message: string;
}

interface SparkleAnimation {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

export const LaunchCelebration: React.FC<LaunchCelebrationProps> = ({
  visible,
  onComplete,
  title,
  message,
}) => {
  const sparklesRef = useRef<SparkleAnimation[]>(
    Array.from({ length: NUM_SPARKLES }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  );

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.3)).current;
  const emojiScale = useRef(new Animated.Value(0)).current;

  const resetAnimation = useCallback(() => {
    sparklesRef.current.forEach((s) => {
      s.x.setValue(0);
      s.y.setValue(0);
      s.opacity.setValue(0);
      s.scale.setValue(0);
    });
    overlayOpacity.setValue(0);
    textOpacity.setValue(0);
    textScale.setValue(0.3);
    emojiScale.setValue(0);
  }, [overlayOpacity, textOpacity, textScale, emojiScale]);

  const runAnimation = useCallback(() => {
    // Fade in overlay
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animate emoji bounce in
    Animated.sequence([
      Animated.delay(100),
      Animated.spring(emojiScale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate sparkles outward
    const sparkleAnimations = sparklesRef.current.map((sparkle, i) => {
      const angle = (i / NUM_SPARKLES) * Math.PI * 2;
      const distance = 100 + Math.random() * 80;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      const delay = 200 + Math.random() * 400;

      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(sparkle.x, {
            toValue: targetX,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle.y, {
            toValue: targetY,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(sparkle.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.delay(300),
            Animated.timing(sparkle.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(sparkle.scale, {
              toValue: 1 + Math.random() * 0.8,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.scale, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]);
    });

    // Animate text
    const textAnimation = Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.spring(textScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]);

    Animated.parallel([...sparkleAnimations, textAnimation]).start(() => {
      // Auto dismiss
      setTimeout(() => {
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          onComplete();
        });
      }, 1800);
    });
  }, [overlayOpacity, textOpacity, textScale, emojiScale, onComplete]);

  useEffect(() => {
    if (visible) {
      runAnimation();
    } else {
      resetAnimation();
    }
  }, [visible, runAnimation, resetAnimation]);

  if (!visible) return null;

  const sparkleColors = ['#D4AF37', '#FFD700', '#F5E6A3', '#C5A028', '#E8C547'];

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <View style={styles.center}>
        {/* Gold sparkle particles */}
        {sparklesRef.current.map((sparkle, i) => {
          const size = 6 + Math.random() * 10;
          const colorIndex = i % sparkleColors.length;
          const isLarge = i % 4 === 0;

          return (
            <Animated.View
              key={i}
              style={[
                styles.sparkle,
                {
                  width: isLarge ? size + 4 : size,
                  height: isLarge ? size + 4 : size,
                  borderRadius: isLarge ? (size + 4) / 2 : size / 2,
                  backgroundColor: sparkleColors[colorIndex],
                  transform: [
                    { translateX: sparkle.x },
                    { translateY: sparkle.y },
                    { scale: sparkle.scale },
                  ],
                  opacity: sparkle.opacity,
                  shadowColor: sparkleColors[colorIndex],
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                },
              ]}
            />
          );
        })}

        {/* Celebration Emoji */}
        <Animated.Text
          style={[
            styles.emoji,
            {
              transform: [{ scale: emojiScale }],
            },
          ]}
        >
          🎉
        </Animated.Text>

        {/* Title */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: textOpacity,
              transform: [{ scale: textScale }],
            },
          ]}
        >
          {title}
        </Animated.Text>

        {/* Message */}
        <Animated.Text
          style={[
            styles.message,
            {
              opacity: textOpacity,
              transform: [{ scale: textScale }],
            },
          ]}
        >
          {message}
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.4,
  },
  sparkle: {
    position: 'absolute',
    elevation: 6,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
