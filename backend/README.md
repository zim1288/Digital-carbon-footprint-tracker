# Digital Carbon Tracker Backend

Flask REST API for tracking digital activity emissions, generating analytics, and providing ML- and AI-powered sustainability insights.

## Tech Stack

- Flask + Flask-CORS
- MongoDB Atlas (Flask-PyMongo)
- scikit-learn (Logistic Regression risk model)
- Gemini API (with offline fallback responses)

## Project Structure

```text
backend/
   app.py
   config.py
   extensions.py
   requirements.txt
   ml_model/
      model_loader.py
      train_model.py
   routes/
      auth_routes.py
      activity_routes.py
      analytics_routes.py
      ml_routes.py
   services/
      carbon_service.py
      ml_service.py
      recommendation_service.py
```

## Setup

### 1. Create and activate virtual environment

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in `backend/`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
SECRET_KEY=replace-with-a-secret
GEMINI_API_KEY=optional-for-ai-features
```

`GEMINI_API_KEY` is optional. If missing or unavailable, AI routes return built-in fallback responses.

### 4. Run the server

```bash
python app.py
```

Default URL: `http://0.0.0.0:5000`

## API Overview

All responses are JSON.

### Health

- `GET /`
   - Returns: backend status message.

### Auth (`/auth`)

- `POST /auth/register`
   - Body: `{ "name": string, "email": string, "password": string }`
   - Password policy: min 8 chars + uppercase + lowercase + number + special char.
- `POST /auth/login`
   - Body: `{ "email": string, "password": string }`
   - Returns basic user object on success.

### Activity (`/activity`)

- `POST /activity/add-activity`
   - Body: `{ "user_email": string, "activity_type": string, "duration_minutes": number, "data_used_mb": number }`
   - Stores one activity log and computed emissions.
- `POST /activity/log-daily`
   - Body: `{ "user_email": string, "usage": { "streaming": number, "calls": number, "social": number, "general": number } }`
   - Upserts one daily summary (`is_daily_summary=true`).

### Analytics (`/analytics`)

- `GET /analytics/user-activities/<email>`
- `GET /analytics/most-carbon-activity/<email>`
- `GET /analytics/dashboard/<email>`
- `GET /analytics/today-usage/<email>`
- `GET /analytics/today-breakdown/<email>`
- `GET /analytics/weekly-history/<email>`

### ML and AI (`/ml`)

- `GET /ml/ml-features/<email>`
- `GET /ml/predict-carbon-risk/<email>`
- `GET /ml/recommendation/<email>`
- `GET /ml/training-dataset`
- `POST /ml/analyze-usage`
   - Body: `{ "usage": object, "total_emissions": number }`
- `POST /ml/ask-coach`
   - Body: `{ "message": string }`

## Emissions Logic

### Manual activity calculation (`add-activity`)

Formula:

`emission = data_used_mb * 0.5 + duration_minutes * activity_factor`

Current duration factors:

- `Gaming`: `0.6`
- `Coding`: `0.05`
- Other activity types currently add only data-based emissions.

### Daily slider calculation (`log-daily`)

Hourly factors:

- `streaming`: 55 gCO2
- `calls`: 40 gCO2
- `social`: 25 gCO2
- `general`: 10 gCO2

Total daily emissions:

`streaming*55 + calls*40 + social*25 + general*10`

## ML Model

The model is trained in `ml_model/train_model.py` using Logistic Regression.

Features:

- `total_weekly_carbon`
- `avg_daily_carbon`

Risk labels used in training:

- Low: `<= 250`
- Medium: `251 - 500`
- High: `> 500`

Train/retrain command:

```bash
python ml_model/train_model.py
```

Model output path: `ml_model/carbon_risk_model.pkl`

## Dependencies

Defined in `requirements.txt`:

- Flask==3.0.3
- Flask-CORS==4.0.0
- Flask-PyMongo==3.0.1
- python-dotenv==1.0.0
- pymongo==4.6.3
- pandas==2.2.2
- scikit-learn==1.4.2
- joblib==1.4.2

## Notes and Limitations

- Auth is credentials-based; no JWT/session token is issued.
- CORS is globally enabled in development.
- Mobile app must point to reachable backend host/IP.
- For production use, tighten CORS, validation, secret management, and auth design.
