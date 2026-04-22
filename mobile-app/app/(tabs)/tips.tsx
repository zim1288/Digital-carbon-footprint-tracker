import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router'; 
import { askEcoCoach, getRecommendations } from "../../src/services/api";

// Import our contexts
import { useTheme } from "../../src/context/ThemeContext";
import { useAuth } from "../../src/context/AuthContext";
import { useLanguage } from "../../src/context/LanguageContext";

// HELPER: Number to Bengali
const convertNumberToBengali = (numStr: string | number) => {
  const bngMap: any = { '0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯', '.':'.' };
  return numStr.toString().replace(/[0-9]/g, (match) => bngMap[match]);
};

// HELPER: Translate Category
const translateCategory = (name: string) => {
  const categoryMap: any = {
    "Streaming": "স্ট্রিমিং", "Calls": "ভিডিও কল", "Social": "সোশ্যাল", "General": "সাধারণ",
    "Gaming": "গেমিং", "Video Editing": "ভিডিও এডিটিং", "Downloading": "ডাউনলোডিং", "Other": "অন্যান্য"
  };
  return categoryMap[name] || name;
};

export default function TipsScreen() {
  const { userEmail } = useAuth(); 
  const { t, language } = useLanguage();

  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isChatting, setIsChatting] = useState(false);

  const { isDarkMode } = useTheme();

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

  // INTERCEPTOR: Translates backend strings to Bengali
  const translateRecommendation = (text: string) => {
    if (language === 'en') return text;

    if (text.includes("Reduce video streaming quality")) return "কার্বন নির্গমন কমাতে ভিডিও স্ট্রিমিং কোয়ালিটি ৭২০p (720p) তে নামিয়ে আনুন।";
    if (text.includes("Try limiting video streaming hours")) return "প্রতিদিন ভিডিও স্ট্রিমিংয়ের সময় সীমিত করার চেষ্টা করুন।";
    if (text.includes("Reduce excessive social media")) return "অতিরিক্ত সোশ্যাল মিডিয়া ব্যবহারের সময় কমান।";
    if (text.includes("Consider setting daily digital usage limits")) return "প্রতিদিনের ডিজিটাল ব্যবহারের সীমা নির্ধারণ করার কথা বিবেচনা করুন।";
    if (text.includes("well balanced")) return "আপনার ডিজিটাল ব্যবহার বেশ ভারসাম্যপূর্ণ। পরিবেশ-বান্ধব অভ্যাস বজায় রাখুন।";
    if (text.includes("Start tracking your digital activities")) return "ব্যক্তিগত ইকো-সুপারিশ পেতে আপনার ডিজিটাল অ্যাক্টিভিটি ট্র্যাক করা শুরু করুন।";

    // Handle the dynamic sentence: "Your highest carbon activity is Video Editing (1000 g CO₂)..."
    if (text.includes("Your highest carbon activity is")) {
      const match = text.match(/Your highest carbon activity is (.*?) \((.*?) g CO₂\)/);
      if (match) {
        const actName = translateCategory(match[1]);
        const actCarbon = convertNumberToBengali(match[2]);
        return `আপনার সর্বোচ্চ কার্বন তৈরি করা কাজ হলো ${actName} (${actCarbon} গ্রাম CO₂)। আপনার ফুটপ্রিন্ট কমাতে এটি কমানোর চেষ্টা করুন।`;
      }
    }
    return text;
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
            <Text style={[styles.chatTitle, { color: textColorMain }]}>{t('askCoachTitle')}</Text>
          </View>
          <View style={styles.chatBody}>
            {chatResponse ? (
              <View style={[styles.botBubble, { backgroundColor: botBubbleBg, borderColor: borderColor }]}>
                <Text style={styles.botName}>{t('coachSays')}</Text>
                <Text style={[styles.botText, { color: textColorMain }]}>{chatResponse}</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>{t('askAnything')}</Text>
            )}
          </View>
          <View style={[styles.inputRow, { borderTopColor: isDarkMode ? "#374151" : "#F3F4F6" }]}>
            <TextInput 
              style={[styles.chatInput, { backgroundColor: inputBg, borderColor: inputBorderColor, color: isDarkMode ? "#fff" : "#000" }]} 
              placeholder={t('chatPlaceholder')} 
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
          <Text style={[styles.headerTitle, { color: textColorMain }]}>{t('ecoRecs')}</Text>
          <Text style={[styles.headerSub, { color: isDarkMode ? "#10B981" : "#059669" }]}>{t('recSub')}</Text>
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
              {/* Passes the text through our Interceptor! */}
              <Text style={[styles.tipText, { color: textColorSub }]}>{translateRecommendation(tip)}</Text>
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