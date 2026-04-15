import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router'; // <-- Added this!
import { askEcoCoach, getRecommendations } from "../../src/services/api";

// Import our contexts
import { useTheme } from "../../src/context/ThemeContext";
import { useAuth } from "../../src/context/AuthContext";

export default function TipsScreen() {
  const { userEmail } = useAuth(); 

  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isChatting, setIsChatting] = useState(false);

  const { isDarkMode } = useTheme();

  // MAGIC FIX: This makes it fetch fresh data EVERY time you open this tab
  useFocusEffect(
    useCallback(() => {
      fetchTips();
    }, [userEmail])
  );

  const fetchTips = async () => {
    if (!userEmail) return;
    const recRes = await getRecommendations(userEmail);
    if (recRes?.recommendations) setRecommendations(recRes.recommendations);
  };

  const handleAskCoach = async () => {
    if (!chatInput.trim()) return;
    setIsChatting(true);
    const result = await askEcoCoach(chatInput);
    if (result?.reply) setChatResponse(result.reply);
    else setChatResponse("Eco-Coach is currently offline.");
    setIsChatting(false);
    setChatInput("");
  };

  const bgColor = isDarkMode ? "#111827" : "#F3F4F6";
  const cardBg = isDarkMode ? "#1F2937" : "#fff";
  const chatHeaderBg = isDarkMode ? "#064E3B" : "#ECFDF5";
  const botBubbleBg = isDarkMode ? "#064E3B" : "#ECFDF5";
  const inputBg = isDarkMode ? "#374151" : "#F9FAFB";
  const borderColor = isDarkMode ? "#374151" : "#D1FAE5";
  const inputBorderColor = isDarkMode ? "#4B5563" : "#E5E7EB";
  const textColorMain = isDarkMode ? "#F9FAFB" : "#065F46";
  const textColorSub = isDarkMode ? "#D1D5DB" : "#4B5563";
  const placeholderColor = isDarkMode ? "#9CA3AF" : "#999";
  const tipBorderColor = isDarkMode ? "#374151" : "#F3F4F6";

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={{ paddingBottom: 40, paddingTop: 50 }}>
        
        <View style={[styles.chatCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <View style={[styles.chatHeader, { backgroundColor: chatHeaderBg, borderBottomColor: borderColor }]}>
            <Ionicons name="chatbubbles" size={24} color="#10B981" />
            <Text style={[styles.chatTitle, { color: textColorMain }]}>Ask EcoBit Coach</Text>
          </View>
          <View style={styles.chatBody}>
            {chatResponse ? (
              <View style={[styles.botBubble, { backgroundColor: botBubbleBg, borderColor: borderColor }]}>
                <Text style={styles.botName}>EcoBit Says:</Text>
                <Text style={[styles.botText, { color: textColorMain }]}>{chatResponse}</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>Ask me anything about digital sustainability!</Text>
            )}
          </View>
          <View style={[styles.inputRow, { borderTopColor: isDarkMode ? "#374151" : "#F3F4F6" }]}>
            <TextInput 
              style={[styles.chatInput, { backgroundColor: inputBg, borderColor: inputBorderColor, color: isDarkMode ? "#fff" : "#000" }]} 
              placeholder="E.g. How much carbon does an email use?" 
              value={chatInput} 
              onChangeText={setChatInput} 
              placeholderTextColor={placeholderColor} 
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleAskCoach} disabled={isChatting}>
              {isChatting ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={18} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerBox}>
          <Ionicons name="leaf-outline" size={40} color="#10B981" />
          <Text style={[styles.headerTitle, { color: textColorMain }]}>Eco-Recommendations</Text>
          <Text style={[styles.headerSub, { color: isDarkMode ? "#10B981" : "#059669" }]}>Personalized ways to reduce your footprint.</Text>
        </View>

        {recommendations.map((tip, index) => {
           let iconName: any = "bulb";
           if(tip.toLowerCase().includes("video")) iconName = "videocam";
           else if(tip.toLowerCase().includes("social") || tip.toLowerCase().includes("web")) iconName = "globe";
           
           return (
            <View key={index} style={[styles.tipCard, { backgroundColor: cardBg, borderColor: tipBorderColor }]}>
              <View style={styles.tipIconBox}>
                <Ionicons name={iconName} size={24} color="#10B981" />
              </View>
              <Text style={[styles.tipText, { color: textColorSub }]}>{tip}</Text>
            </View>
           )
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  emptyText: { textAlign: "center", color: "#9CA3AF", fontStyle: "italic", marginVertical: 20 },
  chatCard: { borderRadius: 16, marginBottom: 20, overflow: "hidden", borderWidth: 1 },
  chatHeader: { padding: 15, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1 },
  chatTitle: { fontSize: 16, fontWeight: "bold" },
  chatBody: { padding: 15, minHeight: 120, justifyContent: "center" },
  botBubble: { padding: 15, borderRadius: 12, borderTopLeftRadius: 2, borderWidth: 1 },
  botName: { fontSize: 11, fontWeight: "bold", color: "#10B981", textTransform: "uppercase", marginBottom: 4 },
  botText: { fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: "row", padding: 10, borderTopWidth: 1, gap: 10 },
  chatInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, fontSize: 14 },
  sendBtn: { backgroundColor: "#10B981", width: 45, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  headerBox: { alignItems: "center", marginVertical: 20 },
  headerTitle: { fontSize: 22, fontWeight: "bold", marginTop: 8 },
  headerSub: { fontSize: 14, marginTop: 4 },
  tipCard: { padding: 15, borderRadius: 12, marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 15, borderWidth: 1 },
  tipIconBox: { backgroundColor: "rgba(16, 185, 129, 0.1)", padding: 10, borderRadius: 50 },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20 }
});