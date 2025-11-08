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
# Create all tables on startup and run migrations
# ----------------------------
@app.on_event("startup")
def on_startup():
    print("Creating all database tables (if not exist)...")
    models.Base.metadata.create_all(bind=database.engine)
    
    # Migrate course_about column from VARCHAR(500) to TEXT if needed
    try:
        from sqlalchemy import text
        with database.engine.connect() as connection:
            # Check current column type
            result = connection.execute(text("""
                SELECT data_type, character_maximum_length 
                FROM information_schema.columns 
                WHERE table_name = 'courses_1' 
                AND column_name = 'course_about'
            """))
            row = result.fetchone()
            if row:
                data_type, max_length = row
                if data_type == 'character varying' and max_length == 500:
                    print("Migrating course_about column from VARCHAR(500) to TEXT...")
                    connection.execute(text("""
                        ALTER TABLE courses_1 
                        ALTER COLUMN course_about TYPE TEXT
                    """))
                    connection.commit()
                    print("✅ Migration completed: course_about column updated to TEXT")
                elif data_type == 'text':
                    print("✅ course_about column is already TEXT type")
    except Exception as e:
        print(f"⚠️  Migration check failed (non-critical): {str(e)}")
        # Don't fail startup if migration check fails

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
