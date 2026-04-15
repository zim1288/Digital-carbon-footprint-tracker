import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router"; 
import { loginUser, registerUser } from "../src/services/api";

// IMPORT OUR NEW AUTH HOOK
import { useAuth } from "../src/context/AuthContext";

export default function LoginScreen() {
  // Start with empty strings instead of forhad@gmail.com!
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); 
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);

  // Grab the login function from our global context
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    const result = await loginUser(email, password);
    
    if (result?.message === "Login successful") {
      // SAVE THE EMAIL TO GLOBAL MEMORY!
      login(email); 
      // Navigates securely into the tabs
      router.replace("/(tabs)/tracker"); 
    } else {
      Alert.alert("Login Failed", result?.error || "Unknown error");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    setLoading(true);
    const result = await registerUser(name, email, password);
    
    if (result?.message === "User registered successfully") {
      Alert.alert("Success", "Registration successful! Please log in.");
      setIsLoginMode(true);
    } else {
      Alert.alert("Registration Failed", result?.error || "Registration failed");
    }
    setLoading(false);
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address first.");
      return;
    }
    Alert.alert("Reset Password", `A password recovery link has been sent to ${email}.`);
  };

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.emojiLogo}>🌿</Text>
      <Text style={styles.loginHeader}>EcoBit</Text>
      <Text style={styles.loginSubheader}>
        {isLoginMode ? "Monitor your digital carbon footprint" : "Create an account"}
      </Text>

      <View style={styles.inputWrapper}>
        {!isLoginMode && (
          <TextInput
            style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} placeholderTextColor="#999"
          />
        )}
        <TextInput
          style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} placeholderTextColor="#999" autoCapitalize="none"
        />
        <TextInput
          style={styles.input} placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={isLoginMode ? handleLogin : handleRegister}>
        <Text style={styles.loginBtnText}>{loading ? "Please wait..." : (isLoginMode ? "Login" : "Sign Up")}</Text>
      </TouchableOpacity>

      {isLoginMode && (
        <TouchableOpacity style={{ marginTop: 15, alignItems: "center" }} onPress={handleForgotPassword}>
          <Text style={{ color: "#6B7280", fontSize: 14 }}>Forgot Password?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={{ marginTop: 25, alignItems: "center" }} onPress={() => setIsLoginMode(!isLoginMode)}>
        <Text style={{ color: "#10B981", fontSize: 16, fontWeight: "600" }}>
          {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, justifyContent: "center", padding: 30, backgroundColor: "#fff" },
  emojiLogo: { fontSize: 60, textAlign: "center", marginBottom: 10 },
  loginHeader: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: "#059669" },
  loginSubheader: { fontSize: 16, textAlign: "center", color: "#666", marginBottom: 40 },
  inputWrapper: { marginBottom: 30 },
  input: { backgroundColor: "#F9FAFB", padding: 20, borderRadius: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  loginBtn: { backgroundColor: "#059669", padding: 18, borderRadius: 12, alignItems: "center" },
  loginBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});