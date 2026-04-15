# Digital Carbon Tracker 🌍
**Capstone Project -**

A Flask-based REST API designed to track and analyze digital carbon footprints. This project incorporates user authentication, MongoDB integration, and future modules for machine learning analysis.

---

## 🚀 Setup Instructions for Collaborators

To ensure your contributions are tracked correctly and the code runs on your local machine, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/zim1288/Digital-carbon-footprint-tracker.git
cd Digital-carbon-footprint-tracker

### 2. Set Up Virtual Environment

# Create the environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate

### 3. Install Dependencies

pip install -r requirements.txt

### 4. Configuration (.env)
For security, the database credentials are not stored in GitHub.

1. Create a file named `.env` in the root folder.
2. Add the following line (replace with the shared team URI):
   `MONGO_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/your_db`

### 5. Running the Application

python app.py
