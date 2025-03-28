// contexts/MotorcycleContext.tsx
import React, { 
  createContext, 
  useState, 
  useContext, 
  useEffect, 
  ReactNode 
} from 'react';
import { ref, onValue, update, remove } from 'firebase/database';
import { database } from '../config/firebaseConfig';
import { 
  MotorcycleData, 
  MotorcycleLocationData, 
  HistoricalLocation 
} from '../types/MotorCycleData';
import { 
  requestNotificationPermissions, 
  sendVibrationNotification,
  setupNotificationListeners
} from '../services/NotificationService';

// Interface untuk context value
interface MotorcycleContextType {
  deviceStatus: boolean;
  locationData: MotorcycleLocationData;
  historicalLocations: HistoricalLocation[];
  vibrationAlert: boolean;
  isHistoryModalVisible: boolean;
  selectedHistoryLocation: HistoricalLocation | null;
  toggleDeviceControl: () => void;
  loadHistoricalData: () => void;
  setIsHistoryModalVisible: (visible: boolean) => void;
  selectHistoryLocation: (location: HistoricalLocation) => void;
  deleteHistoryLocation: (locationId: string) => Promise<void>;
}

// Buat context dengan default value
const MotorcycleContext = createContext<MotorcycleContextType>({
  deviceStatus: false,
  locationData: {
    deviceId: '',
    latitude: -2.9636,
    longitude: 104.7456,
    time: '',
    vibration: '',
    signal: 0
  },
  historicalLocations: [],
  vibrationAlert: false,
  isHistoryModalVisible: false,
  selectedHistoryLocation: null,
  toggleDeviceControl: () => {},
  loadHistoricalData: () => {},
  setIsHistoryModalVisible: () => {},
  selectHistoryLocation: () => {},
  // Add default implementation for deleteHistoryLocation
  deleteHistoryLocation: async () => {
    console.warn('Delete history location not implemented');
  },
});

