import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, StatusBar } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { logDailyUsage, getTodayUsage } from "../../src/services/api";

// Import our contexts
import { useTheme } from "../../src/context/ThemeContext"; 
import { useAuth } from "../../src/context/AuthContext";

const EMISSION_FACTORS = { streaming: 55, calls: 40, social: 25, general: 10 };

export default function TrackerScreen() {
  // Grab the actual logged-in user's email dynamically!
  const { userEmail } = useAuth(); 
  
  const [usage, setUsage] = useState({ streaming: 0, calls: 0, social: 0, general: 0 });
  const [syncing, setSyncing] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchInitialData = async () => {
      // Ensure we have an email before fetching
      if (!userEmail) return; 
      const data = await getTodayUsage(userEmail);
      if (data) setUsage(data);
    };
    fetchInitialData();
  }, [userEmail]);

  const handleSliderComplete = async (category: string, value: number) => {
    if (!userEmail) return;
    setSyncing(true);
    const newUsage = { ...usage, [category]: value };
    setUsage(newUsage);
    await logDailyUsage(userEmail, newUsage);
    setSyncing(false);
  };

  const totalEmissions = 
    (usage.streaming * EMISSION_FACTORS.streaming) + (usage.calls * EMISSION_FACTORS.calls) +
    (usage.social * EMISSION_FACTORS.social) + (usage.general * EMISSION_FACTORS.general);

  const carKm = (totalEmissions / 120).toFixed(1);
  const smartphonesCharged = (totalEmissions / 8).toFixed(0);

  const categories = [
    { id: 'streaming', label: "Streaming", icon: "videocam", color: "#FF8042", bg: "#FF804220" },
    { id: 'social', label: "Social & Web", icon: "globe", color: "#00C49F", bg: "#00C49F20" },
    { id: 'calls', label: "Video Calls", icon: "wifi", color: "#0088FE", bg: "#0088FE20" },
    { id: 'general', label: "General Apps", icon: "apps", color: "#FFBB28", bg: "#FFBB2820" }
  ];

  const bgColor = isDarkMode ? "#111827" : "#F3F4F6";
  const cardBg = isDarkMode ? "#1F2937" : "#fff";
  const borderColor = isDarkMode ? "#374151" : "#E5E7EB";
  const textColorMain = isDarkMode ? "#F9FAFB" : "#111827";
  const textColorSub = isDarkMode ? "#9CA3AF" : "#6B7280";
  const badgeBg = isDarkMode ? "#374151" : "#F3F4F6";

  return (
    <View style={[styles.mainContainer, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.scoreCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <Text style={[styles.scoreSubtitle, { color: textColorSub }]}>TODAY'S FOOTPRINT</Text>
          <View style={styles.scoreNumberBox}>
            <Text style={styles.scoreNumber}>{totalEmissions.toFixed(0)}</Text>
            <Text style={[styles.scoreUnit, { color: textColorSub }]}>gCO₂e</Text>
          </View>
          <View style={styles.equivalentsRow}>
            <View style={[styles.eqBadge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.eqText, { color: textColorMain }]}>🚗 ≈ {carKm} km driven</Text>
            </View>
            <View style={[styles.eqBadge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.eqText, { color: textColorMain }]}>📱 ≈ {smartphonesCharged} charges</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="phone-portrait-outline" size={20} color="#10B981" />
          <Text style={[styles.sectionTitle, { color: textColorMain }]}>Log Activity</Text>
          {syncing && <ActivityIndicator size="small" color="#10B981" style={{marginLeft: 10}}/>}
        </View>

        {categories.map((cat) => (
          <View key={cat.id} style={[styles.sliderCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderLabelBox}>
                <View style={[styles.iconBox, { backgroundColor: cat.bg }]}>
                  <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                </View>
                <Text style={[styles.sliderLabel, { color: textColorMain }]}>{cat.label}</Text>
              </View>
              <Text style={[styles.sliderValue, { color: textColorMain }]}>{usage[cat.id as keyof typeof usage]} hrs</Text>
            </View>
            <Slider
              style={styles.slider} minimumValue={0} maximumValue={12} step={0.5}
              minimumTrackTintColor="#10B981" 
              maximumTrackTintColor={isDarkMode ? "#4B5563" : "#E5E7EB"} 
              thumbTintColor="#10B981"
              value={usage[cat.id as keyof typeof usage]}
              onValueChange={(val) => setUsage({...usage, [cat.id]: val})}
              onSlidingComplete={(val) => handleSliderComplete(cat.id, val)}
            />
            <Text style={[styles.estText, { color: textColorSub }]}>
              Est. {(usage[cat.id as keyof typeof usage] * EMISSION_FACTORS[cat.id as keyof typeof EMISSION_FACTORS]).toFixed(0)}g CO₂
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  scrollContainer: { padding: 15, paddingBottom: 40 },
  scoreCard: { borderRadius: 20, padding: 25, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 25, borderWidth: 1 },
  scoreSubtitle: { fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 5 },
  scoreNumberBox: { flexDirection: "row", alignItems: "baseline" },
  scoreNumber: { fontSize: 50, fontWeight: "900", color: "#10B981" },
  scoreUnit: { fontSize: 18, marginLeft: 5, fontWeight: "500" },
  equivalentsRow: { flexDirection: "row", gap: 10, marginTop: 15 },
  eqBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  eqText: { fontSize: 12, fontWeight: "600" },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  sliderCard: { padding: 15, borderRadius: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 5, elevation: 2, borderWidth: 1 },
  sliderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  sliderLabelBox: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  sliderLabel: { fontSize: 15, fontWeight: "600" },
  sliderValue: { fontSize: 15, fontWeight: "800" },
  slider: { width: "100%", height: 40 },
  estText: { textAlign: "right", fontSize: 11, marginTop: -5 }
});