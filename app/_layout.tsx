// app/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { MotorcycleProvider } from '../contexts/MotorcycleContext';

export default function AppLayout() {
  return (
    <MotorcycleProvider>
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0.5,
          borderTopColor: '#e0e0e0',
          elevation: 5,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              color={color} 
              size={24} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="tracker" 
        options={{
          title: 'Peta',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'map' : 'map-outline'} 
              color={color} 
              size={24} 
            />
          ),
        }} 
      />
    </Tabs>
  </MotorcycleProvider>
  );
}