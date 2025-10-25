from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .auth import router as auth_router
from .crud import router as college_router
import os
import uvicorn

# ----------------------------
# Initialize FastAPI app
# ----------------------------
app = FastAPI(
    title="User Auth and College Management System",
    description="API for managing user authentication, college details, and semester fees",
    version="1.0.0"
)

# ----------------------------
# CORS Middleware
# ----------------------------
origins = [
    # "http://localhost:3000",   # local dev
    # "http://127.0.0.1:3000",   # local dev alternate
    "https://collegefinder44.netlify.app"
    # deployed frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Include Routers
# ----------------------------
app.include_router(auth_router)
app.include_router(college_router)

# ----------------------------
# Create all tables on startup
# ----------------------------
@app.on_event("startup")
def on_startup():
    print("Creating all database tables (if not exist)...")
    models.Base.metadata.create_all(bind=database.engine)

# ----------------------------
# Root endpoint
# ----------------------------
@app.get("/")
def root():
    return {"message": "Welcome to the Users Auth & College APIs"}

# ----------------------------
# Run the app locally
# ----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
