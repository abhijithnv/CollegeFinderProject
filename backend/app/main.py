from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from . import models, database
from .auth import router as auth_router
from .crud import router as college_router
import os
import uvicorn
import time

# ----------------------------
# Initialize FastAPI app
# ----------------------------
app = FastAPI(
    title="User Auth and College Management System",
    description="API for managing user authentication, college details, and semester fees",
    version="1.0.0"
)

# ----------------------------
# Request timeout middleware (for Render deployment)
# ----------------------------
@app.middleware("http")
async def timeout_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    # Add timeout header for debugging
    response.headers["X-Process-Time"] = str(process_time)
    return response

# ----------------------------
# Global exception handler (only for non-HTTP exceptions)
# ----------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Don't catch HTTPException, let it be handled by FastAPI
    if isinstance(exc, HTTPException):
        raise exc
    # Log unexpected errors
    import traceback
    print(f"Unexpected error: {str(exc)}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."}
    )

# ----------------------------
# CORS Middleware
# ----------------------------
origins = ["*"]

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
    return {"message": "Welcome All to the Users Auth & College APIs"}

# ----------------------------
# Run the app locally
# ----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
