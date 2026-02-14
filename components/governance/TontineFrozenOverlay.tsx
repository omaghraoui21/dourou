import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface TontineFrozenOverlayProps {
  visible: boolean;
  reason?: string;
  governanceFlag?: 'under_review' | 'disputed' | 'none';
  governanceNotes?: string;
  frozenAt?: string;
  onClose: () => void;
}

export default function TontineFrozenOverlay({
  visible,
  reason,
  governanceFlag = 'none',
  governanceNotes,
  frozenAt,
  onClose,
}: TontineFrozenOverlayProps) {
  const date = frozenAt ? new Date(frozenAt).toLocaleDateString() : 'Unknown';

  const getStatusInfo = () => {
    switch (governanceFlag) {
      case 'under_review':
        return {
          title: 'Under Review',
          description: 'This tontine is currently being reviewed by our team.',
          color: '#F59E0B',
        };
      case 'disputed':
        return {
          title: 'Disputed',
          description: 'This tontine is currently under dispute resolution.',
          color: '#EF4444',
        };
      default:
        return {
          title: 'Frozen',
          description: 'This tontine has been temporarily frozen.',
          color: '#3B82F6',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${statusInfo.color}20` },
            ]}
          >
            <Text style={styles.iconText}>❄️</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Tontine {statusInfo.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{statusInfo.description}</Text>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoLabel}>Frozen Date</Text>
            </View>
            <Text style={styles.infoValue}>{date}</Text>

            {reason && (
              <>
                <View style={[styles.infoRow, styles.infoRowMargin]}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <Text style={styles.infoLabel}>Reason</Text>
                </View>
                <Text style={styles.infoValue}>{reason}</Text>
              </>
            )}

            {governanceNotes && (
              <>
                <View style={[styles.infoRow, styles.infoRowMargin]}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <Text style={styles.infoLabel}>Notes</Text>
                </View>
                <Text style={styles.infoValue}>{governanceNotes}</Text>
              </>
            )}
          </View>

          {/* Restrictions Notice */}
          <View style={styles.restrictionsBox}>
            <Text style={styles.restrictionsTitle}>Restrictions</Text>
            <Text style={styles.restrictionsText}>
              • You can view all tontine information{'\n'}
              • You cannot make or confirm payments{'\n'}
              • You cannot add or remove members{'\n'}
              • Round progression is paused
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Text style={styles.actionButtonText}>I Understand</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>
            For questions, contact support at support@dourou.app
          </Text>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconText: {
    fontSize: 48,
  },
  infoIcon: {
    fontSize: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoRowMargin: {
    marginTop: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  restrictionsBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  restrictionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  restrictionsText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  actionButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
