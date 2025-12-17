import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Image, Modal, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useRoute } from '@react-navigation/native';
import { chat, settings } from '../utils/api';
import { Message } from '../types';
import { Send, Image as ImageIcon } from 'lucide-react-native';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { AdBanner } from '../components/AdBanner';
import { Linking } from 'react-native';
import { subscription } from '../utils/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.109:5173';

export const ChatScreen = () => {
  const { colors, theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const chatId = (route.params as any)?.chatId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [otherUserName, setOtherUserName] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (chatId) {
      loadChatInfo();
      loadMessages();
      checkSubscription();
    }
  }, [chatId]);

  useEffect(() => {
    // Show ad every 10 messages if not subscribed
    if (!isSubscribed && messages.length > 0 && messages.length % 10 === 0) {
      setShowAd(true);
    }
  }, [messages.length, isSubscribed]);


  const checkSubscription = async () => {
    try {
      const data = await settings.get();
      setIsSubscribed(data.isSubscribed || false);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const result = await subscription.createCheckout();
      if (result.sessionId) {
        // Open Stripe checkout in browser
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${result.sessionId}`;
        Linking.openURL(checkoutUrl).catch(err => {
          console.error('Failed to open checkout:', err);
          Alert.alert('Error', 'Failed to open payment page');
        });
      }
    } catch (error: any) {
      console.error('Failed to create checkout:', error);
      Alert.alert('Error', error.message || 'Failed to create checkout session');
    }
  };

  const loadChatInfo = async () => {
    try {
      const data = await chat.getInfo(chatId);
      setOtherUserName(data.chat.otherUser.name);
    } catch (error) {
      console.error('Failed to load chat info:', error);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure FlatList is rendered
      setTimeout(() => {
        // FlatList will auto-scroll if we use inverted={false} and scrollToEnd
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await chat.getMessages(chatId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) {
      console.log('Cannot send: empty message or no chatId');
      return;
    }

    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      console.log('Sending message:', messageToSend, 'to chat:', chatId);
      const result = await chat.sendMessage(chatId, messageToSend);
      console.log('Message sent successfully:', result);
      
      // Reload messages to get the latest from server (including any auto-replies)
      await loadMessages();
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setNewMessage(messageToSend);
      Alert.alert('Error', error.message || 'Failed to send message. Please try again.');
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to send images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        if (!imageUri) {
          Alert.alert('Error', 'Failed to get image URI. Please try again.');
          return;
        }

        try {
          console.log('Uploading image:', imageUri);
          const uploadResult = await chat.uploadImage(chatId, imageUri);
          console.log('Image uploaded successfully:', uploadResult);
          
          // Reload messages to show the new image message
          await loadMessages();
          
          // Scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        } catch (error: any) {
          console.error('Failed to upload image:', error);
          Alert.alert('Error', error.message || 'Failed to upload image. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', error.message || 'Failed to pick image. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.reactNative,
    },
    messageContainer: {
      padding: parseInt(spacing.md),
      marginVertical: 4,
      maxWidth: '75%',
      borderRadius: parseInt(borderRadius.xl),
    },
    ownMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#404040', // Dark grey for own messages
    },
    otherMessage: {
      alignSelf: 'flex-start',
      backgroundColor: colors.crimsonPulse.reactNative, // Red for other user's messages
    },
    messageText: {
      fontSize: parseInt(typography.fontSizes.base),
      color: '#FFFFFF', // White text for both
    },
    otherMessageText: {
      color: '#FFFFFF', // White text for other user's messages too
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: parseInt(spacing.md),
      paddingHorizontal: parseInt(spacing.md),
      backgroundColor: colors.card.reactNative,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.reactNative,
      paddingTop: parseInt(spacing.lg), // Extra padding at top to avoid status bar
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: parseInt(borderRadius.full),
      backgroundColor: colors.background.reactNative,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: parseInt(spacing.md),
    },
    headerTitle: {
      fontSize: parseInt(typography.fontSizes.lg),
      fontWeight: typography.fontWeights.semibold,
      color: colors.text.reactNative,
      flex: 1,
    },
    inputContainer: {
      flexDirection: 'row',
      paddingVertical: parseInt(spacing.md),
      paddingHorizontal: parseInt(spacing.md),
      paddingBottom: parseInt(spacing.lg), // Extra padding at bottom
      backgroundColor: colors.card.reactNative,
      borderTopWidth: 1,
      borderTopColor: colors.border.reactNative,
      gap: parseInt(spacing.sm),
      alignItems: 'flex-end', // Align items to bottom for multiline input
      minHeight: 80, // Larger vertical space
    },
    input: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#e0e0e0' : '#2a2a2a', // Light grey for light theme, dark for dark theme
      borderRadius: parseInt(borderRadius.full),
      paddingHorizontal: parseInt(spacing.md),
      paddingVertical: parseInt(spacing.sm),
      fontSize: parseInt(typography.fontSizes.base),
      color: theme === 'light' ? '#000000' : '#FFFFFF', // Black text for light theme, white for dark
      minHeight: 44,
      maxHeight: 100,
      textAlignVertical: 'center',
    },
    imageMessage: {
      width: 200,
      height: 200,
      borderRadius: parseInt(borderRadius.md),
      marginVertical: 4,
    },
    imageModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullScreenImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.crimsonPulse.reactNative,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    adSection: {
      width: '100%',
      padding: parseInt(spacing.md),
      backgroundColor: colors.card.reactNative,
      borderTopWidth: 1,
      borderTopColor: colors.border.reactNative,
      alignItems: 'center',
    },
    subscribeLink: {
      color: colors.crimsonPulse.reactNative,
      fontSize: parseInt(typography.fontSizes.sm),
      textDecorationLine: 'underline',
      marginTop: parseInt(spacing.sm),
    },
  });

  const getImageUrl = (content: string) => {
    // If content is already a full URL, use it
    if (content.startsWith('http://') || content.startsWith('https://')) {
      return content;
    }
    // If content starts with /, it's a relative path
    if (content.startsWith('/')) {
      return `${API_BASE_URL}${content}`;
    }
    // Otherwise, assume it's a relative path
    return `${API_BASE_URL}/${content}`;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isImage = item.type === 'image';
    const imageUrl = isImage ? getImageUrl(item.content) : null;

    return (
      <View
        style={[
          styles.messageContainer,
          item.isOwn ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {isImage && imageUrl ? (
          <TouchableOpacity onPress={() => setSelectedImage(imageUrl)}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.imageMessage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <Text
            style={[
              styles.messageText,
              !item.isOwn && styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={colors.text.reactNative} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{otherUserName || 'Chat'}</Text>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: parseInt(spacing.md), flexGrow: 1 }}
          inverted={false}
          onContentSizeChange={() => {
            // Auto-scroll to bottom when content size changes
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          keyboardShouldPersistTaps="handled"
        />
        {showAd && !isSubscribed && (
          <View style={styles.adSection}>
            <AdBanner />
            <TouchableOpacity onPress={handleSubscribe}>
              <Text style={styles.subscribeLink}>Subscribe to remove ads</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handlePickImage}>
            <ImageIcon size={24} color={colors.text.reactNative} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={colors.text.reactNative + '80'}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Modal
          visible={selectedImage !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <TouchableOpacity
            style={styles.imageModal}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          >
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
