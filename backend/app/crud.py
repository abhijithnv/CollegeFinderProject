from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response, Request
from typing import Optional
import json
from sqlalchemy.orm import Session
from .models import College, LikedCollege, CompareCollege
import requests
from . import models, schemas
from .auth import get_db
from .schemas import college_to_out

# Single router with prefix to avoid accidental override
router = APIRouter(prefix="/college", tags=["Colleges"])

@router.post("/", response_model=schemas.CollegeOut)
async def add_college(
    college_name: str = Form(...),
    address: Optional[str] = Form(None),
    about: Optional[str] = Form(None),
    price_range: Optional[str] = Form(None),
    stream: Optional[str] = Form(None),
    courses: Optional[str] = Form(None),  # JSON string of course objects
    college_image_file: UploadFile = File(None),
    college_image_url: str = Form(None),
    db: Session = Depends(get_db),
):
    # Pre-parse and validate courses JSON before creating college to avoid orphan records
    parsed_courses: list[dict] | None = None
    if courses:
        try:
            parsed_courses = json.loads(courses)
            if not isinstance(parsed_courses, list):
                raise HTTPException(status_code=400, detail="'courses' must be a JSON array.")
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format for 'courses'.")
    # -----------------------------
    # Handle College Image
    # -----------------------------
    image_data = None
    image_mime = None

    if college_image_file:
        image_data = await college_image_file.read()
        image_mime = college_image_file.content_type
    elif college_image_url:
        try:
            resp = requests.get(college_image_url)
            resp.raise_for_status()
            image_data = resp.content
            image_mime = resp.headers.get("Content-Type", "image/jpeg")
        except Exception:
            raise HTTPException(status_code=400, detail="Unable to fetch image from URL.")

    # Use a transaction so either college and all courses are saved, or none
    try:
        # Create College Entry
        new_college = models.College(
            college_name=college_name,
            address=address,
            about=about,
            price_range=price_range,
            stream=stream,
            college_image_data=image_data,
            college_image_mime=image_mime
        )
        db.add(new_college)
        db.flush()  # get new_college.id without committing

        # Handle Courses (if provided)
        if parsed_courses:
            for course in parsed_courses:
                course_name = course.get("course_name")
                course_about = course.get("course_about")
                course_category = course.get("category")

                if not course_name or not course_category:
                    raise HTTPException(
                        status_code=400,
                        detail="Each course must have 'course_name' and 'category'."
                    )

                if course_category not in ["UG", "PG", "Engineering"]:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid category '{course_category}' for course '{course_name}'. Must be 'UG', 'PG', or 'Engineering'."
                    )

                sem_fees = [course.get(f"sem{i}_fee") for i in range(1, 9)]
                filled_fees = [f for f in sem_fees if f is not None]

                expected_semesters = {"PG": 4, "UG": 6, "Engineering": 8}[course_category]
                if len(filled_fees) != expected_semesters:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Course '{course_name}' must have exactly {expected_semesters} semester fees, got {len(filled_fees)}."
                    )

                new_course = models.Course(
                    college_id=new_college.id,
                    course_name=course_name,
                    course_about=course_about,
                    sem1_fee=course.get("sem1_fee"),
                    sem2_fee=course.get("sem2_fee"),
                    sem3_fee=course.get("sem3_fee"),
                    sem4_fee=course.get("sem4_fee"),
                    sem5_fee=course.get("sem5_fee"),
                    sem6_fee=course.get("sem6_fee"),
                    sem7_fee=course.get("sem7_fee"),
                    sem8_fee=course.get("sem8_fee"),
                    category=course_category
                )

                db.add(new_course)

        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add college")

    # -----------------------------
    # Reload College with Courses
    # -----------------------------
    db.refresh(new_college)
    new_college.courses = db.query(models.Course).filter(models.Course.college_id == new_college.id).all()

    return schemas.college_to_out(new_college)

@router.get("/", response_model=list[schemas.CollegeOut])
def get_all_colleges(db: Session = Depends(get_db)):
    """
    Fetch all colleges with their main details.
    """
    colleges = db.query(models.College).all()

    if not colleges:
        raise HTTPException(status_code=404, detail="No colleges found.")

    return [schemas.college_to_out(college) for college in colleges]


@router.get("/{college_id}", response_model=schemas.CollegeOut)
def get_college_by_id(college_id: int, db: Session = Depends(get_db)):
    """
    Fetch a single college by its ID, including all courses.
    """
    college = db.query(models.College).filter(models.College.id == college_id).first()

    if not college:
        raise HTTPException(status_code=404, detail=f"College with id {college_id} not found.")

    return schemas.college_to_out(college)


@router.get("/{college_id}/image")
def get_college_image(college_id: int, db: Session = Depends(get_db)):
    college = db.query(models.College).filter(models.College.id == college_id).first()
    if not college or not college.college_image_data:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=college.college_image_data, media_type=college.college_image_mime)


