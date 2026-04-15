import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { addActivity } from '../src/services/api';

// Import our contexts
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';

export default function ManualLogScreen() {
  // Grab the actual logged-in user's email dynamically!
  const { userEmail } = useAuth(); 

  const [activityType, setActivityType] = useState("");
  const [duration, setDuration] = useState("");
  const [dataUsed, setDataUsed] = useState("");
  const [loading, setLoading] = useState(false);

  const { isDarkMode } = useTheme();

  const handleSaveActivity = async () => {
    if (!activityType) {
      Alert.alert("Missing Info", "Please provide at least an activity type.");
      return;
    }

    if (!userEmail) {
      Alert.alert("Error", "You must be logged in to save an activity.");
      return;
    }

    setLoading(true);
    
    const response = await addActivity(
      userEmail,
      activityType,
      parseFloat(duration) || 0,
      parseFloat(dataUsed) || 0
    );

    setLoading(false);

    if (response?.message) {
      Alert.alert("Success", "Activity manually logged!", [
        { text: "OK", onPress: () => router.back() } 
      ]);
    } else {
      Alert.alert("Error", response?.error || "Failed to log activity");
    }
  };

  const bgColor = isDarkMode ? "#111827" : "#F3F4F6";
  const headerBg = isDarkMode ? "#1F2937" : "#fff";
  const headerBorder = isDarkMode ? "#374151" : "#E5E7EB";
  const textColorMain = isDarkMode ? "#F9FAFB" : "#1F2937";
  const textColorSub = isDarkMode ? "#D1D5DB" : "#4B5563";
  const inputBg = isDarkMode ? "#374151" : "#fff";
  const inputBorderColor = isDarkMode ? "#4B5563" : "#D1D5DB";

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        
        <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: headerBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#10B981" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColorMain }]}>Manual Entry</Text>
          <View style={{ width: 24 }} /> 
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.label, { color: textColorSub }]}>Activity Type</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorderColor, color: textColorMain }]}
            placeholder="e.g. Video Editing, Gaming, Downloading"
            value={activityType}
            onChangeText={setActivityType}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={[styles.label, { color: textColorSub }]}>Duration (Minutes)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorderColor, color: textColorMain }]}
            placeholder="0"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={[styles.label, { color: textColorSub }]}>Data Used (MB)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorderColor, color: textColorMain }]}
            placeholder="0"
            keyboardType="numeric"
            value={dataUsed}
            onChangeText={setDataUsed}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveActivity} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Activity</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  formContainer: { padding: 20, marginTop: 10 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20 },
  saveBtn: { backgroundColor: "#10B981", padding: 18, borderRadius: 12, alignItems: "center", marginTop: 10, shadowColor: "#10B981", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});