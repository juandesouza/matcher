import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { user } from '../utils/api';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';

export const SetupScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Create FormData for upload
        const formData = new FormData();
        formData.append('photo', {
          uri: asset.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);

        // Upload photo
        setIsLoading(true);
        try {
          const uploadResult = await user.uploadPhoto(formData);
          if (uploadResult.photoUrl) {
            setPhotos([...photos, uploadResult.photoUrl]);
          }
        } catch (uploadError: any) {
          Alert.alert('Upload failed', uploadError.message || 'Failed to upload photo');
        } finally {
          setIsLoading(false);
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

  const handleComplete = async () => {
    // Validation
    if (!age.trim()) {
      setError('Age is required');
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      setError('Age must be between 18 and 99');
      return;
    }
    if (!gender) {
      setError('Gender is required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Convert gender to lowercase for API
      const genderLower = gender.toLowerCase() as 'male' | 'female';
      
      await user.setup({
        age: ageNum,
        gender: genderLower,
        bio: bio.trim() || '',
        photos: photos.length > 0 ? photos : undefined,
      });
      
      // Navigate to main app
      navigation.navigate('Main' as never);
    } catch (error: any) {
      console.error('Setup error:', error);
      setError(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.reactNative,
      padding: parseInt(spacing.xl),
    },
    title: {
      fontSize: parseInt(typography.fontSizes['2xl']),
      fontWeight: typography.fontWeights.bold,
      color: colors.text.reactNative,
      marginBottom: parseInt(spacing.xl),
    },
    input: {
      backgroundColor: colors.card.reactNative,
      borderRadius: parseInt(borderRadius.lg),
      padding: parseInt(spacing.md),
      fontSize: parseInt(typography.fontSizes.base),
      color: colors.text.reactNative,
      marginBottom: parseInt(spacing.md),
      borderWidth: 1,
      borderColor: colors.border.reactNative,
    },
    button: {
      backgroundColor: colors.crimsonPulse.reactNative,
      borderRadius: parseInt(borderRadius.lg),
      padding: parseInt(spacing.md),
      alignItems: 'center',
      marginTop: parseInt(spacing.md),
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: parseInt(typography.fontSizes.base),
      fontWeight: typography.fontWeights.semibold,
    },
    label: {
      fontSize: parseInt(typography.fontSizes.base),
      fontWeight: typography.fontWeights.medium,
      color: colors.text.reactNative,
      marginBottom: parseInt(spacing.xs),
    },
    radioButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: parseInt(spacing.md),
      borderRadius: parseInt(borderRadius.lg),
      borderWidth: 2,
      backgroundColor: colors.card.reactNative,
    },
    radioButtonSelected: {
      borderColor: colors.crimsonPulse.reactNative,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border.reactNative,
      marginRight: parseInt(spacing.sm),
    },
    radioLabel: {
      fontSize: parseInt(typography.fontSizes.base),
      fontWeight: typography.fontWeights.medium,
    },
    errorText: {
      fontSize: parseInt(typography.fontSizes.sm),
      marginBottom: parseInt(spacing.md),
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Age"
        placeholderTextColor={colors.text.reactNative + '80'}
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      
      <Text style={[styles.label, { marginBottom: parseInt(spacing.sm) }]}>Gender</Text>
      <View style={{ flexDirection: 'row', gap: parseInt(spacing.md), marginBottom: parseInt(spacing.md) }}>
        <TouchableOpacity
          style={[
            styles.radioButton,
            gender === 'Male' && styles.radioButtonSelected,
            { borderColor: colors.border.reactNative }
          ]}
          onPress={() => setGender('Male')}
        >
          <View style={[
            styles.radioCircle,
            gender === 'Male' && { backgroundColor: colors.crimsonPulse.reactNative }
          ]} />
          <Text style={[styles.radioLabel, { color: colors.text.reactNative }]}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.radioButton,
            gender === 'Female' && styles.radioButtonSelected,
            { borderColor: colors.border.reactNative }
          ]}
          onPress={() => setGender('Female')}
        >
          <View style={[
            styles.radioCircle,
            gender === 'Female' && { backgroundColor: colors.crimsonPulse.reactNative }
          ]} />
          <Text style={[styles.radioLabel, { color: colors.text.reactNative }]}>Female</Text>
        </TouchableOpacity>
      </View>
      
      {error ? <Text style={[styles.errorText, { color: '#ff4444', marginBottom: parseInt(spacing.md) }]}>{error}</Text> : null}
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        placeholder="Bio (optional)"
        placeholderTextColor={colors.text.reactNative + '80'}
        value={bio}
        onChangeText={setBio}
        multiline
      />
      
      {/* Photo upload button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.card.reactNative, borderWidth: 1, borderColor: colors.border.reactNative }]}
        onPress={handlePickImage}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, { color: colors.text.reactNative }]}>
          {photos.length > 0 ? `Add Another Photo (${photos.length})` : 'Add Photo'}
        </Text>
      </TouchableOpacity>
      
      {/* Display uploaded photos */}
      {photos.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: parseInt(spacing.md) }}>
          {photos.map((photoUrl, index) => (
            <View key={index} style={{ position: 'relative', marginRight: parseInt(spacing.sm), marginBottom: parseInt(spacing.sm) }}>
              <Image
                source={{ uri: photoUrl.startsWith('http') ? photoUrl : `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.109:5173'}${photoUrl}` }}
                style={{ width: 80, height: 80, borderRadius: parseInt(borderRadius.md) }}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: '#ff4444',
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => handleRemovePhoto(index)}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleComplete}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Complete Setup'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
