import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ADMIN_EMAIL = os.getenv("Admin_email")
ADMIN_PASSWORD = os.getenv("Admin_password")
