/**
 * PaymentProofUpload Component
 *
 * Enforces payment proof requirements (reference_id OR proof_image_url)
 * to reduce "he-said-she-said" disputes in tontine payments.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

interface PaymentProofUploadProps {
  onProofSubmitted: (proofData: { reference_id?: string; proof_image_url?: string }) => void;
  onCancel?: () => void;
  paymentAmount: number;
  currency?: string;
}

export function PaymentProofUpload({
  onProofSubmitted,
  onCancel,
  paymentAmount,
  currency = 'TND',
}: PaymentProofUploadProps) {
  const { colors } = useTheme();
  const [proofType, setProofType] = useState<'reference' | 'image' | null>(null);
  const [referenceId, setReferenceId] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setProofType('image');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera');
        return;
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setProofType('image');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadImageToSupabase = async (uri: string): Promise<string> => {
    try {
      // Generate unique filename
      const filename = `payment-proof-${Date.now()}.jpg`;
      const filepath = `payment-proofs/${filename}`;

      // Fetch image as blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('tontine-assets')
        .upload(filepath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tontine-assets')
        .getPublicUrl(filepath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Validation: require either reference_id or image
    if (proofType === 'reference') {
      if (!referenceId.trim()) {
        Alert.alert('Required', 'Please enter a payment reference ID');
        return;
      }
      onProofSubmitted({ reference_id: referenceId.trim() });
    } else if (proofType === 'image') {
      if (!selectedImage) {
        Alert.alert('Required', 'Please select or take a photo of the payment proof');
        return;
      }

      setIsUploading(true);
      try {
        const imageUrl = await uploadImageToSupabase(selectedImage);
        onProofSubmitted({ proof_image_url: imageUrl });
      } catch (error) {
        Alert.alert('Upload Failed', 'Failed to upload proof image. Please try again.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else {
      Alert.alert(
        'Proof Required',
        'Please provide either a payment reference ID or upload a proof image to reduce disputes.',
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Payment Proof</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Amount: {paymentAmount} {currency}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          To reduce disputes, please provide proof of payment
        </Text>
      </View>

      {/* Proof Type Selection */}
      {!proofType && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: colors.card }]}
            onPress={() => setProofType('reference')}
          >
            <Text style={[styles.optionIcon]}>📝</Text>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Reference ID</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              Enter transaction reference
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: colors.card }]}
            onPress={handlePickImage}
          >
            <Text style={[styles.optionIcon]}>📷</Text>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Upload Photo</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              Take or select a photo
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reference ID Input */}
      {proofType === 'reference' && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Payment Reference ID</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="e.g., D17-TXN123456 or Flouci-987654"
            placeholderTextColor={colors.textSecondary}
            value={referenceId}
            onChangeText={setReferenceId}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => {
              setProofType(null);
              setReferenceId('');
            }}
          >
            <Text style={[styles.changeButtonText, { color: colors.gold }]}>
              Use photo instead
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image Preview */}
      {proofType === 'image' && selectedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={[styles.imageActionButton, { backgroundColor: colors.card }]}
              onPress={handleTakePhoto}
            >
              <Text style={[styles.imageActionText, { color: colors.text }]}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imageActionButton, { backgroundColor: colors.card }]}
              onPress={handlePickImage}
            >
              <Text style={[styles.imageActionText, { color: colors.text }]}>
                Choose Different
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => {
              setProofType(null);
              setSelectedImage(null);
            }}
          >
            <Text style={[styles.changeButtonText, { color: colors.gold }]}>
              Use reference ID instead
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.card }]}
            onPress={onCancel}
            disabled={isUploading}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.gold },
            (!proofType || isUploading) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!proofType || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Proof</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: 12,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSizes.sm,
  },
  optionsContainer: {
    marginBottom: Spacing.lg,
  },
  optionButton: {
    padding: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  optionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: FontSizes.sm,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  input: {
    padding: Spacing.md,
    borderRadius: 8,
    fontSize: FontSizes.md,
    marginBottom: Spacing.sm,
  },
  changeButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  changeButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: Spacing.lg,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  imageActionButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  imageActionText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  submitButton: {
    flex: 2,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  submitButtonText: {
    color: '#000',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
