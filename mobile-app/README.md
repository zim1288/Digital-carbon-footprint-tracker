# Digital Carbon Tracker Mobile App

Expo + React Native app for tracking digital carbon footprint, visualizing emissions, and receiving AI-powered recommendations.

## Tech Stack

- Expo SDK 54
- React Native 0.81
- Expo Router (file-based routing)
- Context API for auth/theme/language
- react-native-gifted-charts for analytics visuals

## Features

- Login and registration flow
- Daily carbon tracker with 4 usage sliders
- Manual activity entry modal
- Analytics dashboard with pie and bar charts
- AI impact analysis from backend Gemini route
- Eco Coach chatbot from backend Gemini route
- Light/dark theme toggle
- English/Bengali language toggle

## App Structure

```text
mobile-app/
   app/
      _layout.tsx
      index.tsx
      manual-log.tsx
      modal.tsx
      (tabs)/
         _layout.tsx
         tracker.tsx
         analytics.tsx
         tips.tsx
   src/
      context/
         AuthContext.tsx
         ThemeContext.tsx
         LanguageContext.tsx
      services/
         api.ts
```

## Screen Overview

- `app/index.tsx`
   - Login/register UI with password visibility toggle.
   - Registration enforces password confirmation.
- `app/(tabs)/tracker.tsx`
   - Slider-based usage logging for: streaming, calls, social, general.
   - Sends updates to `/activity/log-daily`.
- `app/manual-log.tsx`
   - Logs manual activities through `/activity/add-activity`.
- `app/(tabs)/analytics.tsx`
   - Pie chart from `/analytics/today-breakdown`.
   - Weekly trend chart from `/analytics/weekly-history`.
   - AI analysis using `/ml/analyze-usage`.
- `app/(tabs)/tips.tsx`
   - Recommendations from `/ml/recommendation`.
   - Chat assistant using `/ml/ask-coach`.
- `app/modal.tsx`
   - About/Credits modal.

## Context Providers

- `AuthContext`
   - Stores `userEmail` in memory.
   - Provides `login(email)` and `logout()`.
- `ThemeContext`
   - Initializes from device color scheme.
   - Provides `isDarkMode` and toggle action.
- `LanguageContext`
   - Supports `en` and `bn` dictionaries.
   - Provides `t(key)` and language toggle.

## API Configuration

The app currently uses a hardcoded backend base URL in `src/services/api.ts`:

```ts
const BASE_URL = "http://192.168.0.153:5000";
```

Update this to your machine/LAN backend address before running on device/emulator.

Windows IP example:

```bash
ipconfig
```

## Setup and Run

### 1. Install dependencies

```bash
npm install
```

### 2. Start Expo

```bash
npm start
```

### 3. Launch target

- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

## Available Scripts

- `npm start`
- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run lint`
- `npm run reset-project`

## Emissions Model Used in App

The tracker UI calculates estimated daily emissions using these factors:

- streaming: 55 gCO2/hour
- calls: 40 gCO2/hour
- social: 25 gCO2/hour
- general: 10 gCO2/hour

Formula:

`total = streaming*55 + calls*40 + social*25 + general*10`

## Important Notes

- Auth state is in-memory only and resets when app restarts.
- API failures are returned as `{ error: "..." }` by service methods.
- Ensure backend is running and reachable on the same network for physical devices.
