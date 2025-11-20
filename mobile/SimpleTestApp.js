import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SimpleTestApp = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Restaurant App</Text>
      <Text style={styles.subtitle}>Basic connectivity test</Text>
      <Text style={styles.status}>✅ App loaded successfully!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: '600',
  },
});

export default SimpleTestApp;