@router.delete("/{college_id}", status_code=200)
async def delete_college(college_id: int, db: Session = Depends(get_db)):
    college = db.query(models.College).filter(models.College.id == college_id).first()

    if not college:
        raise HTTPException(status_code=404, detail=f"College with id {college_id} not found.")

    # SQLAlchemy will delete all related courses, liked_colleges, and compare_colleges
    db.delete(college)
    db.commit()

    return {"message": f"College '{college.college_name}' and all its related data deleted successfully."}



@router.post("/like/{college_id}")
async def toggle_like_college(college_id: int, user_id: int = Form(...), db: Session = Depends(get_db)):
    """
    Toggle like/unlike for a college by a user.
    - If not liked → adds like.
    - If already liked → removes it (unlike).
    """

    # Check if college exists
    college = db.query(models.College).filter(models.College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found.")

    # Check if user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Check if already liked
    existing_like = db.query(models.LikedCollege).filter_by(user_id=user_id, college_id=college_id).first()

    if existing_like:
        # Unlike (delete existing record)
        db.delete(existing_like)
        db.commit()
        return {"message": f"User_id {user_id} unliked college_id {college_id}.", "liked": False}
    else:
        # Like (create new record)
        new_like = models.LikedCollege(user_id=user_id, college_id=college_id)
        db.add(new_like)
        db.commit()
        db.refresh(new_like)
        return {"message": f"User_id {user_id} liked college_id {college_id}.", "liked": True}
    



    # get liked colleges by user


@router.get("/liked/{user_id}")
async def get_liked_colleges(user_id: int, db: Session = Depends(get_db)):
    """
    Get all colleges liked by a specific user.
    Returns full college details with image URL (same format as POST /college).
    """

    # Check if user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Query all liked colleges
    liked_colleges = (
        db.query(models.College)
        .join(models.LikedCollege, models.LikedCollege.college_id == models.College.id)
        .filter(models.LikedCollege.user_id == user_id)
        .all()
    )

    if not liked_colleges:
        return {"message": "User has not liked any colleges yet.", "liked_colleges": []}

    # Convert to schema using helper
    result = [college_to_out(college) for college in liked_colleges]

    return {
        "user_id": user_id,
        "total_liked": len(result),
        "liked_colleges": result
    }


#  Add college to compare list
@router.post("/compare/{user_id}/{college_id}")
def add_to_compare(user_id: int, college_id: int, db: Session = Depends(get_db)):
    existing = db.query(CompareCollege).filter_by(user_id=user_id, college_id=college_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="College already in compare list")

    compare_entry = CompareCollege(user_id=user_id, college_id=college_id)
    db.add(compare_entry)
    db.commit()
    db.refresh(compare_entry)
    return {"message": "College added to compare list", "data": compare_entry}


#  Remove college from compare list
@router.delete("/compare/{user_id}/{college_id}")
def remove_from_compare(user_id: int, college_id: int, db: Session = Depends(get_db)):
    compare_entry = db.query(CompareCollege).filter_by(user_id=user_id, college_id=college_id).first()
    if not compare_entry:
        raise HTTPException(status_code=404, detail="College not found in compare list")

    db.delete(compare_entry)
    db.commit()
    return {"message": "College removed from compare list"}


#  Get all colleges compared by user
@router.get("/compare/{user_id}", response_model=dict)
def get_compared_colleges(user_id: int, db: Session = Depends(get_db)):
    compare_entries = db.query(CompareCollege).filter_by(user_id=user_id).all()
    if not compare_entries:
        return {"message": "No colleges in compare list", "compared_colleges": []}

    college_ids = [entry.college_id for entry in compare_entries]
    colleges = db.query(College).filter(College.id.in_(college_ids)).all()

    #  Convert each to schema format
    college_out_list = [college_to_out(college) for college in colleges]

    return {
        "user_id": user_id,
        "total_compared": len(college_out_list),
        "compared_colleges": college_out_list
    }



@router.get("/name/{college_name}")
def get_colleges_by_name(college_name: str, request: Request, db: Session = Depends(get_db)):
    # Get all colleges with the same name
    colleges = db.query(models.College).filter(models.College.college_name == college_name).all()

    if not colleges:
        raise HTTPException(status_code=404, detail="No colleges found with this name")

    result = []
    for college in colleges:
        # Get all courses for this college
        courses = db.query(models.Course).filter(models.Course.college_id == college.id).all()
        
        result.append({
            "college_id": college.id,
            "college_name": college.college_name,
            "category": college.category,
            "address": college.address,
            "about": college.about,
            "stream": college.stream,
            "price_range": college.price_range,
            # Build absolute image URL based on current request
            "college_image_url": str(request.url_for("get_college_image", college_id=college.id)) if college.college_image_data else None,
            "courses": [
                {
                    "id": course.id,
                    "course_name": course.course_name,
                    "course_about": course.course_about,
                    "category": course.category,
                    "sem1_fee": course.sem1_fee,
                    "sem2_fee": course.sem2_fee,
                    "sem3_fee": course.sem3_fee,
                    "sem4_fee": course.sem4_fee,
                    "sem5_fee": course.sem5_fee,
                    "sem6_fee": course.sem6_fee,
                    "sem7_fee": course.sem7_fee,
                    "sem8_fee": course.sem8_fee
                } for course in courses
            ]
        })

    return result
