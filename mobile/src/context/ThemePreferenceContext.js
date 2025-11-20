import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme } from '../theme';

// Modes: 'system' | 'light' | 'dark'
const STORAGE_KEY = 'ui.theme.preference.v1';

const ThemePreferenceContext = createContext({
  mode: 'system',
  theme: lightTheme,
  setMode: (_m) => {},
  toggleMode: () => {},
});

export const ThemePreferenceProvider = ({ children }) => {
  const [mode, setMode] = useState('system');
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setMode(stored);
        }
      } catch {}
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setMode(next);
    try { await AsyncStorage.setItem(STORAGE_KEY, next); } catch {}
  }, []);

  const toggleMode = useCallback(() => {
    persist(mode === 'dark' ? 'light' : 'dark');
  }, [mode, persist]);

  const effectiveScheme = mode === 'system' ? systemScheme : mode;
  const theme = effectiveScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemePreferenceContext.Provider value={{ mode, theme, setMode: persist, toggleMode }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
};

export const useThemePreference = () => useContext(ThemePreferenceContext);
