// services/socketService.ts
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketHookResult {
  isConnected: boolean;
  sendSwitchCommand: (value: number) => void;
  lastGpsData: GpsData | null;
  lastAlertData: number | null;
  reconnect: () => void;
}

interface GpsData {
  latitude: number;
  longitude: number;
}

export const useSocket = (serverUrl: string): SocketHookResult => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastGpsData, setLastGpsData] = useState<GpsData | null>(null);
  const [lastAlertData, setLastAlertData] = useState<number | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  const setupSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    console.log('Connecting to socket:', serverUrl);
    socketRef.current = io(serverUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current?.id);
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Terima data GPS
    socketRef.current.on('gps', (data: GpsData) => {
      console.log('Received GPS data:', data);
      setLastGpsData(data);
    });

    // Terima data alert
    socketRef.current.on('alert', (data: number) => {
      console.log('Received alert data:', data);
      setLastAlertData(data);
    });
  };

  useEffect(() => {
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl]);

  // Kirim perintah switch ke server
  const sendSwitchCommand = (value: number): void => {
    if (socketRef.current && isConnected) {
      console.log('Sending switch command:', value);
      socketRef.current.emit('switch', value);
    } else {
      console.warn('Cannot send switch command: Socket not connected');
    }
  };

  // Hubungkan ulang ke server
  const reconnect = (): void => {
    setupSocket();
  };

  return {
    isConnected,
    sendSwitchCommand,
    lastGpsData,
    lastAlertData,
    reconnect
  };
};