// Provider komponen
export const MotorcycleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State untuk data lokasi
  const [locationData, setLocationData] = useState<MotorcycleLocationData>({
    deviceId: '',
    latitude: -2.9636, // Default lokasi Indonesia
    longitude: 104.7456, 
    time: '',
    vibration: '',
    signal: 0
  });

  // State untuk riwayat lokasi
  const [historicalLocations, setHistoricalLocations] = useState<HistoricalLocation[]>([]);

  // State untuk status perangkat
  const [deviceStatus, setDeviceStatus] = useState(false);

  // State untuk alert getaran
  const [vibrationAlert, setVibrationAlert] = useState(false);

  // State untuk modal riwayat
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);

  // State untuk lokasi historis yang dipilih
  const [selectedHistoryLocation, setSelectedHistoryLocation] = useState<HistoricalLocation | null>(null);

  // Fungsi untuk mengontrol perangkat
  const toggleDeviceControl = () => {
    try {
      // Kirim sinyal ke Firebase
      const deviceRef = ref(database, 'motorcycle/data');
      
      // Toggle status
      const newStatus = !deviceStatus;
      setDeviceStatus(newStatus);

      

      // Kirim status sebagai signal (1 untuk aktif, 0 untuk nonaktif)
      update(deviceRef, { 
        button: newStatus ? 1 : 0 
      });
      setIsHistoryModalVisible(false);
    } catch (error) {
      console.error("Error sending control signal:", error);
    }
  };

  // Fungsi untuk memilih lokasi historis
  const selectHistoryLocation = (location: HistoricalLocation) => {
    setSelectedHistoryLocation(location);
    setIsHistoryModalVisible(false);
  };

  // Listener untuk data lokasi dan getaran
  useEffect(() => {
    // Request notification permissions
    requestNotificationPermissions();

    // Setup notification listeners
    const cleanupListeners = setupNotificationListeners();

    const motorcycleRef = ref(database, 'motorcycle/data');
    
    const unsubscribe = onValue(motorcycleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Ambil semua ID device
        const deviceIds = Object.keys(data);

        // Pastikan ada device
        if (deviceIds.length === 0) return;

        // Ambil data device pertama (atau sesuaikan logika pemilihan)
        const selectedDeviceId = deviceIds[0];
        const deviceData = data[selectedDeviceId];

        // Pastikan deviceData tidak undefined
        if (!deviceData) return;

        // Konversi string ke float untuk latitude dan longitude
        const latitude = deviceData?.latitude ? 
          (typeof deviceData.latitude === 'string' 
            ? parseFloat(deviceData.latitude) 
            : deviceData.latitude) 
          : -2.9636;
        
        const longitude = deviceData?.longitude ? 
          (typeof deviceData.longitude === 'string' 
            ? parseFloat(deviceData.longitude) 
            : deviceData.longitude) 
          : 104.7456;

        const updatedLocationData: MotorcycleLocationData = {
          deviceId: selectedDeviceId,
          latitude: !isNaN(latitude) ? latitude : -2.9636,
          longitude: !isNaN(longitude) ? longitude : 104.7456,
          time: deviceData?.time || '',
          vibration: deviceData?.vibration || '',
          signal: deviceData?.signal ?? 0
        };

        setLocationData(updatedLocationData);

        // Cek status getaran
        if (deviceData?.vibration === "Ada Getaran") {
          console.log('Vibration alert triggered!');
          setVibrationAlert(true);
          // Kirim notifikasi
          sendVibrationNotification(selectedDeviceId, deviceData);
        } else {
          console.log('No vibration detected');
          setVibrationAlert(false);
        }

        // Muat data historis
        loadHistoricalData(selectedDeviceId);
      }
    });

    // Cleanup
    return () => {
      unsubscribe();
      cleanupListeners();
    };
  }, []);

  // Fungsi untuk memuat data historis
  const loadHistoricalData = (currentDeviceId?: string) => {
    // Pastikan kita punya device ID sebelum mencari history
    const deviceId = currentDeviceId || locationData.deviceId;
    if (!deviceId) return;

    // Referensi ke lokasi history di Firebase
    const historyRef = ref(database, 'motorcycle/data');
    
    onValue(historyRef, (snapshot) => {
      const allData = snapshot.val();
      if (allData) {
        // Ambil semua data untuk device yang berbeda
        const deviceHistory = Object.entries(allData)
          .filter(([id]) => id !== deviceId)
          .map(([id, data]) => ({
            id,
            latitude: (data as any)?.latitude || -2.9636,
            longitude: (data as any)?.longitude || 104.7456,
            time: (data as any)?.time || '',
            vibration: (data as any)?.vibration || '',
            signal: (data as any)?.signal ?? 0
          })) as HistoricalLocation[];

        setHistoricalLocations(deviceHistory);
        setIsHistoryModalVisible(true);
      }
    });
  };

  const deleteHistoryLocation = async (locationId: string) => {
    try {
      // Referensi ke lokasi spesifik di Firebase
      const locationRef = ref(database, `motorcycle/data/${locationId}`);
      
      // Hapus lokasi
      await remove(locationRef);
  
      // Update state lokal
      setHistoricalLocations(prevLocations => 
        prevLocations.filter(location => location.id !== locationId)
      );
  
      console.log(`Lokasi dengan ID ${locationId} berhasil dihapus`);
    } catch (error) {
      console.error('Gagal menghapus lokasi:', error);
      throw error; // Re-throw error agar bisa ditangani di komponen
    }
  };

  // Value yang akan disediakan oleh context
  const contextValue = {
    deviceStatus,
    locationData,
    historicalLocations,
    vibrationAlert,
    isHistoryModalVisible,
    selectedHistoryLocation,
    toggleDeviceControl,
    loadHistoricalData,
    setIsHistoryModalVisible,
    selectHistoryLocation,
    deleteHistoryLocation
  };

  return (
    <MotorcycleContext.Provider value={contextValue}>
      {children}
    </MotorcycleContext.Provider>
  );
};

// Custom hook untuk menggunakan context
export const useMotorcycle = () => {
  const context = useContext(MotorcycleContext);
  return context;
};