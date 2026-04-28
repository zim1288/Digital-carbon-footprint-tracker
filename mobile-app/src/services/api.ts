// ⚠️ IMPORTANT: Set EXPO_PUBLIC_API_URL in your .env file, fallback is the local IP
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.153:5000"; 

// ==========================================
// AUTHENTICATION
// ==========================================

// 1. Login Function
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        // Parse the JSON error instead of raw text
        const errorData = await response.json();
        return { error: errorData.error || "Wrong email or password." };
    }
    return await response.json();
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return { error: "Network Request Failed" };
  }
};

// 2. Register Function
export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        // Parse the JSON error instead of raw text
        const errorData = await response.json();
        return { error: errorData.error || "Registration failed. Please try again." };
    }
    return await response.json();
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return { error: "Network Request Failed" };
  }
};

// ==========================================
// ACTIVITY LOGGING
// ==========================================

// 3. Add Single Activity (Used in Explore Tab / Manual Entry)
export const addActivity = async (
  user_email: string,
  activity_type: string,
  duration_minutes: number,
  data_used_mb: number
) => {
  try {
    const response = await fetch(`${BASE_URL}/activity/add-activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email, activity_type, duration_minutes, data_used_mb })
    });

    if (!response.ok) {
      const text = await response.text();
      return { error: text };
    }
    return await response.json();
  } catch (error) {
    console.error("Add Activity API Error:", error);
    return { error: "Network error" };
  }
};

// 4. Log Daily Usage (Used for the Sliders)
export const logDailyUsage = async (user_email: string, usage: any) => {
  try {
      const response = await fetch(`${BASE_URL}/activity/log-daily`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_email, usage })
      });
      
      if (!response.ok) {
          const text = await response.text();
          return { error: text };
      }
      return await response.json();
  } catch (error) {
      console.error("Log Daily Error:", error);
      return { error: "Network error" };
  }
};

// ==========================================
// ANALYTICS & DATA RETRIEVAL
// ==========================================

// 5. Dashboard Data Function (Original)
export const getDashboardData = async (email: string) => {
  try {
    const response = await fetch(`${BASE_URL}/analytics/dashboard/${email}`);
    if (!response.ok) return null; 
    return await response.json();
  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error); // FIXED: Logged the error
    return null;
  }
};

// 6. Get Recommendations (Original)
export const getRecommendations = async (email: string) => {
  try {
    const response = await fetch(`${BASE_URL}/ml/recommendation/${email}`);
    if (!response.ok) return { recommendations: [] };
    return await response.json();
  } catch (error) {
    console.error("Recommendations Fetch Error:", error); // FIXED: Logged the error
    return { recommendations: [] };
  }
};

// 7. Get Most Carbon Producing Activity (Original)
export const getMostCarbonActivity = async (email: string) => {
  try {
    const response = await fetch(`${BASE_URL}/analytics/most-carbon-activity/${email}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Most Carbon Activity Fetch Error:", error); // FIXED: Logged the error
    return null;
  }
};

// 8. Get Today's Slider Usage (For the Tracker Tab)
export const getTodayUsage = async (email: string) => {
  try {
      const response = await fetch(`${BASE_URL}/analytics/today-usage/${email}`);
      if (!response.ok) return null;
      return await response.json();
  } catch (error) {
      console.error("Today Usage Fetch Error:", error); // FIXED: Logged the error
      return null;
  }
};

// 9. NEW: Get Today's Complete Breakdown (Sliders + Manual) for Pie Chart
export const getTodayBreakdown = async (email: string) => {
  try {
      const response = await fetch(`${BASE_URL}/analytics/today-breakdown/${email}`);
      if (!response.ok) return [];
      return await response.json();
  } catch (error) {
      console.error("Today Breakdown Fetch Error:", error); // FIXED: Logged the error
      return [];
  }
};

// 10. Get Weekly History (Formatted for Recharts Bar Chart)
export const getWeeklyHistory = async (email: string) => {
  try {
      const response = await fetch(`${BASE_URL}/analytics/weekly-history/${email}`);
      if (!response.ok) return null;
      return await response.json();
  } catch (error) {
      console.error("Weekly History Fetch Error:", error); // FIXED: Logged the error
      return null;
  }
};

// ==========================================
// GEMINI AI INTEGRATION
// ==========================================

// 11. Gemini AI - Analyze Usage
export const getAiAnalysis = async (usage: any, totalEmissions: number) => {
  try {
    const response = await fetch(`${BASE_URL}/ml/analyze-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usage: usage, total_emissions: totalEmissions })
    });
    
    if (!response.ok) {
      return { error: "Failed to get analysis" };
    }
    return await response.json();
  } catch (error) {
    console.error("AI Analysis API Error:", error);
    return { error: "Network error" };
  }
};

// 12. Gemini AI - Eco-Coach Chat
export const askEcoCoach = async (message: string) => {
  try {
    const response = await fetch(`${BASE_URL}/ml/ask-coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      return { error: "Failed to get response" };
    }
    return await response.json();
  } catch (error) {
    console.error("Eco-Coach API Error:", error);
    return { error: "Network error" };
  }
};