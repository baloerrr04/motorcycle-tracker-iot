// app/tracker.tsx
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import MotorcycleTracker from '../components/MotorcycleTracker';

export default function TrackerScreen() {
  return (
      <SafeAreaView style={styles.container}>
        <MotorcycleTracker />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});