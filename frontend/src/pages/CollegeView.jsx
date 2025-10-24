import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import { getCollegeById, toggleCollegeLike, getLikedColleges, addToCompare, getCompareList } from "../api/Addcollege";
import { API_CONFIG } from "../api/config";
import {
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
  FaChartLine,
  FaBriefcase,
  FaDollarSign,
  FaUserTie,
  FaBuilding,
  FaChartBar,
  FaEnvelope,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaHeart,
} from "react-icons/fa";
import { FiHeart } from "react-icons/fi";

const CollegeView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("undergraduate");
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [college, setCollege] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [isAddedToCompare, setIsAddedToCompare] = useState(false);
  const [isInCompareList, setIsInCompareList] = useState(false);

  // Fetch college data
  useEffect(() => {
    const fetchCollege = async () => {
      try {
        setIsLoading(true);
        const data = await getCollegeById(id);
        setCollege(data);
        console.log('College data loaded:', data);
      } catch (error) {
        console.error('Error fetching college:', error);
        setError('Failed to load college details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCollege();
    }
  }, [id]);

  // Check if college is liked (API-driven)
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!college) return;
      
      try {
        // Get user ID from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          setIsLiked(false);
          return;
        }
        
        const user = JSON.parse(userData);
        const userId = user.id || user.user_id || user.userId || 1;
        
        // Fetch user's liked colleges
        const likedData = await getLikedColleges(userId);
        const likedCollegeIds = likedData.liked_colleges?.map(college => college.id) || [];
        
        // Check if current college is in liked list
        const isCollegeLiked = likedCollegeIds.includes(college.id);
        setIsLiked(isCollegeLiked);
        
        console.log('College like status checked:', isCollegeLiked);
      } catch (error) {
        console.error('Error checking like status:', error);
        setIsLiked(false);
      }
    };

    checkLikeStatus();
  }, [college]);

  // Check if college is in compare list
  useEffect(() => {
    const checkCompareStatus = async () => {
      if (!college) return;
      
      try {
        // Get user ID from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          setIsAddedToCompare(false);
          return;
        }
        
        const user = JSON.parse(userData);
        const userId = user.id || user.user_id || user.userId || 1;
        
        // Fetch user's compare list
        const compareData = await getCompareList(userId);
        const compareCollegeIds = compareData.compared_colleges?.map(college => college.id) || [];
        
        // Check if current college is in compare list
        const isCollegeInCompare = compareCollegeIds.includes(college.id);
        setIsAddedToCompare(isCollegeInCompare);
        setIsInCompareList(isCollegeInCompare);
        
        console.log('College compare status checked:', isCollegeInCompare);
      } catch (error) {
        console.error('Error checking compare status:', error);
        setIsAddedToCompare(false);
      }
    };

    checkCompareStatus();
  }, [college]);

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!college) return;
    
    try {
      setLikeLoading(true);
      
      // Get user ID from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Please log in to like colleges');
        return;
      }
      
      const user = JSON.parse(userData);
      const userId = user.id || user.user_id || user.userId || 1;
      
      // Call API to toggle like
      const response = await toggleCollegeLike(college.id, userId);
      
      // Update local state based on API response
      setIsLiked(response.liked);
      
      console.log('Like toggled successfully:', response.message);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert(`Failed to update like status: ${error.message}`);
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle add to compare or navigate to compare
  const handleCompare = async () => {
    if (!college) return;
    
    // If already in compare list, navigate to compare page
    if (isInCompareList) {
      navigate('/compare');
      return;
    }
    
    try {
      setCompareLoading(true);
      
      // Get user ID from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Please log in to compare colleges');
        return;
      }
      
      const user = JSON.parse(userData);
      const userId = user.id || user.user_id || user.userId || 1;
      
      // Check current compare list size first
      const compareData = await getCompareList(userId);
      const currentCount = compareData.compared_colleges?.length || 0;
      
      if (currentCount >= 2) {
        alert('Comparison list is full! You can only compare up to 2 colleges. Remove a college first to add this one.');
        return;
      }
      
      // Call API to add college to compare list
      const response = await addToCompare(userId, college.id);
      
      console.log('College added to compare successfully:', response.message);
      setIsAddedToCompare(true);
      setIsInCompareList(true);
    } catch (error) {
      console.error('Error adding to compare:', error);
      
      // Check if it's a duplicate entry error
      if (error.message && error.message.includes('already exists')) {
        alert('This college is already in your comparison list!');
      } else {
        alert(`Failed to add to comparison: ${error.message}`);
      }
    } finally {
      setCompareLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-grey-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading college details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-grey-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-medium mb-2">Error Loading College</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/colleges')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Colleges
          </button>
        </div>
      </div>
    );
  }

  // No college data
  if (!college) {
    return (
      <div className="min-h-screen bg-grey-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg font-medium mb-2">College not found</p>
          <button 
            onClick={() => navigate('/colleges')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Colleges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-light">
      {/* Hero */}
      <section className="relative h-64 sm:h-72 md:h-80 lg:h-96 w-full overflow-hidden">
        <img
          src={`${API_CONFIG.BASE_URL}/college/${college.id}/image`}
          alt={college.college_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29sbGVnZXxlbnwwfHwwfHx8MA%3D%3D';
          }}
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/40 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <FaArrowLeft />
        </button>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {college.college_name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm opacity-90">
            {college.address} • admissions@horizon.edu
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button 
              onClick={handleCompare}
              disabled={compareLoading}
              className={`px-4 py-2 rounded-md text-xs sm:text-sm shadow transition-all duration-200 flex items-center gap-2 ${
                isInCompareList
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : compareLoading 
                    ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-600' 
                    : 'bg-white/80 text-black hover:bg-white/100'
              }`}
            >
              {compareLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                  Adding...
                </>
              ) : isInCompareList ? (
                'Go to Compare'
              ) : (
                'Compare'
              )}
            </button>
            <button 
              onClick={handleLikeToggle}
              disabled={likeLoading}
              className={`px-4 py-2 rounded-md text-xs sm:text-sm shadow transition-all duration-200 flex items-center gap-2 ${
                isLiked 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              } ${likeLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
            >
              {likeLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  {isLiked ? (
                    <FaHeart className="text-white" size={14} />
                  ) : (
                    <FiHeart className="text-white" size={14} />
                  )}
                  {isLiked ? 'Remove from Favorites' : 'Add to Favorites'}
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-15">
        <h2 className="text-center font-bold text-grey-dark mb-6 text-xl">
          Key Highlights
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { k: "Courses Offered", v: "75+" },
            { k: "Fees Start From", v: "75K/yr" },
            { k: "Placement Rate", v: "92%" },
            { k: "Accreditation", v: "NAAC A++" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border shadow-sm p-6 text-center"
              style={{ borderColor: "#e6e9ef" }}
            >
              <div className="text-xl font-extrabold text-grey-dark">
                {item.v}
              </div>
              <div className="mt-1 text-[11px] text-grey-text">{item.k}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-10">
        <div>
          <h3 className="text-sm font-bold text-grey-dark mb-2 ">
            About {college.college_name}
          </h3>
          <div className="text-[13px] leading-relaxed text-grey-text">
            {college.about}
          </div>
        </div>
      </section>

      {/* Campus Gallery */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-10">
        <h3 className="text-center font-bold text-grey-dark mb-6 text-xl">
          Campus Gallery
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            "https://th-i.thgim.com/public/incoming/5y4at3/article69263760.ece/alternates/FREE_1200/IMG_maharajas_college_04_2_1_5TAFVUA6.jpg",
            "https://img.onmanorama.com/content/dam/mm/en/news/kerala/images/june-15/maharajas-college.jpg",
            "https://r2-pub.csimadhyakeraladiocese.org/optm/images/4b460d40-03a1-4cf2-ae3b-7d6dc729077a",
            "https://www.shutterstock.com/image-photo/thiruvananthapuram-kerala-india-march-10-600nw-1799385472.jpg",
            "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=800&auto=format&fit=crop",
            "https://images.indianexpress.com/2019/08/kerala-univ-759.jpg",
          ].map((src, idx) => (
            <div key={idx} className="aspect-[4/3] rounded-xl overflow-hidden">
              <img
                src={src}
                alt={`Campus view ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Courses & Fees */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-20">
        <h3 className="text-center font-bold text-grey-dark mb-6 text-xl">
          Courses & Fees
        </h3>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-grey-light rounded-lg p-1 flex">
            {college.courses && (
              <>
                {college.courses.some(course => course.category === "UG") && (
                  <button
                    onClick={() => setActiveTab("undergraduate")}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "undergraduate"
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-grey-text hover:text-grey-dark"
                    }`}
                  >
                    Undergraduate
                  </button>
                )}
                {college.courses.some(course => course.category === "PG") && (
                  <button
                    onClick={() => setActiveTab("postgraduate")}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "postgraduate"
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-grey-text hover:text-grey-dark"
                    }`}
                  >
                    Postgraduate
                  </button>
                )}
                {college.courses.some(course => course.category === "Engineering") && (
                  <button
                    onClick={() => setActiveTab("Engineering")}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "Engineering"
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-grey-text hover:text-grey-dark"
                    }`}
                  >
                    Engineering
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Course Cards */}
        <div className="space-y-4">
          {(() => {
            const filteredCourses = college.courses?.filter(course => 
              course.category === activeTab || 
              (activeTab === "undergraduate" && course.category === "UG") || 
              (activeTab === "postgraduate" && course.category === "PG")
            ) || [];
            
            if (filteredCourses.length === 0) {
              return (
                <div className="text-center py-8">
                  <p className="text-gray-500">No courses found for this category.</p>
                </div>
              );
            }
            
            return filteredCourses.map((course, index) => (
            <div
              key={course.id}
              className="bg-white rounded-lg border shadow-sm"
              style={{ borderColor: "#e6e9ef" }}
            >
              <button
                onClick={() =>
                  setExpandedCourse(
                    expandedCourse === course.id ? null : course.id
                  )
                }
                className="w-full p-4 flex items-center justify-between text-left hover:bg-grey-light/30 transition-colors"
              >
                <h4 className="font-semibold text-grey-dark">{course.course_name}</h4>
                {expandedCourse === course.id ? (
                  <FaChevronUp className="text-grey-text" />
                ) : (
                  <FaChevronDown className="text-grey-text" />
                )}
              </button>

              {expandedCourse === course.id && (
                <div
                  className="px-4 pb-4 border-t"
                  style={{ borderColor: "#e6e9ef" }}
                >
                  <p className="text-sm text-grey-text mb-4 mt-4 leading-relaxed">
                    {course.course_about}
                  </p>

                  <div className="mb-3">
                    <h5 className="font-semibold text-grey-dark text-sm mb-2">
                      Semester-wise Fees:
                    </h5>
                    <div className="bg-grey-light/50 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-2 gap-0 text-xs font-medium text-grey-dark bg-grey-light p-2">
                        <div>Semester</div>
                        <div className="text-right">Amount</div>
                      </div>
                      {[
                        { semester: "Semester 1", fee: course.sem1_fee },
                        { semester: "Semester 2", fee: course.sem2_fee },
                        { semester: "Semester 3", fee: course.sem3_fee },
                        { semester: "Semester 4", fee: course.sem4_fee },
                        { semester: "Semester 5", fee: course.sem5_fee },
                        { semester: "Semester 6", fee: course.sem6_fee },
                        { semester: "Semester 7", fee: course.sem7_fee },
                        { semester: "Semester 8", fee: course.sem8_fee },
                      ].filter(item => item.fee !== null && item.fee !== undefined).map((item, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-2 gap-0 text-sm p-2 border-t"
                          style={{ borderColor: "#e6e9ef" }}
                        >
                          <div className="text-grey-text">{item.semester}</div>
                          <div className="text-right font-semibold text-grey-dark">
                            ₹{item.fee?.toLocaleString() || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            ));
          })()}
        </div>
      </section>

      {/* Student Placement Information */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h3 className="text-center font-bold text-grey-dark mb-6 text-xl">
          Student Placement Information
        </h3>

        {/* Hero/summary card */}
        <div className="relative overflow-hidden rounded-2xl mb-8">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,208,138,0.35) 0%, rgba(245,167,66,0.60) 50%, rgba(255,208,138,0.35) 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 2px, transparent 2px, transparent 8px)",
            }}
          />
          <div
            className="relative bg-white/70 backdrop-blur p-6 sm:p-8 text-center border rounded-2xl shadow-sm"
            style={{ borderColor: "#fff" }}
          >
            <p className="text-[13px] leading-relaxed text-grey-dark">
              Our Career Services team partners with{" "}
              <span className="font-semibold">top recruiters</span> to enable
              internships and full-time offers across technology, finance,
              consulting, and emerging sectors. With industry-aligned curriculum
              and mentoring, our graduates consistently achieve strong outcomes.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[11px] text-grey-text">
              <span
                className="inline-flex items-center gap-2 bg-white/85 border px-3 py-1 rounded-full"
                style={{ borderColor: "rgba(245,167,66,0.35)" }}
              >
                <FaUserTie className="text-orange-500" /> Interview Readiness
              </span>
              <span
                className="inline-flex items-center gap-2 bg-white/85 border px-3 py-1 rounded-full"
                style={{ borderColor: "rgba(245,167,66,0.35)" }}
              >
                <FaBuilding className="text-orange-500" /> Corporate Tie-ups
              </span>
              <span
                className="inline-flex items-center gap-2 bg-white/85 border px-3 py-1 rounded-full"
                style={{ borderColor: "rgba(245,167,66,0.35)" }}
              >
                <FaChartBar className="text-orange-500" /> Domain Workshops
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Stat 1 */}
          <div
            className="group relative bg-white rounded-xl border shadow-sm p-6 text-center transition-transform hover:-translate-y-1"
            style={{ borderColor: "#e6e9ef" }}
          >
            <span
              className="absolute left-0 top-0 h-1 w-full rounded-t-xl"
              style={{ backgroundColor: "#f5a742" }}
            />
            <div
              className="mx-auto mb-3 inline-flex items-center justify-center w-10 h-10 rounded-full"
              style={{ backgroundColor: "rgba(245,167,66,0.12)" }}
            >
              <FaChartLine size={20} color="#f5a742" />
            </div>
            <div
              className="text-2xl font-extrabold"
              style={{ color: "#f05a5a" }}
            >
              92%
            </div>
            <div className="mt-1 text-[11px] text-grey-text">
              Graduates Employed within 6 Months
            </div>
          </div>

          {/* Stat 2 */}
          <div
            className="group relative bg-white rounded-xl border shadow-sm p-6 text-center transition-transform hover:-translate-y-1"
            style={{ borderColor: "#e6e9ef" }}
          >
            <span
              className="absolute left-0 top-0 h-1 w-full rounded-t-xl"
              style={{ backgroundColor: "#f5a742" }}
            />
            <div
              className="mx-auto mb-3 inline-flex items-center justify-center w-10 h-10 rounded-full"
              style={{ backgroundColor: "rgba(245,167,66,0.12)" }}
            >
              <FaBriefcase size={20} color="#f5a742" />
            </div>
            <div
              className="text-2xl font-extrabold"
              style={{ color: "#f05a5a" }}
            >
              500+
            </div>
            <div className="mt-1 text-[11px] text-grey-text">
              Hiring Partners Annually
            </div>
          </div>

          {/* Stat 3 */}
          <div
            className="group relative bg-white rounded-xl border shadow-sm p-6 text-center transition-transform hover:-translate-y-1"
            style={{ borderColor: "#e6e9ef" }}
          >
            <span
              className="absolute left-0 top-0 h-1 w-full rounded-t-xl"
              style={{ backgroundColor: "#f5a742" }}
            />
            <div
              className="mx-auto mb-3 inline-flex items-center justify-center w-10 h-10 rounded-full"
              style={{ backgroundColor: "rgba(245,167,66,0.12)" }}
            >
              <FaDollarSign size={20} color="#f5a742" />
            </div>
            <div
              className="text-2xl font-extrabold"
              style={{ color: "#f05a5a" }}
            >
              $65k+
            </div>
            <div className="mt-1 text-[11px] text-grey-text">
              Average Starting Salary
            </div>
          </div>
        </div>

        {/* Recruiters strip */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {["Accenture", "TCS", "Infosys", "Amazon", "Deloitte", "PwC"].map(
            (r) => (
              <span
                key={r}
                className="px-3 py-1 text-[12px] rounded-full border"
                style={{
                  backgroundColor: "rgba(245,167,66,0.08)",
                  borderColor: "rgba(245,167,66,0.25)",
                }}
              >
                {r}
              </span>
            )
          )}
        </div>
      </section>
      {/* Contact Us */}
      <section className="max-w-6xl mx-auto px-4 pb-25">
        <h3 className="text-center font-bold text-grey-dark mb-6 text-xl">
          Contact Us
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Email */}
          <div
            className="bg-white rounded-xl border shadow-sm p-5"
            style={{ borderColor: "#e6e9ef" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ backgroundColor: "rgba(245,167,66,0.12)" }}
              >
                <FaEnvelope size={16} color="#f5a742" />
              </div>
              <div>
                <div className="text-[12px] font-semibold text-grey-dark">
                  Admissions Email
                </div>
                <div className="text-[12px] text-grey-text mt-1">
                  admissions@horizon.edu
                </div>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div
            className="bg-white rounded-xl border shadow-sm p-5"
            style={{ borderColor: "#e6e9ef" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ backgroundColor: "rgba(245,167,66,0.12)" }}
              >
                <FaMobileAlt size={16} color="#f5a742" />
              </div>
              <div>
                <div className="text-[12px] font-semibold text-grey-dark">
                  Admissions Phone
                </div>
                <div className="text-[12px] text-grey-text mt-1">
                  +1 (555) 123-4567
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div
            className="bg-white rounded-xl border shadow-sm p-5"
            style={{ borderColor: "#e6e9ef" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ backgroundColor: "rgba(245,167,66,0.12)" }}
              >
                <FaMapMarkerAlt size={16} color="#f5a742" />
              </div>
              <div>
                <div className="text-[12px] font-semibold text-grey-dark">
                  Campus Address
                </div>
                <div className="text-[12px] text-grey-text mt-1">
                  456 Learning Lane, Education City, State, Country
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <Footer /> */}
    </div>
  );
};

export default CollegeView;
