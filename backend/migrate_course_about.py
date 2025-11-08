"""
Migration script to change course_about column from VARCHAR(500) to TEXT
Run this script once to update your database schema.

Usage:
    python migrate_course_about.py
"""
import os
from sqlalchemy import create_engine, text
from app.config import DATABASE_URL

def migrate_course_about():
    """Alter the course_about column from VARCHAR(500) to TEXT"""
    
    # Configure engine
    connect_args = {}
    if DATABASE_URL and DATABASE_URL.startswith("postgres"):
        connect_args["sslmode"] = "require"
    
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=1800,
        connect_args=connect_args,
    )
    
    try:
        with engine.connect() as connection:
            # Check if column exists and is VARCHAR(500)
            result = connection.execute(text("""
                SELECT data_type, character_maximum_length 
                FROM information_schema.columns 
                WHERE table_name = 'courses_1' 
                AND column_name = 'course_about'
            """))
            
            row = result.fetchone()
            if row:
                data_type, max_length = row
                print(f"Current column type: {data_type}({max_length})")
                
                if data_type == 'character varying' and max_length == 500:
                    print("Migrating course_about column from VARCHAR(500) to TEXT...")
                    # Alter the column type
                    connection.execute(text("""
                        ALTER TABLE courses_1 
                        ALTER COLUMN course_about TYPE TEXT
                    """))
                    connection.commit()
                    print("✅ Migration completed successfully!")
                elif data_type == 'text':
                    print("✅ Column is already TEXT type. No migration needed.")
                else:
                    print(f"⚠️  Column type is {data_type}({max_length}). Expected VARCHAR(500).")
            else:
                print("⚠️  Column 'course_about' not found in table 'courses_1'")
                
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise
    finally:
        engine.dispose()

if __name__ == "__main__":
    print("Starting migration...")
    migrate_course_about()
    print("Migration script completed.")

