import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';

// --- Constants & Config ---
const API_BASE_URL = 'http://192.168.0.153:5000/auth'; 

const COLORS = {
  primary: '#10B981', 
  primaryDark: '#059669',
  background: '#F4FDF8',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

type AuthState = 'LOGIN' | 'REGISTER' | 'VERIFY_OTP' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

export default function AuthScreen() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<AuthState>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const navigateTo = (screen: AuthState) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setCurrentScreen(screen);
      setOtp(''); 
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  // --- API Methods ---

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Missing credentials');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.replace('/(tabs)/tracker'); // Immediate Redirect
      } else {
        Alert.alert('Login Failed', data.error);
        if (data.error?.includes("verify")) navigateTo('VERIFY_OTP');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Check your connection to 192.168.0.153');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Verify Account', data.message);
        setResendTimer(120);
        navigateTo('VERIFY_OTP');
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (err) { Alert.alert('Network Error', 'Server unreachable'); }
    finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (res.ok) {
        Alert.alert('Success', 'Email verified!');
        navigateTo('LOGIN');
      } else {
        const data = await res.json();
        Alert.alert('Failed', data.error);
      }
    } catch (err) { Alert.alert('Error', 'Connection failed'); }
    finally { setIsLoading(false); }
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { navigateTo('RESET_PASSWORD'); }
      else { Alert.alert('Error', 'Email not found'); }
    } catch (err) { Alert.alert('Error', 'Server error'); }
    finally { setIsLoading(false); }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      if (res.ok) {
        Alert.alert('Success', 'Password updated!');
        navigateTo('LOGIN');
      } else { Alert.alert('Error', 'Reset failed'); }
    } catch (err) { Alert.alert('Error', 'Connection failed'); }
    finally { setIsLoading(false); }
  };

  // --- UI Components ---

  const OTPInput = () => (
    <View style={styles.otpContainer}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.otpBoxesContainer}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.otpBox, otp.length === i && styles.otpBoxActive]}>
              <Text style={styles.otpText}>{otp[i] || ''}</Text>
            </View>
          ))}
        </View>
      </TouchableWithoutFeedback>
      <TextInput
        value={otp}
        onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="numeric"
        style={styles.hiddenOTPInput}
        autoFocus
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.logo}>🌍 EcoBit</Text>
            <Text style={styles.subtitle}>Track, Reduce, Sustain</Text>
          </View>

          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            {currentScreen === 'LOGIN' && (
              <>
                <Text style={styles.title}>Welcome Back</Text>
                <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
                <TouchableOpacity onPress={() => navigateTo('FORGOT_PASSWORD')} style={styles.rightAlign}><Text style={styles.link}>Forgot Password?</Text></TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Log In</Text>}</TouchableOpacity>
                <View style={styles.footer}><Text>New here? </Text><TouchableOpacity onPress={() => navigateTo('REGISTER')}><Text style={styles.linkBold}>Sign Up</Text></TouchableOpacity></View>
              </>
            )}

            {currentScreen === 'REGISTER' && (
              <>
                <Text style={styles.title}>Create Account</Text>
                <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}><Text style={styles.btnText}>Sign Up</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => navigateTo('LOGIN')} style={styles.center}><Text style={styles.link}>Back to Login</Text></TouchableOpacity>
              </>
            )}

            {currentScreen === 'VERIFY_OTP' && (
              <>
                <Text style={styles.title}>Verify Email</Text>
                <OTPInput />
                <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={otp.length !== 6}><Text style={styles.btnText}>Verify</Text></TouchableOpacity>
              </>
            )}

            {currentScreen === 'FORGOT_PASSWORD' && (
              <>
                <Text style={styles.title}>Reset Request</Text>
                <TextInput style={styles.input} placeholder="Account Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                <TouchableOpacity style={styles.button} onPress={handleForgotPassword}><Text style={styles.btnText}>Send Code</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => navigateTo('LOGIN')} style={styles.center}><Text style={styles.link}>Cancel</Text></TouchableOpacity>
              </>
            )}

            {currentScreen === 'RESET_PASSWORD' && (
              <>
                <Text style={styles.title}>New Password</Text>
                <OTPInput />
                <TextInput style={[styles.input, {marginTop: 20}]} placeholder="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
                <TouchableOpacity style={styles.button} onPress={handleResetPassword}><Text style={styles.btnText}>Update Password</Text></TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flex: 1, justifyContent: 'center', padding: 25 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 40, fontWeight: '800', color: COLORS.primary },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 5 },
  card: { backgroundColor: COLORS.surface, padding: 30, borderRadius: 25, elevation: 8 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 25, textAlign: 'center' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 15, marginBottom: 15 },
  button: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: COLORS.primaryDark, fontWeight: '600' },
  linkBold: { color: COLORS.primary, fontWeight: '700' },
  rightAlign: { alignItems: 'flex-end', marginBottom: 15 },
  center: { alignItems: 'center', marginTop: 20 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  otpContainer: { alignItems: 'center' },
  otpBoxesContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  otpBox: { width: 42, height: 50, borderWidth: 2, borderColor: COLORS.border, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  otpBoxActive: { borderColor: COLORS.primary },
  otpText: { fontSize: 22, fontWeight: '700' },
  hiddenOTPInput: { position: 'absolute', opacity: 0, width: 1 },
});