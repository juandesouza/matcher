import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { user } from '../utils/api';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';

export const EditProfileScreen = () => {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await user.getProfile();
      setBio(profile.bio || '');
      setPhotos(profile.photos || []);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        const formData = new FormData();
        formData.append('photo', {
          uri: asset.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);

        setIsSaving(true);
        try {
          const uploadResult = await user.uploadPhoto(formData);
          if (uploadResult.photoUrl) {
            setPhotos([...photos, uploadResult.photoUrl]);
          }
        } catch (uploadError: any) {
          Alert.alert('Upload failed', uploadError.message || 'Failed to upload photo');
        } finally {
          setIsSaving(false);
        }
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (bio && bio.length > 50) {
      setError('Bio must be 50 characters or less');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      
      await user.setup({
        bio: bio.trim() || '',
        photos: photos.length > 0 ? photos : undefined,
      });
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Save error:', error);
      setError(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const parseSpacing = (value: string) => parseInt(value.replace('px', ''), 10);
  const parseFontSize = (value: string) => parseInt(value.replace('px', ''), 10);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.reactNative,
    },
    content: {
      padding: parseSpacing(spacing.xl),
    },
    title: {
      fontSize: parseFontSize(typography.fontSizes['2xl']),
      fontWeight: typography.fontWeights.bold.toString() as any,
      color: colors.text.reactNative,
      marginBottom: parseSpacing(spacing.xl),
    },
    label: {
      fontSize: parseFontSize(typography.fontSizes.base),
      fontWeight: typography.fontWeights.medium.toString() as any,
      color: colors.text.reactNative,
      marginBottom: parseSpacing(spacing.xs),
    },
    input: {
      backgroundColor: theme === 'dark' ? '#2a2a2a' : colors.card.reactNative,
      borderRadius: parseSpacing(borderRadius.lg),
      padding: parseSpacing(spacing.md),
      fontSize: parseFontSize(typography.fontSizes.base),
      color: colors.text.reactNative,
      marginBottom: parseSpacing(spacing.md),
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#404040' : colors.border.reactNative,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    button: {
      backgroundColor: theme === 'dark' ? '#2a2a2a' : colors.card.reactNative,
      borderRadius: parseSpacing(borderRadius.lg),
      padding: parseSpacing(spacing.md),
      alignItems: 'center',
      marginBottom: parseSpacing(spacing.md),
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#404040' : colors.border.reactNative,
    },
    buttonText: {
      color: colors.text.reactNative,
      fontSize: parseFontSize(typography.fontSizes.base),
      fontWeight: typography.fontWeights.semibold.toString() as any,
    },
    saveButton: {
      backgroundColor: colors.crimsonPulse.reactNative,
      borderRadius: parseSpacing(borderRadius.lg),
      padding: parseSpacing(spacing.md),
      alignItems: 'center',
      marginTop: parseSpacing(spacing.md),
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: parseFontSize(typography.fontSizes.base),
      fontWeight: typography.fontWeights.semibold.toString() as any,
    },
    errorText: {
      color: '#ff4444',
      fontSize: parseFontSize(typography.fontSizes.sm),
      marginBottom: parseSpacing(spacing.md),
    },
    photoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: parseSpacing(spacing.md),
    },
    photoWrapper: {
      position: 'relative',
      marginRight: parseSpacing(spacing.sm),
      marginBottom: parseSpacing(spacing.sm),
    },
    photo: {
      width: 80,
      height: 80,
      borderRadius: parseSpacing(borderRadius.md),
    },
    removeButton: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: '#ff4444',
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={{ color: colors.text.reactNative }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Edit Profile</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <Text style={styles.label}>Bio (optional, max 50 characters)</Text>
        <TextInput
          style={styles.input}
          placeholder="Tell us about yourself..."
          placeholderTextColor={colors.text.reactNative + '80'}
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={50}
        />
        
        <Text style={styles.label}>Photos</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePickImage}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>
            {photos.length > 0 ? `Add Another Photo (${photos.length})` : 'Add Photo'}
          </Text>
        </TouchableOpacity>
        
        {photos.length > 0 && (
          <View style={styles.photoContainer}>
            {photos.map((photoUrl, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image
                  source={{ 
                    uri: photoUrl.startsWith('http') 
                      ? photoUrl 
                      : `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.109:5173'}${photoUrl}` 
                  }}
                  style={styles.photo}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

