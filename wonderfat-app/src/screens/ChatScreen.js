import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';

const QUICK_REPLIES = [
  { id: 'subscribe', text: 'How do I Subscribe & Save?' },
  { id: 'ingredients', text: 'What\'s in WonderFat Tallow Balm?' },
  { id: 'order', text: 'Where can I buy WonderFat?' },
  { id: 'skin', text: 'Help with my skin type' },
  { id: 'support', text: 'I need help with my order' },
];

const AUTO_REPLIES = {
  subscribe: {
    text: 'Great question! You can save 10% on every order with Amazon Subscribe & Save. Just visit our Amazon page, select your preferred delivery frequency, and you\'ll never run out of WonderFat!\n\nTap the button below to set it up:',
    action: { label: 'Subscribe & Save on Amazon', url: 'https://www.amazon.com/dp/B0F96NJLYC?th=1&subscribe=1' },
  },
  ingredients: {
    text: 'WonderFat Whipped Tallow Balm is made with just 5 pure ingredients:\n\n1. Grass-Fed Beef Tallow - deeply nourishing, bio-identical to skin\n2. Manuka Honey - antibacterial & healing\n3. Jojoba Oil - lightweight moisture\n4. Mango Butter - rich in vitamins A & C\n5. Vitamin E (Tocopherol) - natural antioxidant\n\nNo synthetic fragrance, silicones, fillers, petrochemicals, or preservatives. Ever.',
  },
  order: {
    text: 'You can get WonderFat from:\n\n1. Our website: getwonderfat.com\n2. Amazon (with Subscribe & Save for 10% off!)\n\nTap below to shop:',
    action: { label: 'Shop on Amazon', url: 'https://www.amazon.com/dp/B0F96NJLYC' },
  },
  skin: {
    text: 'WonderFat Whipped Tallow Balm works beautifully for all skin types!\n\n- Dry skin: Use daily as a rich moisturizer\n- Oily skin: Use a small amount — tallow absorbs without clogging pores\n- Sensitive skin: Our fragrance-free formula is perfect for reactive skin\n- Combination: Apply more on dry areas, less on oily zones\n\nWant personalized advice? Send us a message and our team will get back to you!',
  },
  support: {
    text: 'We\'re here to help! For order support:\n\n- Email: support@getwonderfat.com\n- Response time: within 24 hours\n\nFor Amazon orders, you can also contact Amazon customer service directly through your order page.\n\nDescribe your issue below and we\'ll get back to you as soon as possible!',
  },
  default: {
    text: 'Thanks for your message! Our team will get back to you within 24 hours.\n\nIn the meantime, check out our quick replies below for instant answers to common questions.',
  },
};

export default function ChatScreen() {
  const { state } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: `Hey${state.user?.firstName ? ` ${state.user.firstName}` : ''}! 👋 Welcome to WonderFat.\n\nI'm here to help with product questions, skincare tips, or anything WonderFat. How can I help you today?`,
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const sendMessage = (text, quickReplyId = null) => {
    if (!text.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      text: text.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Auto-reply after a short delay
    setTimeout(() => {
      const reply = quickReplyId
        ? AUTO_REPLIES[quickReplyId]
        : AUTO_REPLIES.default;

      const botMessage = {
        id: `bot_${Date.now()}`,
        text: reply.text,
        isBot: true,
        action: reply.action || null,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    }, 800);
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply.text, reply.id);
  };

  const handleAction = (action) => {
    if (action?.url) {
      Linking.openURL(action.url);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.isBot ? styles.botBubble : styles.userBubble,
      ]}
    >
      {item.isBot && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>WF</Text>
        </View>
      )}
      <View
        style={[
          styles.messageContent,
          item.isBot ? styles.botContent : styles.userContent,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isBot ? styles.botText : styles.userText,
          ]}
        >
          {item.text}
        </Text>
        {item.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAction(item.action)}
            activeOpacity={0.8}
          >
            <Ionicons name="open-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>{item.action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const showQuickReplies = messages.length <= 2;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>WF</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>WonderFat</Text>
          <Text style={styles.headerSubtitle}>Typically replies instantly</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Replies */}
      {showQuickReplies && (
        <View style={styles.quickReplies}>
          {QUICK_REPLIES.map(reply => (
            <TouchableOpacity
              key={reply.id}
              style={styles.quickReplyChip}
              onPress={() => handleQuickReply(reply)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickReplyText}>{reply.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim() ? styles.sendButtonActive : null,
          ]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() ? COLORS.white : COLORS.gray}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    gap: SPACING.sm,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  // Messages
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    maxWidth: '85%',
  },
  botBubble: {
    alignSelf: 'flex-start',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  botAvatarText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  messageContent: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexShrink: 1,
  },
  botContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 4,
    ...SHADOWS.small,
  },
  userContent: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
  },
  botText: {
    color: COLORS.textPrimary,
  },
  userText: {
    color: COLORS.white,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    gap: 6,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  // Quick replies
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  quickReplyChip: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  quickReplyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.md,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
});
