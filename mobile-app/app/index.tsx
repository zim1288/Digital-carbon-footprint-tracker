import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from "react-native";
import { router } from "expo-router";

import { Ionicons } from '@expo/vector-icons';

import { loginUser, registerUser, verifyOtp, resendOtp, forgotPassword, resetPassword } from "../src/services/api";
import { useAuth } from "../src/context/AuthContext";
import { useLanguage } from "../src/context/LanguageContext";
import { useTheme } from "../src/context/ThemeContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); 
  const [newPassword, setNewPassword] = useState("");

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);

    if (result?.message === "Login successful") {
      login(email);
      router.replace("/(tabs)/tracker");
    } 
    else if (result?.error === "Please verify your email before logging in.") {
      Alert.alert("Verification Needed", "Your email is not verified yet. Please enter your code, or click 'Resend OTP' at the bottom if your code expired.");
      setResendTimer(120); 
      setShowOtpModal(true); 
    } 
    else {
      Alert.alert("Login Failed", result?.error || "Unknown error");
    }
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
    setLoading(false);

    if (result?.message === "Registration initiated. Please check your email for the OTP.") {
      Alert.alert("Check your inbox", "We sent a 6-digit verification code to your email. It will expire in 5 minutes.");
      setResendTimer(120); 
      setShowOtpModal(true);
    } else {
      Alert.alert("Registration Failed", result?.error || "Registration failed");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    const result = await verifyOtp(email, otp);
    setLoading(false);

    if (result?.message === "Email verified successfully! You can now log in.") {
      Alert.alert("Success", "Email verified! You can now log in.");
      setShowOtpModal(false);
      setIsLoginMode(true);
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setResendTimer(0);
    } else {
      Alert.alert("Verification Failed", result?.error || "Invalid OTP code.");
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    const result = await resendOtp(email);
    setLoading(false);

    if (result?.message) {
      Alert.alert("OTP Sent", "A new verification code has been sent to your email.");
      setResendTimer(120); 
      setOtp(""); 
    } else {
      Alert.alert("Error", result?.error || "Failed to resend OTP.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address first.");
      return;
    }
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result?.message) {
      Alert.alert("Code Sent", "Check your email for the password reset code.");
      setForgotStep(2);
    } else {
      Alert.alert("Error", result?.error || "Failed to send reset code.");
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Alert.alert("Error", "Please enter the OTP and a new password.");
      return;
    }
    setLoading(true);
    const result = await resetPassword(email, otp, newPassword);
    setLoading(false);

    if (result?.message === "Password has been reset successfully! You can now log in.") {
      Alert.alert("Success", "Password reset! You can now log in with your new password.");
      setShowForgotModal(false);
      setForgotStep(1);
      setPassword("");
      setNewPassword("");
      setOtp("");
    } else {
      Alert.alert("Error", result?.error || "Failed to reset password.");
    }
  };

  const bgColor = isDarkMode ? "#111827" : "#ffffff";
  const textColorMain = isDarkMode ? "#F9FAFB" : "#111827";
  const textColorSub = isDarkMode ? "#9CA3AF" : "#666666";
  const inputBg = isDarkMode ? "#1F2937" : "#F9FAFB";
  const inputBorder = isDarkMode ? "#374151" : "#E5E7EB";

  return (
    <View style={[styles.loginContainer, { backgroundColor: bgColor }]}>
      <Text style={styles.emojiLogo}>🌍</Text>
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
          keyboardType="email-address"
        />
        
        <View style={[
          styles.passwordContainer,
          {
            backgroundColor: inputBg,
            borderColor: inputBorder,
            marginBottom: isLoginMode ? 5 : 15
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

        {isLoginMode && (
          <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 20, marginTop: 5 }} onPress={() => setShowForgotModal(true)}>
            <Text style={{ color: "#10B981", fontWeight: "600" }}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

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
              secureTextEntry 
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
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginBtnText}>
            {isLoginMode ? t('login') : t('signUp')}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 25, alignItems: "center" }} onPress={() => setIsLoginMode(!isLoginMode)}>
        <Text style={{ color: "#10B981", fontSize: 16, fontWeight: "600" }}>
          {isLoginMode ? t('dontHaveAccount') : t('alreadyHaveAccount')}
        </Text>
      </TouchableOpacity>

      {/* OTP REGISTRATION MODAL */}
      <Modal visible={showOtpModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: inputBg, borderColor: inputBorder }]}>
            <Ionicons name="mail-unread-outline" size={50} color="#10B981" style={{ marginBottom: 15 }} />
            <Text style={[styles.modalTitle, { color: textColorMain }]}>Verify Your Email</Text>
            <Text style={[styles.modalSub, { color: textColorSub }]}>
              Enter the 6-digit code sent to {email}
            </Text>
            
            <TextInput
              style={[styles.otpInput, { backgroundColor: bgColor, color: textColorMain, borderColor: inputBorder }]}
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              placeholderTextColor="#999"
            />
            
            <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyBtnText}>Verify Account</Text>}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={{ color: textColorSub, fontSize: 14 }}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResendOtp} disabled={resendTimer > 0 || loading}>
                <Text style={{ color: resendTimer > 0 ? "#9CA3AF" : "#10B981", fontWeight: "bold", fontSize: 14 }}>
                  {resendTimer > 0 ? `Resend in ${formatTime(resendTimer)}` : "Resend OTP"}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={{ marginTop: 25 }} onPress={() => setShowOtpModal(false)}>
              <Text style={{ color: "#EF4444", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FORGOT PASSWORD MODAL */}
      <Modal visible={showForgotModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: inputBg, borderColor: inputBorder }]}>
            <Ionicons name="lock-closed-outline" size={50} color="#10B981" style={{ marginBottom: 15 }} />
            <Text style={[styles.modalTitle, { color: textColorMain }]}>Reset Password</Text>
            
            {forgotStep === 1 ? (
              <>
                <Text style={[styles.modalSub, { color: textColorSub }]}>
                  Enter your email address to receive a password reset code.
                </Text>
                <TextInput
                  style={[styles.input, { width: "100%", backgroundColor: bgColor, borderColor: inputBorder, color: textColorMain }]}
                  placeholder={t('email')}
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity style={styles.verifyBtn} onPress={handleForgotPassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyBtnText}>Send Reset Code</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.modalSub, { color: textColorSub }]}>
                  Enter the 6-digit code sent to your email and create a new password.
                </Text>
                <TextInput
                  style={[styles.otpInput, { backgroundColor: bgColor, color: textColorMain, borderColor: inputBorder, marginBottom: 15, fontSize: 24, letterSpacing: 8 }]}
                  placeholder="000000"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={[styles.input, { width: "100%", backgroundColor: bgColor, borderColor: inputBorder, color: textColorMain }]}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.verifyBtn} onPress={handleResetPassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyBtnText}>Save New Password</Text>}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={{ marginTop: 25 }} onPress={() => { setShowForgotModal(false); setForgotStep(1); setOtp(""); setNewPassword(""); }}>
              <Text style={{ color: "#EF4444", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  loginBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "100%", padding: 30, borderRadius: 20, alignItems: "center", borderWidth: 1 },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  modalSub: { fontSize: 14, textAlign: "center", marginBottom: 20, lineHeight: 20 },
  otpInput: { width: "80%", fontSize: 32, letterSpacing: 10, textAlign: "center", padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  verifyBtn: { backgroundColor: "#10B981", width: "100%", padding: 15, borderRadius: 12, alignItems: "center" },
  verifyBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  resendContainer: { flexDirection: "row", marginTop: 25, alignItems: "center", justifyContent: "center" }
});