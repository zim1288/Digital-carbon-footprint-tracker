import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router"; 
import { Ionicons } from '@expo/vector-icons'; 
import { loginUser, registerUser } from "../src/services/api";

import { useAuth } from "../src/context/AuthContext";
import { useLanguage } from "../src/context/LanguageContext";
import { useTheme } from "../src/context/ThemeContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [name, setName] = useState(""); 
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false); 

  const { login } = useAuth();
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    const result = await loginUser(email, password);
    
    if (result?.message === "Login successful") {
      login(email); 
      router.replace("/(tabs)/tracker"); 
    } else {
      Alert.alert("Login Failed", result?.error || "Unknown error");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    setLoading(true);
    const result = await registerUser(name, email, password);
    
    if (result?.message === "User registered successfully") {
      Alert.alert("Success", "Registration successful! Please log in.");
      setIsLoginMode(true);
      setPassword("");
      setConfirmPassword("");
    } else {
      Alert.alert("Registration Failed", result?.error || "Registration failed");
    }
    setLoading(false);
  };

  const bgColor = isDarkMode ? "#111827" : "#ffffff";
  const textColorMain = isDarkMode ? "#F9FAFB" : "#111827";
  const textColorSub = isDarkMode ? "#9CA3AF" : "#666666";
  const inputBg = isDarkMode ? "#1F2937" : "#F9FAFB";
  const inputBorder = isDarkMode ? "#374151" : "#E5E7EB";

  return (
    <View style={[styles.loginContainer, { backgroundColor: bgColor }]}>
      <Text style={styles.emojiLogo}>🌿</Text>
      <Text style={styles.loginHeader}>EcoBit</Text>
      <Text style={[styles.loginSubheader, { color: textColorSub }]}>
        {isLoginMode ? t('monitorFootprint') : t('createAccount')}
      </Text>

      <View style={styles.inputWrapper}>
        {!isLoginMode && (
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColorMain }]} 
            placeholder={t('fullName')} 
            value={name} 
            onChangeText={setName} 
            placeholderTextColor="#999"
          />
        )}
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColorMain }]} 
          placeholder={t('email')} 
          value={email} 
          onChangeText={setEmail} 
          placeholderTextColor="#999" 
          autoCapitalize="none"
        />
        
        {/* Main Password Field with Eye Toggle */}
        <View style={[
          styles.passwordContainer, 
          { 
            backgroundColor: inputBg, 
            borderColor: inputBorder, 
            marginBottom: isLoginMode ? 15 : 15
          }
        ]}>
          <TextInput
            style={[styles.passwordInput, { color: textColorMain }]} 
            placeholder={t('password')} 
            value={password} 
            secureTextEntry={!showPassword} 
            onChangeText={setPassword} 
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            style={styles.eyeButton} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={textColorSub} />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Field without Eye Toggle */}
        {!isLoginMode && (
          <View style={[
            styles.passwordContainer, 
            { 
              backgroundColor: inputBg, 
              borderColor: inputBorder, 
              marginBottom: 5 
            }
          ]}>
            <TextInput
              style={[styles.passwordInput, { color: textColorMain }]} 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              secureTextEntry // This makes it permanently hidden
              onChangeText={setConfirmPassword} 
              placeholderTextColor="#999"
            />
          </View>
        )}
        
        {!isLoginMode && (
          <Text style={[styles.passwordHint, { color: textColorSub }]}>
            Password must be 8+ characters with an uppercase letter, lowercase letter, number, and special character (!@#$).
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={isLoginMode ? handleLogin : handleRegister}>
        <Text style={styles.loginBtnText}>
          {loading ? t('pleaseWait') : (isLoginMode ? t('login') : t('signUp'))}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 25, alignItems: "center" }} onPress={() => setIsLoginMode(!isLoginMode)}>
        <Text style={{ color: "#10B981", fontSize: 16, fontWeight: "600" }}>
          {isLoginMode ? t('dontHaveAccount') : t('alreadyHaveAccount')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, justifyContent: "center", padding: 30 },
  emojiLogo: { fontSize: 60, textAlign: "center", marginBottom: 10 },
  loginHeader: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: "#059669" },
  loginSubheader: { fontSize: 16, textAlign: "center", marginBottom: 40 },
  inputWrapper: { marginBottom: 30 },
  input: { padding: 20, borderRadius: 12, marginBottom: 15, fontSize: 16, borderWidth: 1 },
  
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12 },
  passwordInput: { flex: 1, paddingVertical: 20, paddingLeft: 20, fontSize: 16 },
  eyeButton: { padding: 15 },
  
  passwordHint: { fontSize: 12, marginTop: -5, marginBottom: 15, paddingHorizontal: 5, lineHeight: 18 },
  loginBtn: { backgroundColor: "#059669", padding: 18, borderRadius: 12, alignItems: "center" },
  loginBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});