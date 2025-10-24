from sqlalchemy import Column, Integer, String, Float, LargeBinary, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), index=True, nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    liked_colleges = relationship("LikedCollege", back_populates="user", cascade="all, delete")
    compare_colleges = relationship("CompareCollege", back_populates="user", cascade="all, delete-orphan")


class College(Base):
    __tablename__ = "colleges_1"

    id = Column(Integer, primary_key=True, index=True)
    college_name = Column(String(200), nullable=False)
    address = Column(String(300), nullable=True)
    about = Column(Text, nullable=True)
    stream = Column(String(100), nullable=True)
    price_range = Column(String(100), nullable=True)
    college_image_data = Column(LargeBinary, nullable=True)
    college_image_mime = Column(String(50), nullable=True)

    courses = relationship(
        "Course",
        back_populates="college",
        cascade="all, delete-orphan"
    )
    liked_by_users = relationship(
        "LikedCollege",
        back_populates="college",
        cascade="all, delete-orphan"
    )
    compared_by_users = relationship(
        "CompareCollege",
        back_populates="college",
        cascade="all, delete-orphan"
    )


class Course(Base):
    __tablename__ = "courses_1"

    id = Column(Integer, primary_key=True, index=True)
    
    college_id = Column(Integer, ForeignKey("colleges_1.id", ondelete="CASCADE"))


    course_name = Column(String(150), nullable=False)
    course_about = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)

    sem1_fee = Column(Float, nullable=True)
    sem2_fee = Column(Float, nullable=True)
    sem3_fee = Column(Float, nullable=True)
    sem4_fee = Column(Float, nullable=True)
    sem5_fee = Column(Float, nullable=True)
    sem6_fee = Column(Float, nullable=True)
    sem7_fee = Column(Float, nullable=True)
    sem8_fee = Column(Float, nullable=True)

    college = relationship("College", back_populates="courses")


class LikedCollege(Base):
    __tablename__ = "liked_colleges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    college_id = Column(Integer, ForeignKey("colleges_1.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "college_id", name="unique_user_college"),)

    user = relationship("User", back_populates="liked_colleges")
    college = relationship("College", back_populates="liked_by_users")


class CompareCollege(Base):
    __tablename__ = "compare_colleges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    college_id = Column(Integer, ForeignKey("colleges_1.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "college_id", name="unique_user_compare"),)

    user = relationship("User", back_populates="compare_colleges")
    college = relationship("College", back_populates="compared_by_users")
