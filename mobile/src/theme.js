import { MD3LightTheme as PaperDefaultTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: '#007bff',
    secondary: '#6c757d',
    tertiary: '#28a745',
    error: '#dc3545',
    background: '#f8f9fa',
    surface: '#ffffff',
    // Semantic extensions
    success: '#28a745',
    info: '#0dcaf0',
    warning: '#ffc107',
    successContainer: '#d4edda',
    infoContainer: '#cce7ff',
    warningContainer: '#fff3cd',
    divider: '#eee',
    textPrimary: '#333333',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#e0e0e0',
  },
};

export const darkTheme = {
  ...PaperDarkTheme,
  dark: true,
  colors: {
    ...PaperDarkTheme.colors,
    primary: '#4da3ff',
    secondary: '#9aa0a6',
    tertiary: '#57d27a',
    error: '#ff6b6b',
    background: '#0f1113',
    surface: '#15181c',
    // Semantic extensions
    success: '#57d27a',
    info: '#5bc0de',
    warning: '#ffd166',
    successContainer: '#1d3a29',
    infoContainer: '#1a2a3a',
    warningContainer: '#3a2f1a',
    divider: '#2a2d31',
    textPrimary: '#e6e6e6',
    textSecondary: '#b0b3b8',
    textMuted: '#8d8f94',
    border: '#2a2d31',
  },
};

export default lightTheme;
