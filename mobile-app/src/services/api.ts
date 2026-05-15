// ⚠️ IMPORTANT: Set EXPO_PUBLIC_API_URL in your .env file, fallback is the local IP
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.153:5000"; 

// ==========================================
// AUTHENTICATION
// ==========================================

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || "Wrong email or password." };
    }
    return await response.json();
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return { error: "Network Request Failed" };
  }
};

export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || "Registration failed. Please try again." };
    }
    return await response.json();
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return { error: "Network Request Failed" };
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || "Verification failed. Please try again." };
    }
    return await response.json();
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return { error: "Network Request Failed" };
  }
};

export const resendOtp = async (email: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || "Failed to resend OTP." };
    }
    return await response.json();
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    return { error: "Network Request Failed" };
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || "Failed to send reset code." };
    }
    return await response.json();
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return { error: "Network Request Failed" };
  }
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, new_password: newPassword }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || "Failed to reset password." };
    }
    return await response.json();
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return { error: "Network Request Failed" };
  }
};

// ==========================================
// ACTIVITY LOGGING & ANALYTICS
// ==========================================

export const addActivity = async (user_email: string, activity_type: string, duration_minutes: number, data_used_mb: number) => {
  try {
    const response = await fetch(`${BASE_URL}/activity/add-activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email, activity_type, duration_minutes, data_used_mb })
    });
    if (!response.ok) return { error: await response.text() };
    return await response.json();
  } catch (error) { return { error: "Network error" }; }
};

export const logDailyUsage = async (user_email: string, usage: any) => {
  try {
      const response = await fetch(`${BASE_URL}/activity/log-daily`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_email, usage })
      });
      if (!response.ok) return { error: await response.text() };
      return await response.json();
  } catch (error) { return { error: "Network error" }; }
};

export const getDashboardData = async (email: string) => {
  try {
    const response = await fetch(`${BASE_URL}/analytics/dashboard/${email}`);
    if (!response.ok) return null; 
    return await response.json();
  } catch (error) { return null; }
};

export const getRecommendations = async (email: string) => {
  try {
    const response = await fetch(`${BASE_URL}/ml/recommendation/${email}`);
    if (!response.ok) return { recommendations: [] };
    return await response.json();
  } catch (error) { return { recommendations: [] }; }
};

export const getMostCarbonActivity = async (email: string) => {
  try {
    const response = await fetch(`${BASE_URL}/analytics/most-carbon-activity/${email}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) { return null; }
};

export const getTodayUsage = async (email: string) => {
  try {
      const response = await fetch(`${BASE_URL}/analytics/today-usage/${email}`);
      if (!response.ok) return null;
      return await response.json();
  } catch (error) { return null; }
};

export const getTodayBreakdown = async (email: string) => {
  try {
      const response = await fetch(`${BASE_URL}/analytics/today-breakdown/${email}`);
      if (!response.ok) return [];
      return await response.json();
  } catch (error) { return []; }
};

export const getWeeklyHistory = async (email: string) => {
  try {
      const response = await fetch(`${BASE_URL}/analytics/weekly-history/${email}`);
      if (!response.ok) return null;
      return await response.json();
  } catch (error) { return null; }
};

export const getAiAnalysis = async (usage: any, totalEmissions: number) => {
  try {
    const response = await fetch(`${BASE_URL}/ml/analyze-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usage, total_emissions: totalEmissions })
    });
    if (!response.ok) return { error: "Failed to get analysis" };
    return await response.json();
  } catch (error) { return { error: "Network error" }; }
};

export const askEcoCoach = async (message: string) => {
  try {
    const response = await fetch(`${BASE_URL}/ml/ask-coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!response.ok) return { error: "Failed to get response" };
    return await response.json();
  } catch (error) { return { error: "Network error" }; }
};