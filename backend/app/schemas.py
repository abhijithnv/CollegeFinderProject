from pydantic import BaseModel, EmailStr, HttpUrl, field_validator
from typing import Optional, List

# -------------------------------
# User schemas
# -------------------------------
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        orm_mode = True

# -------------------------------
# Course schemas
# -------------------------------
class CourseCreate(BaseModel):
    course_name: str
    course_about: Optional[str] = None
    category: str
    sem1_fee: Optional[float] = None
    sem2_fee: Optional[float] = None
    sem3_fee: Optional[float] = None
    sem4_fee: Optional[float] = None
    sem5_fee: Optional[float] = None
    sem6_fee: Optional[float] = None
    sem7_fee: Optional[float] = None
    sem8_fee: Optional[float] = None

class CourseOut(BaseModel):
    course_name: str
    course_about: Optional[str] = None
    sem1_fee: Optional[float] = None
    sem2_fee: Optional[float] = None
    sem3_fee: Optional[float] = None
    sem4_fee: Optional[float] = None
    sem5_fee: Optional[float] = None
    sem6_fee: Optional[float] = None
    sem7_fee: Optional[float] = None
    sem8_fee: Optional[float] = None
    category: Optional[str] = None  

    class Config:
        orm_mode = True

# -------------------------------
# College schemas
# -------------------------------
class CollegeCreate(BaseModel):
    college_name: str
    address: Optional[str] = None
    about: Optional[str] = None
    stream: Optional[str] = None
    price_range: Optional[str] = None
    category: str
    college_image_url: Optional[HttpUrl] = None
    college_image_path: Optional[str] = None
    courses: Optional[List[CourseCreate]] = []

    # -------------------------------
    # Validators
    # -------------------------------
    @field_validator("category")
    def validate_category(cls, v):
        allowed = ["UG", "PG", "Engineering"]
        if v not in allowed:
            raise ValueError(f"Invalid category '{v}'. Must be one of {allowed}")
        return v

    @field_validator("*", mode="after")
    def validate_exact_semesters(cls, values):
        """
        Validate that the number of provided semester fees matches the category:
        PG=4, UG=6, Engineering=8
        """
        category = values.get("category")
        course = values.get("course")
        if not category or not course:
            return values

        sem_fields = [v for k, v in course.dict().items() if k.startswith("sem") and v is not None]
        provided_sem_count = len(sem_fields)
        expected = {"PG": 4, "UG": 6, "Engineering": 8}[category]

        if provided_sem_count != expected:
            raise ValueError(
                f"{category} category must have exactly {expected} semester fees, "
                f"but received {provided_sem_count}."
            )
        return values

class CollegeOut(BaseModel):
    id: int
    college_name: str
    address: Optional[str] = None
    about: Optional[str] = None
    stream: Optional[str] = None
    price_range: Optional[str] = None
    # category: str  # UG / PG / Engineering
    img_url: Optional[str] = None  # maps to uploaded file endpoint
    courses: List[CourseOut] = []  # List of associated courses

    class Config:
        orm_mode = True

# -------------------------------
# Utility function to convert DB model to Pydantic model
# -------------------------------
def college_to_out(college):
    """
    Convert College SQLAlchemy model to CollegeOut schema
    """
    img = None
    if college.college_image_data:
        img = f"http://127.0.0.1:8000/college/{college.id}/image"

    return CollegeOut(
        id=college.id,
        college_name=college.college_name,
        address=college.address,
        about=college.about,
        stream=college.stream,
        price_range=college.price_range,
        img_url=img,
        courses=[
            CourseOut(
                course_name=c.course_name,
                course_about=c.course_about,
                sem1_fee=c.sem1_fee,
                sem2_fee=c.sem2_fee,
                sem3_fee=c.sem3_fee,
                sem4_fee=c.sem4_fee,
                sem5_fee=c.sem5_fee,
                sem6_fee=c.sem6_fee,
                sem7_fee=c.sem7_fee,
                sem8_fee=c.sem8_fee,
                category=c.category,  # ✅ get category from course, not college
            )
            for c in college.courses
        ]
    )
