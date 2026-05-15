import os
import random
import re
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from extensions import mongo
from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint("auth_bp", __name__)

# --- Helper function to enforce strong password policy ---
def is_strong_password(password):
    if len(password) < 8: return False
    if not re.search(r"[a-z]", password): return False
    if not re.search(r"[A-Z]", password): return False
    if not re.search(r"\d", password): return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password): return False
    return True

# --- Helper Function for Registration OTP Email ---
def send_otp_email(receiver_email, otp_code):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Verify your EcoBit Account'
    msg['From'] = f"EcoBit Tracker <{sender_email}>"
    msg['To'] = receiver_email

    text = f"Welcome to EcoBit! Your verification code is: {otp_code}\n\nThis code will expire in 5 minutes."
    
    html = f"""\
    <html>
      <body style="margin: 0; padding: 0; background-color: #f4fdf8;">
        <div style="font-family: Arial, sans-serif; padding: 40px 20px; text-align: center;">
            <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
                <h2 style="color: #10B981; margin-bottom: 10px; font-size: 28px; margin-top: 0;">🌍 EcoBit</h2>
                <h3 style="color: #111827; font-size: 22px; font-weight: 600; margin-bottom: 20px;">Verify your email</h3>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Welcome to EcoBit! To finish setting up your account, please enter the verification code below in your app.
                </p>
                
                <div style="margin: 30px 0; padding: 25px; background-color: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db;">
                    <span style="font-size: 42px; font-weight: bold; color: #111827; letter-spacing: 12px; display: block;">{otp_code}</span>
                </div>
                
                <p style="color: #6b7280; font-size: 15px; font-weight: 500;">This code will expire in 5 minutes.</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                    If you didn't request this email, you can safely ignore it. Someone might have typed your email address by mistake.
                </p>
            </div>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(text, 'plain'))
    msg.attach(MIMEText(html, 'html'))

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

# --- Helper Function for Password Reset Email ---
def send_password_reset_email(receiver_email, otp_code):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Reset your EcoBit Password'
    msg['From'] = f"EcoBit Support <{sender_email}>"
    msg['To'] = receiver_email

    text = f"Your password reset code is: {otp_code}\n\nThis code will expire in 5 minutes."
    
    html = f"""\
    <html>
      <body style="margin: 0; padding: 0; background-color: #f4fdf8;">
        <div style="font-family: Arial, sans-serif; padding: 40px 20px; text-align: center;">
            <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
                <h2 style="color: #10B981; margin-bottom: 10px; font-size: 28px; margin-top: 0;">🌍 EcoBit</h2>
                <h3 style="color: #111827; font-size: 22px; font-weight: 600; margin-bottom: 20px;">Password Reset Request</h3>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    We received a request to reset the password for your EcoBit account. Enter the code below in the app to set a new password.
                </p>
                
                <div style="margin: 30px 0; padding: 25px; background-color: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db;">
                    <span style="font-size: 42px; font-weight: bold; color: #111827; letter-spacing: 12px; display: block;">{otp_code}</span>
                </div>
                
                <p style="color: #6b7280; font-size: 15px; font-weight: 500;">This code will expire in 5 minutes.</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                </p>
            </div>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(text, 'plain'))
    msg.attach(MIMEText(html, 'html'))

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send reset email: {e}")
        return False

