// components/SocketDebugger.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import io, { Socket } from 'socket.io-client';

interface PingResult {
  success: boolean;
  latency?: string;
  serverTime?: string;
  socketId?: string;
  error?: string;
  timestamp: string;
}

interface EventData {
  event: string;
  args: any[];
  time: string;
}

interface ConnectionEvent {
  message: string;
  timestamp: string;
}

interface SocketDebuggerProps {
  socketUrl: string;
}

const SocketDebugger: React.FC<SocketDebuggerProps> = ({ socketUrl }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<PingResult | null>(null);
  const [lastEvent, setLastEvent] = useState<EventData | null>(null);
  const [connectionEvents, setConnectionEvents] = useState<ConnectionEvent[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Inisialisasi koneksi socket dengan debug
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [socketUrl]);

  const connectSocket = (): void => {
    try {
      console.log('Connecting to socket server:', socketUrl);
      
      socketRef.current = io(socketUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling'],
      });

      socketRef.current.onAny((event: string, ...args: any[]) => {
        console.log(`Socket event: ${event}`, args);
        setLastEvent({ event, args, time: new Date().toLocaleTimeString() });
      });

      socketRef.current.on('connect', () => {
        const timestamp = new Date().toLocaleTimeString();
        console.log('Connected to socket server at', timestamp);
        setIsConnected(true);
        addConnectionEvent('Connected', timestamp);
      });

      socketRef.current.on('disconnect', (reason: string) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log('Disconnected from socket server:', reason, 'at', timestamp);
        setIsConnected(false);
        addConnectionEvent(`Disconnected: ${reason}`, timestamp);
      });

      socketRef.current.on('connect_error', (error: Error) => {
        const timestamp = new Date().toLocaleTimeString();
        console.error('Socket connection error:', error.message, 'at', timestamp);
        addConnectionEvent(`Error: ${error.message}`, timestamp);
      });
    } catch (error) {
      console.error('Error setting up socket:', error);
    }
  };

  const addConnectionEvent = (message: string, timestamp: string): void => {
    setConnectionEvents(prev => [
      { message, timestamp },
      ...prev.slice(0, 9)
    ]);
  };

  const testPing = (): void => {
    if (socketRef.current && isConnected) {
      const startTime = Date.now();
      
      socketRef.current.emit('ping', (response: any) => {
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        setPingResult({
          success: true,
          latency: `${latency}ms`,
          serverTime: response?.serverTime || 'N/A',
          socketId: response?.socketId || socketRef.current?.id,
          timestamp: new Date().toLocaleTimeString()
        });
      });
    } else {
      setPingResult({
        success: false,
        error: 'Socket tidak terhubung',
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Socket.IO Debugger</Text>
        <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
      </View>
      
      <Text style={styles.statusText}>
        Status: {isConnected ? 'Terhubung' : 'Terputus'}
      </Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.reconnectButton]} 
          onPress={connectSocket}
        >
          <Text style={styles.buttonText}>Reconnect</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.pingButton]} 
          onPress={testPing}
        >
          <Text style={styles.buttonText}>Test Ping</Text>
        </TouchableOpacity>
      </View>
      
      {pingResult && (
        <View style={styles.resultCard}>
          <Text style={styles.cardTitle}>Ping Result ({pingResult.timestamp})</Text>
          <Text>Success: {pingResult.success ? 'Yes' : 'No'}</Text>
          {pingResult.success ? (
            <>
              <Text>Latency: {pingResult.latency}</Text>
              <Text>Socket ID: {pingResult.socketId}</Text>
              <Text>Server Time: {pingResult.serverTime}</Text>
            </>
          ) : (
            <Text>Error: {pingResult.error}</Text>
          )}
        </View>
      )}
      
      {lastEvent && (
        <View style={styles.resultCard}>
          <Text style={styles.cardTitle}>Last Event ({lastEvent.time})</Text>
          <Text>Event: {lastEvent.event}</Text>
          <Text>Data: {JSON.stringify(lastEvent.args).substring(0, 100)}</Text>
        </View>
      )}
      
      <View style={styles.eventLogContainer}>
        <Text style={styles.cardTitle}>Connection Event Log</Text>
        {connectionEvents.map((event, index) => (
          <Text key={index} style={styles.eventLogItem}>
            [{event.timestamp}] {event.message}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    padding: 10,
    borderRadius: 6,
    flex: 1,
    margin: 4,
    alignItems: 'center',
  },
  reconnectButton: {
    backgroundColor: '#2196F3',
  },
  pingButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventLogContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    maxHeight: 200,
  },
  eventLogItem: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default SocketDebugger;