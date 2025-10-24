import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, database, config

router = APIRouter(prefix="/auth", tags=["Authentication"])

# DB session dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Register endpoint
@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):

    # 1️ Check if email already exists
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2️ Store user (now includes username)
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=user.password   # ⚠️ still plain text, should hash later
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Login endpoint
@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # Check admin first
    if user.email == config.ADMIN_EMAIL and user.password == config.ADMIN_PASSWORD:
        return {"message": "Admin login successful", "role": "admin"}

    # Check student
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or db_user.password_hash != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "User login successful",
        "role": "student",
        "email": db_user.email,
        "username": db_user.username   
    }