# --- 1. Register Route ---
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data: return jsonify({"error": "Missing JSON in request"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    if not is_strong_password(password):
        return jsonify({"error": "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."}), 400

    if mongo.db.users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    hashed_password = generate_password_hash(password)
    otp = str(random.randint(100000, 999999))
    
    if not send_otp_email(email, otp):
        return jsonify({"error": "Failed to send verification email. Please check if the email address is valid."}), 500

    mongo.db.users.insert_one({
        "name": name, 
        "email": email, 
        "password": hashed_password,
        "is_verified": False,
        "otp": otp,
        "otp_created_at": datetime.now(timezone.utc)
    })
    
    return jsonify({"message": "Registration initiated. Please check your email for the OTP.", "email": email}), 201

# --- 2. Verify OTP Route ---
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email")
    user_otp = data.get("otp")

    user = mongo.db.users.find_one({"email": email})
    if not user: return jsonify({"error": "User not found"}), 404
        
    otp_created_at = user.get("otp_created_at")
    if otp_created_at:
        if otp_created_at.tzinfo is None:
            otp_created_at = otp_created_at.replace(tzinfo=timezone.utc)
        time_elapsed = datetime.now(timezone.utc) - otp_created_at
        if time_elapsed > timedelta(minutes=5):
            return jsonify({"error": "OTP has expired. Please request a new one."}), 400

    if user.get("otp") == user_otp:
        mongo.db.users.update_one(
            {"email": email},
            {"$set": {"is_verified": True}, "$unset": {"otp": "", "otp_created_at": ""}}
        )
        return jsonify({"message": "Email verified successfully! You can now log in."}), 200
    else:
        return jsonify({"error": "Invalid OTP code."}), 400

# --- 3. Resend OTP Route ---
@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp():
    data = request.get_json()
    email = data.get("email")

    user = mongo.db.users.find_one({"email": email})
    if not user: return jsonify({"error": "User not found"}), 404
    if user.get("is_verified"): return jsonify({"error": "User is already verified."}), 400

    otp_created_at = user.get("otp_created_at")
    if otp_created_at:
        if otp_created_at.tzinfo is None:
            otp_created_at = otp_created_at.replace(tzinfo=timezone.utc)
        time_elapsed = datetime.now(timezone.utc) - otp_created_at
        if time_elapsed < timedelta(minutes=2):
            return jsonify({"error": "Please wait 2 minutes before requesting a new OTP."}), 429

    new_otp = str(random.randint(100000, 999999))
    
    if not send_otp_email(email, new_otp):
        return jsonify({"error": "Failed to send email."}), 500

    mongo.db.users.update_one(
        {"email": email},
        {"$set": {"otp": new_otp, "otp_created_at": datetime.now(timezone.utc)}}
    )
    return jsonify({"message": "A new OTP has been sent to your email."}), 200

# --- 4. Login Route ---
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data: return jsonify({"error": "Missing JSON in request"}), 400

    email = data.get("email")
    password = data.get("password")
    user = mongo.db.users.find_one({"email": email})

    if user and check_password_hash(user.get("password", ""), password):
        if not user.get("is_verified", False):
            return jsonify({"error": "Please verify your email before logging in."}), 403
            
        return jsonify({"message": "Login successful", "user": {"name": user.get("name"), "email": user.get("email")}}), 200

    return jsonify({"error": "Wrong email or password!"}), 401

# --- 5. Forgot Password Route ---
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    user = mongo.db.users.find_one({"email": email})
    if not user:
        return jsonify({"error": "No account found with that email address."}), 404

    otp = str(random.randint(100000, 999999))
    if not send_password_reset_email(email, otp):
        return jsonify({"error": "Failed to send reset email."}), 500

    mongo.db.users.update_one(
        {"email": email},
        {"$set": {"reset_otp": otp, "reset_otp_created_at": datetime.now(timezone.utc)}}
    )
    return jsonify({"message": "Password reset code sent to your email."}), 200

# --- 6. Reset Password Route ---
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    user_otp = data.get("otp")
    new_password = data.get("new_password")

    if not is_strong_password(new_password):
        return jsonify({"error": "New password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."}), 400

    user = mongo.db.users.find_one({"email": email})
    if not user: return jsonify({"error": "User not found"}), 404

    otp_created_at = user.get("reset_otp_created_at")
    if otp_created_at:
        if otp_created_at.tzinfo is None:
            otp_created_at = otp_created_at.replace(tzinfo=timezone.utc)
        time_elapsed = datetime.now(timezone.utc) - otp_created_at
        if time_elapsed > timedelta(minutes=5):
            return jsonify({"error": "Reset code has expired. Please request a new one."}), 400

    if user.get("reset_otp") == user_otp:
        hashed_password = generate_password_hash(new_password)
        mongo.db.users.update_one(
            {"email": email},
            {"$set": {"password": hashed_password}, "$unset": {"reset_otp": "", "reset_otp_created_at": ""}}
        )
        return jsonify({"message": "Password has been reset successfully! You can now log in."}), 200
    else:
        return jsonify({"error": "Invalid reset code."}), 400