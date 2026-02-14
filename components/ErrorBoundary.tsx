import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { GoldButton } from './GoldButton';
import { router } from 'expo-router';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Global Error Boundary Component
 *
 * Catches React errors during rendering, in lifecycle methods, and in constructors
 * to prevent the entire app from crashing. Provides a user-friendly error UI with
 * recovery options.
 *
 * Usage:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (in production, you might send to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    this.resetError();
    router.replace('/(tabs)');
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.resetError);
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>

            <Text style={styles.title}>Something went wrong</Text>

            <Text style={styles.message}>
              We encountered an unexpected error. Don&apos;t worry, your data is safe.
            </Text>

            {__DEV__ && error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                <Text style={styles.errorText}>{error.toString()}</Text>
                {errorInfo && (
                  <Text style={styles.errorStack}>{errorInfo.componentStack}</Text>
                )}
              </ScrollView>
            )}

            <View style={styles.actions}>
              <GoldButton
                title="Go to Home"
                onPress={this.handleGoHome}
                style={{ marginBottom: Spacing.md }}
              />
              <TouchableOpacity
                style={styles.retryButton}
                onPress={this.resetError}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSizes.md,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  errorDetails: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: '#EF4444',
    fontFamily: 'monospace',
    marginBottom: Spacing.sm,
  },
  errorStack: {
    fontSize: FontSizes.xs,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
  },
  retryButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
  },
  retryText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
