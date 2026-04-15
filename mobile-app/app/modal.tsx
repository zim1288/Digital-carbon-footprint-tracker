import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';

export default function AboutModalScreen() {
  const { isDarkMode } = useTheme();
  
  const bgColor = isDarkMode ? "#111827" : "#F3F4F6";
  const cardBg = isDarkMode ? "#1F2937" : "#fff";
  const textColor = isDarkMode ? "#F9FAFB" : "#1F2937";
  const subTextColor = isDarkMode ? "#9CA3AF" : "#6B7280";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Ionicons name="leaf" size={60} color="#10B981" style={styles.icon} />
        <Text style={[styles.title, { color: textColor }]}>EcoBit Tracker</Text>
        <Text style={[styles.version, { color: subTextColor }]}>Version 1.0.0</Text>
        
        <Text style={[styles.description, { color: textColor }]}>
          A capstone project dedicated to tracking, analyzing, and reducing digital carbon footprints using machine learning and AI.
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { padding: 30, borderRadius: 20, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  icon: { marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  version: { fontSize: 14, marginBottom: 20 },
  description: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  button: { backgroundColor: '#10B981', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});