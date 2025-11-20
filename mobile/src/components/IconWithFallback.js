import React, { useState } from 'react';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Emoji fallbacks for common icons
const iconFallbacks = {
  'home': '🏠',
  'home-outline': '🏠',
  'restaurant': '🍽️',
  'restaurant-outline': '🍽️',
  'list': '📋',
  'menu': '📋',
  'menu-outline': '📋',
  'book-outline': '📋',
  'cart': '🛒',
  'cart-outline': '🛒',
  'person': '👤',
  'person-outline': '👤',
  'person-circle-outline': '👤',
  'add': '➕',
  'add-circle': '➕',
  'remove': '➖',
  'remove-circle': '➖',
  'star': '⭐',
  'star-outline': '☆',
  'location': '📍',
  'time': '🕐',
  'search': '🔍',
  'filter': '🔽',
  'close': '✖️',
  'close-circle': '✖️',
  'checkmark': '✅',
  'arrow-back': '←',
  'arrow-forward': '→',
  'chevron-forward': '→',
  'heart': '❤️',
  'heart-outline': '♡',
  'share': '📤',
  'call': '📞',
  'mail': '📧',
  'mail-outline': '📧',
  'settings': '⚙️',
  'logout': '🚪',
  'login': '🔑',
  'lock-closed-outline': '🔒',
  'eye': '👁️',
  'eye-off': '🙈',
  'trash-outline': '🗑️'
};

const IconWithFallback = ({ name, size = 24, color = '#000', style, testID }) => {
  // For problematic icons that often show duplicates, use emoji directly
  const problematicIcons = ['add', 'remove', 'cart', 'cart-outline', 'book-outline'];
  
  if (problematicIcons.includes(name) && iconFallbacks[name]) {
    return (
      <Text 
        style={[
          { 
            fontSize: size,
            lineHeight: size,
            textAlign: 'center'
          }, 
          style
        ]}
        testID={testID}
      >
        {iconFallbacks[name]}
      </Text>
    );
  }
  
  // For other icons, use Ionicons
  return (
    <Ionicons 
      name={name} 
      size={size} 
      color={color} 
      style={style}
      testID={testID}
    />
  );
};

export default IconWithFallback;