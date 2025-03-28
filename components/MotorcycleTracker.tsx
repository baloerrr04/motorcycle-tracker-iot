// components/MotorcycleTracker.tsx
import React, { useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Modal, 
  SafeAreaView 
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useMotorcycle } from '../contexts/MotorcycleContext';
import { Alert } from 'react-native';
import { HistoricalLocation } from '../types/MotorCycleData';

const MotorcycleTracker: React.FC = () => {
  // Destructure with default values to prevent undefined errors
  const { 
    locationData = {
      deviceId: 'N/A',
      latitude: -2.9636,
      longitude: 104.7456,
      time: '',
      vibration: '',
      signal: 0
    }, 
    historicalLocations = [], 
    vibrationAlert = false, 
    loadHistoricalData = () => {}, 
    isHistoryModalVisible = false,
    setIsHistoryModalVisible = () => {},
    selectHistoryLocation = () => {},
    deleteHistoryLocation = async () => {},
    selectedHistoryLocation
  } = useMotorcycle() || {};
  
  // Referensi ke MapView untuk menggerakkan kamera
  const mapRef = useRef<MapView>(null);

  // Memoize initial region to prevent unnecessary re-renders
  const initialRegion = useMemo<Region>(() => ({
    latitude: typeof locationData.latitude === 'string' 
      ? parseFloat(locationData.latitude) 
      : locationData.latitude,
    longitude: typeof locationData.longitude === 'string' 
      ? parseFloat(locationData.longitude) 
      : locationData.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }), [locationData.latitude, locationData.longitude]);

  // Safely convert latitude/longitude
  const safeParseCoordinate = (coord: string | number): number => {
    return typeof coord === 'string' ? parseFloat(coord) : coord;
  };

  // Render marker for historical location
  const renderHistoryMarker = (location: HistoricalLocation) => {
    if (!location) return null;

    return (
      <Marker
        key={location.id}
        coordinate={{
          latitude: safeParseCoordinate(location.latitude),
          longitude: safeParseCoordinate(location.longitude),
        }}
        title="Lokasi Historis"
        description={`Waktu: ${location.time || 'Tidak tersedia'}`}
        pinColor="blue"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Peta */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        region={initialRegion}
      >
        {/* Marker Lokasi Saat Ini */}
        <Marker
          coordinate={{
            latitude: safeParseCoordinate(locationData.latitude),
            longitude: safeParseCoordinate(locationData.longitude),
          }}
          title={`Posisi Motor (${locationData.deviceId})`}
          description={`Waktu: ${locationData.time || 'Tidak tersedia'}`}
        >
          <Image 
            source={require('../assets/images/motorcycle-marker.png')} 
            style={styles.markerImage} 
          />
        </Marker>

        {/* Marker Lokasi Historis yang Dipilih */}
        {selectedHistoryLocation && renderHistoryMarker(selectedHistoryLocation)}

        {/* Jalur Historis */}
        {historicalLocations.length > 0 && (
          <Polyline
            coordinates={historicalLocations.map((loc) => ({
              latitude: safeParseCoordinate(loc.latitude),
              longitude: safeParseCoordinate(loc.longitude),
            }))}
            strokeColor="#000"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Info Detail */}
      <View style={styles.infoContainer}>
        <Text>Device ID: {locationData.deviceId || 'Tidak tersedia'}</Text>
        <Text>
          Latitude: {typeof locationData.latitude === 'number' 
            ? locationData.latitude.toFixed(6) 
            : 'Tidak tersedia'}
        </Text>
        <Text>
          Longitude: {typeof locationData.longitude === 'number' 
            ? locationData.longitude.toFixed(6) 
            : 'Tidak tersedia'}
        </Text>
        <Text>Waktu: {locationData.time || 'Tidak tersedia'}</Text>
        <Text>Vibration: {locationData.vibration || 'Tidak tersedia'}</Text>
      </View>

      {/* Tombol Riwayat Lokasi */}
      <TouchableOpacity 
        style={styles.historyButton}
        onPress={loadHistoricalData}
      >
        <Text style={styles.historyButtonText}>Lihat Riwayat Lokasi</Text>
      </TouchableOpacity>

      {/* Modal Riwayat Lokasi */}
      <Modal
        visible={isHistoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsHistoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Riwayat Lokasi</Text>
            <ScrollView>
              {historicalLocations.map((location, index) => (
                <View 
                  key={location.id || index} 
                  style={styles.historyItemContainer}
                >
                  <TouchableOpacity 
                    style={styles.historyItemContent}
                    onPress={() => selectHistoryLocation(location)}
                  >
                    <Text>Device ID: {location.id || 'N/A'}</Text>
                    <Text>
                      Latitude: {typeof location.latitude === 'number' 
                        ? location.latitude.toFixed(6) 
                        : safeParseCoordinate(location.latitude).toFixed(6)}
                    </Text>
                    <Text>
                      Longitude: {typeof location.longitude === 'number' 
                        ? location.longitude.toFixed(6) 
                        : safeParseCoordinate(location.longitude).toFixed(6)}
                    </Text>
                    <Text>Waktu: {location.time || 'Tidak tersedia'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Hapus Lokasi',
                        'Apakah Anda yakin ingin menghapus lokasi ini?',
                        [
                          {
                            text: 'Batal',
                            style: 'cancel'
                          },
                          {
                            text: 'Hapus',
                            style: 'destructive',
                            onPress: () => {
                              if (location.id) {
                                deleteHistoryLocation(location.id);
                              }
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setIsHistoryModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Indikator Getaran */}
      <View style={[
        styles.alertIndicator, 
        { backgroundColor: vibrationAlert ? 'red' : 'green' }
      ]}>
        <Text style={styles.alertText}>
          {vibrationAlert ? "GETARAN TERDETEKSI" : "AMAN"}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerImage: {
    width: 35,
    height: 35,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  historyButton: {
    backgroundColor: '#007bff',
    padding: 10,
    alignItems: 'center',
  },
  historyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  historyItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  historyItemContent: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
  },
  closeModalButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  closeModalButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  alertIndicator: {
    padding: 10,
    alignItems: 'center',
  },
  alertText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MotorcycleTracker;