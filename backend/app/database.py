from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import DATABASE_URL

# Configure engine for production (Render) reliability and faster first queries
connect_args = {}
if DATABASE_URL and DATABASE_URL.startswith("postgres"):
    # Render Postgres typically requires SSL
    connect_args["sslmode"] = "require"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,        # Validate connections before use to avoid timeouts
    pool_recycle=1800,         # Recycle connections every 30 minutes
    connect_args=connect_args, # SSL for Postgres when needed
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
