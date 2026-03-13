from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime, timedelta
import os
import jwt
from passlib.context import CryptContext

import logging
from database import get_db, MongoDB

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Cryptography config
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key-please-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "639901685795-m9fanibglpjnaeebfjj4q0camicn32va.apps.googleusercontent.com")

# Models Validate
class UserRegister(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: str
    password: str

class GoogleLogin(BaseModel):
    credential: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = False

class OTPVerifyRequest(BaseModel):
    email: str
    otp: str
    remember_me: bool = False

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class NotificationSettingsRequest(BaseModel):
    preferences: Dict[str, bool]

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_auth_email(target_email: str, subject: str, body: str):
    """Utility to send emails using SMTP"""
    host = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    port = int(os.getenv("EMAIL_PORT", 587))
    user = os.getenv("EMAIL_USER", "alexgreyson45@gmail.com")
    password = os.getenv("EMAIL_PASS")

    if not password or password == "your_app_password_here":
        logger.warning(f"SMTP Password not configured. Email to {target_email} skipped. Content: {body}")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = f"QuickCharts <{user}>"
        msg['To'] = target_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(host, port)
        server.starttls()
        server.login(user, password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

import random
import string

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def generate_reset_token():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

def verify_password(plain_password, hashed_password):
    if not hashed_password:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: MongoDB = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = await db.get_user_by_email(email)
    if user is None:
        raise credentials_exception
        
    # Cast ObjectId back to string so frontend can use it if needed
    user["id"] = str(user["_id"])
    user["_id"] = str(user["_id"])
    return user


@router.post("/register")
async def register(user_data: UserRegister, db: MongoDB = Depends(get_db)):
    # Check if user already exists (Case Insensitive)
    email_lower = user_data.email.lower().strip()
    existing_user = await db.get_user_by_email(email_lower)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "email": email_lower,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "phone": user_data.phone,
        "name": f"{user_data.first_name} {user_data.last_name}",
        "hashed_password": hashed_password,
        "is_active": True
    }
    
    user_id = await db.create_user(user_dict)
    
    # Generate token immediately after register
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": {"email": user_dict["email"], "name": user_dict["name"]}}

@router.post("/google")
async def google_login(data: GoogleLogin, db: MongoDB = Depends(get_db)):
    try:
        # Verify the token against Google
        # Actually Google ID tokens can be decoded if client ID is valid
        # We can bypass strict audience validation for simplicity in testing if CLIENT_ID is not configured tightly
        idinfo = id_token.verify_oauth2_token(data.credential, google_requests.Request(), GOOGLE_CLIENT_ID)
        
        email = idinfo.get('email')
        name = idinfo.get('name')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        if not email:
            raise HTTPException(status_code=400, detail="Invalid Google token payload")

        # Check if user exists
        user = await db.get_user_by_email(email)
        if not user:
            # Auto-register google user
            user_dict = {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "phone": "",
                "name": name,
                "hashed_password": "", # No password for oauth users
                "is_active": True,
                "auth_provider": "google"
            }
            await db.create_user(user_dict)
            user = user_dict

        # Issue our JWT to the Google user
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")


@router.post("/login")
async def login(request: LoginRequest, db: MongoDB = Depends(get_db)):
    email_lower = request.email.lower().strip()
    user = await db.get_user_by_email(email_lower)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is a Google-only user
    if user.get("auth_provider") == "google" and not user.get("hashed_password"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account is linked with Google. Please Sign in with Google."
        )

    if not verify_password(request.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # If remember me is NOT ticked, require OTP
    if not request.remember_me:
        otp = generate_otp()
        # In a real app, send this via email/SMS. Here we log it and store it in DB.
        logger.info(f"OTP for {request.email}: {otp}")
        
        # Store OTP in user document with expiration (5 mins)
        otp_expiry = datetime.utcnow() + timedelta(minutes=5)
        await db.db["users"].update_one(
            {"email": user["email"]},  # Use email from DB which is already lowercase
            {"$set": {"current_otp": otp, "otp_expiry": otp_expiry}}
        )
        
        # Send actual email
        email_body = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">Verification Code</h2>
            <p>Your one-time password (OTP) is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; padding: 10px 0;">{otp}</div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 5 minutes.</p>
        </div>
        """
        send_auth_email(request.email, "Your Verification Code - QuickCharts", email_body)

        return {"otp_required": True, "message": "OTP sent to your email"}

    # If remember me is ticked, direct login with long expiration
    access_token_expires = timedelta(days=30)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": {"email": user["email"], "name": user.get("name")}}

@router.post("/verify-otp")
async def verify_otp(request: OTPVerifyRequest, db: MongoDB = Depends(get_db)):
    user = await db.get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    stored_otp = user.get("current_otp")
    otp_expiry = user.get("otp_expiry")
    
    if not stored_otp or not otp_expiry or datetime.utcnow() > otp_expiry:
        raise HTTPException(status_code=400, detail="OTP expired or not found")
    
    if request.otp != stored_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Clear OTP
    await db.db["users"].update_one(
        {"email": request.email},
        {"$unset": {"current_otp": "", "otp_expiry": ""}}
    )
    
    # Issue 24h token if not remember_me, otherwise 30 days
    expire_time = timedelta(days=30) if request.remember_me else timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=expire_time
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": {"email": user["email"], "name": user.get("name")}}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: MongoDB = Depends(get_db)):
    email_lower = request.email.lower().strip()
    user = await db.get_user_by_email(email_lower)
    if not user:
        # Don't reveal if user exists for security, but for this app we can be helpful
        raise HTTPException(status_code=404, detail="User not found")
    
    reset_token = generate_reset_token()
    reset_expiry = datetime.utcnow() + timedelta(hours=1)
    
    await db.db["users"].update_one(
        {"email": email_lower},
        {"$set": {"reset_token": reset_token, "reset_expiry": reset_expiry}}
    )
    
    frontend_url = os.getenv("FRONTEND_URL", "https://quick-charts-one.vercel.app")
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"
    
    email_body = f"""
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="{reset_url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        <p style="margin-top: 20px; color: #64748b; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    send_auth_email(request.email, "Reset Your Password - QuickCharts", email_body)
    
    return {"message": "Reset instructions sent to your email"}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: MongoDB = Depends(get_db)):
    user = await db.db["users"].find_one({
        "reset_token": request.token,
        "reset_expiry": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    hashed_password = get_password_hash(request.new_password)
    
    await db.db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"hashed_password": hashed_password}, "$unset": {"reset_token": "", "reset_expiry": ""}}
    )
    
    return {"message": "Password updated successfully"}


