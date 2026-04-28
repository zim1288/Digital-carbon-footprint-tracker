import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { PieChart, BarChart } from "react-native-gifted-charts"; 
import { Ionicons } from '@expo/vector-icons';
import { getWeeklyHistory, getAiAnalysis, getTodayBreakdown } from "../../src/services/api";

// Import our contexts
import { useTheme } from "../../src/context/ThemeContext";
import { useAuth } from "../../src/context/AuthContext";
// Import language context
import { useLanguage } from "../../src/context/LanguageContext";

const screenWidth = Dimensions.get("window").width;

// NEW HELPER: Converts 123 to ১-২-৩ 
const convertNumberToBengali = (numStr: string | number) => {
  const bngMap: any = { '0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯' };
  return numStr.toString().replace(/[0-9]/g, (match) => bngMap[match]);
};

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const { userEmail } = useAuth(); 
  
  // Grab translation function AND the current language state
  const { t, language } = useLanguage();

  // FIXED: Removed unused 'usage' state variables
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [selectedSlice, setSelectedSlice] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const { isDarkMode } = useTheme();

  // FIXED: Wrapped in useCallback and properly included in the dependency array
  const fetchAnalyticsData = useCallback(async () => {
    if (!userEmail) return;
    const [weeklyRes, breakdownRes] = await Promise.all([ 
      getWeeklyHistory(userEmail),
      getTodayBreakdown(userEmail)
    ]);
    
    if (weeklyRes) setWeeklyData(weeklyRes);
    if (breakdownRes) setPieChartData(breakdownRes);
    
    setLoading(false);
  }, [userEmail]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const totalEmissions = pieChartData.reduce((sum, item) => sum + item.emissions, 0);

  const handleAnalyzeUsage = async () => {
    setIsAnalyzing(true);
    const detailedUsage: Record<string, string> = {};
    pieChartData.forEach(item => {
      detailedUsage[item.name] = `${item.emissions}g`;
    });

    const result = await getAiAnalysis(detailedUsage, totalEmissions);
    if (result?.analysis) setAiAnalysis(result.analysis);
    else setAiAnalysis("Could not generate analysis. Please try again.");
    setIsAnalyzing(false);
  };

  const bgColor = isDarkMode ? "#111827" : "#F3F4F6";
  const cardBg = isDarkMode ? "#1F2937" : "#ffffff";
  const textColorMain = isDarkMode ? "#F9FAFB" : "#374151"; 
  const chartLabelColor = isDarkMode ? "#9CA3AF" : "#6B7280";
  const aiCardBg = isDarkMode ? "#3730A3" : "#4F46E5";
  const tooltipBg = isDarkMode ? "#1F2937" : "#ffffff";

  const formattedPieData = pieChartData.map(item => ({
    value: item.emissions,
    color: item.color,
    name: item.name, 
  }));

  const formattedBarData = weeklyData.length > 0 ? weeklyData.map(d => ({
    value: d.emissions,
    label: t(d.day as any), // Translates the day!
    frontColor: '#10B981', 
  })) : [
    {value: 0, label: t('Mon')}, {value: 0, label: t('Tue')}, {value: 0, label: t('Wed')}, 
    {value: 0, label: t('Thu')}, {value: 0, label: t('Fri')}, {value: 0, label: t('Sat')}, {value: 0, label: t('Sun')}
  ];

  if (loading) return ( <View style={[styles.centerContainer, { backgroundColor: bgColor }]}><ActivityIndicator size="large" color="#10B981" /></View> );

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={{ paddingBottom: 40, paddingTop: 50 }} showsVerticalScrollIndicator={false}>
      
      {/* AI ANALYSIS CARD */}
      <View style={[styles.aiCard, { backgroundColor: aiCardBg }]}>
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={20} color="#FDE047" />
          <Text style={styles.aiTitle}>{t('aiTitle')}</Text>
        </View>
        {aiAnalysis ? (
          <View style={styles.aiResultBox}>
            <Text style={styles.aiResultText}>{aiAnalysis}</Text>
          </View>
        ) : (
          <Text style={styles.aiSubText}>{t('aiDesc')}</Text>
        )}
        <TouchableOpacity style={styles.aiBtn} onPress={handleAnalyzeUsage} disabled={isAnalyzing}>
          {isAnalyzing ? <ActivityIndicator color="#4F46E5" /> : <Text style={[styles.aiBtnText, { color: aiCardBg }]}>{t('analyzeBtn')}</Text>}
        </TouchableOpacity>
      </View>

      {/* TODAY'S EMISSIONS (DONUT CHART) */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.cardTitle, { color: textColorMain }]}>{t('sourceEmissions')}</Text>
        {formattedPieData.length > 0 ? (
          
          <View 
            style={styles.chartWrapper}
            onTouchEnd={(e) => {
              setTooltipPos({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY });
            }}
          >
            <PieChart
              donut={true}
              innerRadius={82}       
              radius={110}
              data={formattedPieData}
              innerCircleColor={cardBg}
              strokeColor={cardBg}
              strokeWidth={7}        
              backgroundColor="transparent"
              focusOnPress={false}   
              onPress={(item: any) => {
                if (selectedSlice && selectedSlice.name === item.name) {
                  setSelectedSlice(null);
                } else {
                  setSelectedSlice(item);
                }
              }}
            />

            {selectedSlice && (
              <View 
                style={[
                  styles.floatingTooltip, 
                  { 
                    backgroundColor: tooltipBg, borderColor: isDarkMode ? '#4B5563' : '#D1D5DB', 
                    top: tooltipPos.y < 90 ? tooltipPos.y + 20 : tooltipPos.y - 50, 
                    left: tooltipPos.x > (screenWidth / 2) ? tooltipPos.x - 140 : tooltipPos.x + 20, 
                  }
                ]}
              >
                <Text style={{ color: textColorMain, fontSize: 13, fontWeight: '500', letterSpacing: 0.3 }}>
                  {/* Translates pie chart tooltip numbers */}
                  {selectedSlice.name} : {language === 'bn' ? convertNumberToBengali(selectedSlice.value) : selectedSlice.value}
                </Text>
              </View>
            )}

            <View style={styles.legendContainer}>
              {pieChartData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                  <Text style={[styles.legendText, { color: textColorMain }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>{t('noData')}</Text>
        )}
      </View>

      {/* WEEKLY TREND (BAR CHART) */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.cardTitle, { color: textColorMain }]}>{t('weeklyTrend')}</Text>
        <View style={{ marginTop: 20 }}>
          {(() => {
            const maxEmission = Math.max(...formattedBarData.map(d => d.value));
            const chartMaxValue = maxEmission > 0 ? maxEmission * 1.2 : 100; 

            return (
              <BarChart
                data={formattedBarData}
                barWidth={28}
                spacing={18}
                barBorderRadius={4} 
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: chartLabelColor, fontSize: 11 }}
                xAxisLabelTextStyle={{ color: chartLabelColor, fontSize: 11 }}
                noOfSections={4}
                maxValue={chartMaxValue} 
                isAnimated
                hideRules
                // THIS FIXES THE Y-AXIS NUMBERS (315, 630, 945...)
                formatYLabel={(label) => language === 'bn' ? convertNumberToBengali(label) : label}
                renderTooltip={(item: any) => {
                  const isTallBar = maxEmission > 0 && item.value > maxEmission * 0.8;

                  return (
                    <View 
                      style={[
                        styles.barTooltip, 
                        { 
                          backgroundColor: tooltipBg, borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                          top: isTallBar ? 30 : -10, alignItems: 'center', minWidth: 60
                        }
                      ]}
                    >
                      <Text style={{ color: chartLabelColor, fontSize: 11, marginBottom: 2 }}>{item.label}</Text>
                      {/* Translates bar tooltip numbers */}
                      <Text style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold' }}>
                        {language === 'bn' ? convertNumberToBengali(item.value) : item.value}g
                      </Text>
                    </View>
                  );
                }}
              />
            );
          })()}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { padding: 20, borderRadius: 16, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: "600", marginBottom: 20, textAlign: "center" },
  chartWrapper: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  floatingTooltip: { position: 'absolute', paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6, zIndex: 1000 },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 30, gap: 15, paddingHorizontal: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, maxWidth: '45%' },
  legendColorBox: { width: 12, height: 12, borderRadius: 2 },
  legendText: { fontSize: 13, fontWeight: "500" },
  barTooltip: { marginBottom: 5, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  emptyText: { textAlign: "center", color: "#9CA3AF", fontStyle: "italic", marginVertical: 20 },
  aiCard: { padding: 20, borderRadius: 16, marginBottom: 15, shadowColor: "#4F46E5", shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  aiTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  aiSubText: { color: "#E0E7FF", fontSize: 14, marginBottom: 15, lineHeight: 20 },
  aiResultBox: { backgroundColor: "rgba(255,255,255,0.1)", padding: 15, borderRadius: 12, marginBottom: 15 },
  aiResultText: { color: "#fff", fontSize: 14, lineHeight: 22 },
  aiBtn: { backgroundColor: "#fff", padding: 14, borderRadius: 10, alignItems: "center" },
  aiBtnText: { fontWeight: "bold", fontSize: 16 },
});