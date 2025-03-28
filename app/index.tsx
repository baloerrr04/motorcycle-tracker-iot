// app/(tabs)/index.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { useMotorcycle } from '../contexts/MotorcycleContext';

export default function HomeScreen() {
  const { 
    locationData, 
    deviceStatus, 
    toggleDeviceControl,
    vibrationAlert
  } = useMotorcycle();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Motor Tracking</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status Perangkat: </Text>
        <Text style={styles.statusLabel}>{deviceStatus ? 'Hidup' : 'Mati'}</Text>
      </View>

      <View style={styles.statusContainer}>
      <Text style={styles.statusLabel}>Tombol Perangkat: </Text>
      <TouchableOpacity 
          style={[
            styles.deviceStatusButton, 
            { 
              backgroundColor: deviceStatus ? '#F44336' : '#4CAF50' 
            }
          ]}
          onPress={toggleDeviceControl}
        >
          <Text style={styles.deviceStatusText}>
            {deviceStatus ? 'Off' : 'On'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Informasi Motor</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Device ID:</Text>
          <Text style={styles.infoValue}>{locationData.deviceId || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Latitude:</Text>
          <Text style={styles.infoValue}>
            {typeof locationData.latitude === 'number' 
              ? locationData.latitude.toFixed(6) 
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Longitude:</Text>
          <Text style={styles.infoValue}>
            {typeof locationData.longitude === 'number' 
              ? locationData.longitude.toFixed(6) 
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Waktu:</Text>
          <Text style={styles.infoValue}>{locationData.time || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.alertContainer}>
        <Text style={styles.alertLabel}>Status Keamanan:</Text>
        <View 
          style={[
            styles.alertStatus, 
            { 
              backgroundColor: vibrationAlert ? '#F44336' : '#4CAF50' 
            }
          ]}
        >
          <Text style={styles.alertText}>
            {vibrationAlert ? 'GETARAN TERDETEKSI' : 'AMAN'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceStatusButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  deviceStatusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertContainer: {
    alignItems: 'center',
  },
  alertLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  alertStatus: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  alertText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});