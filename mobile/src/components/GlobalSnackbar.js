import React from 'react';
import { Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

const GlobalSnackbar = () => {
  const { snackbarVisible, setSnackbarVisible, snackbarMessage, snackbarAction } = useApp();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <Snackbar
      visible={snackbarVisible}
      onDismiss={() => setSnackbarVisible(false)}
      duration={2500}
      style={{ marginBottom: 90 + (insets?.bottom || 0) }}
      action={
        snackbarAction
          ? {
              label: snackbarAction.label,
              onPress: () => {
                setSnackbarVisible(false);
                try { snackbarAction.onPress && snackbarAction.onPress(); } catch {}
              },
            }
          : {
              label: 'View Cart',
              onPress: () => {
                setSnackbarVisible(false);
                navigation.navigate('CartTab');
              },
            }
      }
    >
      {snackbarMessage}
    </Snackbar>
  );
};

export default GlobalSnackbar;