@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user["email"],
        "name": current_user.get("name"),
        "first_name": current_user.get("first_name"),
        "last_name": current_user.get("last_name"),
        "phone": current_user.get("phone"),
        "address": current_user.get("address"),
        "designation": current_user.get("designation"),
        "notifications": current_user.get("notifications", {}),
        "id": current_user["_id"]
    }

@router.put("/profile")
async def update_profile(
    request: ProfileUpdateRequest, 
    current_user: dict = Depends(get_current_user),
    db: MongoDB = Depends(get_db)
):
    updates = {}
    if request.first_name is not None: updates["first_name"] = request.first_name
    if request.last_name is not None: updates["last_name"] = request.last_name
    if request.designation is not None: updates["designation"] = request.designation
    if request.phone is not None: updates["phone"] = request.phone
    if request.address is not None: updates["address"] = request.address
    
    if updates:
        # Re-construct name if first/last changed
        fn = updates.get("first_name", current_user.get("first_name", ""))
        ln = updates.get("last_name", current_user.get("last_name", ""))
        updates["name"] = f"{fn} {ln}".strip()
        
        await db.update_user(current_user["email"], updates)
    
    return {"message": "Profile updated successfully"}

@router.put("/password")
async def change_password(
    request: PasswordChangeRequest, 
    current_user: dict = Depends(get_current_user),
    db: MongoDB = Depends(get_db)
):
    # Verify old password
    if not verify_password(request.old_password, current_user.get("hashed_password", "")):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    hashed_password = get_password_hash(request.new_password)
    await db.update_user(current_user["email"], {"hashed_password": hashed_password})
    
    return {"message": "Password updated successfully"}

@router.put("/notifications")
async def update_notifications(
    request: NotificationSettingsRequest, 
    current_user: dict = Depends(get_current_user),
    db: MongoDB = Depends(get_db)
):
    await db.update_user(current_user["email"], {"notifications": request.preferences})
    return {"message": "Notification preferences updated"}

@router.get("/billing")
async def get_billing_info(current_user: dict = Depends(get_current_user)):
    # Mock billing info
    return {
        "plan": "Professional Plan",
        "price": 19,
        "renewal_date": "2026-04-12",
        "storage_used": 14.2,
        "storage_limit": 100,
        "export_used": 6,
        "export_limit": 50,
        "card_brand": "VISA",
        "card_last4": "4242",
        "card_expiry": "12/28"
    }
