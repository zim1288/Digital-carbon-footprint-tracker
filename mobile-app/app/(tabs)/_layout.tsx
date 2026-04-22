// app/(tabs)/_layout.tsx
import { Tabs, router } from 'expo-router';
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';

// Import our Contexts
import { useTheme } from '../../src/context/ThemeContext'; 
import { useLanguage } from '../../src/context/LanguageContext';

const { width } = Dimensions.get("window");

// ==========================================
// 1. THE GLOBAL HEADER & SIDE DRAWER MENU
// ==========================================
const GlobalHeader = ({ title }: { title: string }) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current; 
  
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const openMenu = () => {
    setIsSettingsVisible(true);
    Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, { toValue: width, duration: 300, useNativeDriver: true }).start(() => setIsSettingsVisible(false));
  };

  const handleLogout = () => {
    closeMenu();
    setTimeout(() => router.replace('/'), 300); 
  };

  const handleManualLog = () => {
    closeMenu();
    setTimeout(() => router.push('/manual-log'), 300); 
  };

  const headerBg = isDarkMode ? "#064E3B" : "#059669";
  const drawerBg = isDarkMode ? "#111827" : "#F4FDF8";
  const textColor = isDarkMode ? "#F9FAFB" : "#374151";
  const itemBg = isDarkMode ? "#1F2937" : "#fff";

  return (
    <>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.headerContent}>
          <Ionicons name="leaf" size={24} color="#D1FAE5" />
          <Text style={styles.headerText}>EcoBit {title}</Text>
        </View>
        <TouchableOpacity onPress={openMenu}>
          <Ionicons name="ellipsis-vertical" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal visible={isSettingsVisible} transparent={true} animationType="none" onRequestClose={closeMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <View style={styles.drawerWrapper}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Animated.View style={[styles.sideMenu, { backgroundColor: drawerBg, transform: [{ translateX: slideAnim }] }]}>
                
                <View style={[styles.menuHeaderBox, { backgroundColor: headerBg }]}>
                  <View>
                    <Text style={styles.modalTitle}>{t('menuTitle')}</Text>
                    <Text style={styles.modalSubtitle}>{t('menuSubtitle')}</Text>
                  </View>
                  <TouchableOpacity onPress={closeMenu} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={headerBg} />
                  </TouchableOpacity>
                </View>

                <View style={styles.menuItemsContainer}>
                  <TouchableOpacity style={[styles.menuItem, { backgroundColor: itemBg }]} onPress={handleManualLog}>
                    <View style={styles.iconBox}><Ionicons name="add" size={22} color="#10B981" /></View>
                    <Text style={[styles.menuText, { color: textColor }]}>{t('manualLog')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.menuItem, { backgroundColor: itemBg }]} onPress={toggleDarkMode}>
                    <View style={styles.iconBox}>
                      <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color="#10B981" />
                    </View>
                    <Text style={[styles.menuText, { color: textColor }]}>
                      {isDarkMode ? t('lightMode') : t('darkMode')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.menuItem, { backgroundColor: itemBg }]} onPress={toggleLanguage}>
                    <View style={styles.iconBox}><Ionicons name="language" size={22} color="#10B981" /></View>
                    <Text style={[styles.menuText, { color: textColor }]}>{t('language')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.menuItem, { backgroundColor: itemBg }]} onPress={() => {
                    closeMenu();
                    setTimeout(() => router.push('/modal'), 300); 
                  }}>
                    <View style={styles.iconBox}><Ionicons name="information-circle" size={22} color="#10B981" /></View>
                    <Text style={[styles.menuText, { color: textColor }]}>{t('aboutUs')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 20 }}>
                  <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    <Text style={styles.logoutText}>{t('logOut')}</Text>
                  </TouchableOpacity>
                </View>

              </Animated.View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

// ==========================================
// 2. THE TABS CONFIGURATION
// ==========================================
export default function TabLayout() {
  const { isDarkMode } = useTheme();
  // Bring the translator into the tabs!
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10B981', 
        tabBarInactiveTintColor: isDarkMode ? '#6B7280' : '#9CA3AF', 
        tabBarButton: HapticTab,
        header: ({ options }) => <GlobalHeader title={options.title || 'App'} />,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? '#374151' : '#F3F4F6',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        }
      }}>
      
      <Tabs.Screen
        name="tracker"
        options={{
          title: t('tabTracker'), // Dynamically Translated
          tabBarIcon: ({ color }) => <Ionicons size={24} name="trending-up" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('tabAnalysis'), // Dynamically Translated
          tabBarIcon: ({ color }) => <Ionicons size={24} name="pie-chart" color={color} />,
        }}
      />

      <Tabs.Screen
        name="tips"
        options={{
          title: t('tabTips'), // Dynamically Translated
          tabBarIcon: ({ color }) => <Ionicons size={24} name="leaf" color={color} />,
        }}
      />
    </Tabs>
  );
}

// ==========================================
// 3. GLOBAL STYLES
// ==========================================
const styles = StyleSheet.create({
  header: { paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 5, zIndex: 10 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "bold", letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  drawerWrapper: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
  sideMenu: { width: width * 0.80, height: "100%", borderTopLeftRadius: 30, borderBottomLeftRadius: 30, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 20, elevation: 25, overflow: "hidden" },
  menuHeaderBox: { padding: 25, paddingTop: 60, paddingBottom: 30, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  modalSubtitle: { fontSize: 14, color: "#D1FAE5", marginTop: 4 },
  closeBtn: { backgroundColor: "#D1FAE5", padding: 6, borderRadius: 50 },
  menuItemsContainer: { padding: 20, marginTop: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 15, padding: 15, borderRadius: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  iconBox: { backgroundColor: "#ECFDF5", padding: 8, borderRadius: 12 },
  menuText: { fontSize: 16, fontWeight: "600" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 20, padding: 16, borderRadius: 16, backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" },
  logoutText: { color: "#EF4444", fontWeight: "bold", fontSize: 16 }
});