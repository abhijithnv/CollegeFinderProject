import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { FaSearch, FaChartBar, FaGlobe, FaUsers } from 'react-icons/fa'

// Animated Card Component
const AnimatedCard = ({ children, direction = 'left', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start animation sequence
          setIsAnimating(true)
          setIsVisible(false)
          
          // Force a small delay to ensure proper reset
          setTimeout(() => {
            setIsVisible(true)
          }, delay + 100)
        } else {
          // Reset everything when out of view
          setIsAnimating(false)
          setIsVisible(false)
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const transformClass = direction === 'left' 
    ? (isVisible ? 'translate-x-0' : '-translate-x-full')
    : (isVisible ? 'translate-x-0' : 'translate-x-full')

  return (
    <div 
      ref={ref}
      className={`transform transition-all duration-1000 ease-out ${transformClass}`}
      style={{
        transform: isAnimating ? (direction === 'left' ? (isVisible ? 'translateX(0)' : 'translateX(-100%)') : (isVisible ? 'translateX(0)' : 'translateX(100%)')) : undefined
      }}
    >
      {children}
    </div>
  )
}

// Rolling Number Component
const RollingNumber = ({ target, duration = 2000, startOffset = 0.1 }) => {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reset to start value and trigger animation every time
          const startValue = Math.floor(target * (1 - startOffset))
          setCurrent(startValue)
          setIsAnimating(true)
        } else {
          setIsAnimating(false)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [target, startOffset])

  useEffect(() => {
    if (!isAnimating) return

    const startValue = Math.floor(target * (1 - startOffset))
    const increment = (target - startValue) / (duration / 16)
    let currentValue = startValue

    const timer = setInterval(() => {
      currentValue += increment
      if (currentValue >= target) {
        setCurrent(target)
        clearInterval(timer)
        setIsAnimating(false)
      } else {
        setCurrent(Math.floor(currentValue))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isAnimating, target, duration, startOffset])

  return (
    <div ref={ref}>
      {current.toLocaleString()}+
    </div>
  )
}

// Testimonial Card Component
const TestimonialCard = ({ name, image, quote, isDuplicate = false }) => (
  <div className="w-1/3 flex-shrink-0 px-1 py-5">
    <div className="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 h-45">
      <div className="flex flex-col h-full text-center">
        {/* Quote at the top - 3 lines */}
        <blockquote className="text-sm text-grey-text italic mt-6 leading-relaxed flex-1 line-clamp-3">
          "{quote}"
        </blockquote>
        
        {/* Profile and name on the same line at the bottom - centered */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-8 h-8 mr-2 rounded-full overflow-hidden flex-shrink-0">
            <img 
              src={image} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <p className="text-teal-primary font-medium text-sm">
            {name}
          </p>
        </div>
      </div>
    </div>
  </div>
)

// Testimonial Carousel Component
const TestimonialCarousel = () => {
  // Testimonial data - 4 cards only
  const testimonials = [
    {
      name: "Aisha Khan",
      image: "https://www.shutterstock.com/image-photo/portrait-cheerful-male-international-indian-600nw-2071252046.jpg",
      quote: "College Finder helped me discover my dream university abroad. The comparison tools were incredibly useful!"
    },
    {
      name: "Rahul Sharma",
      image: "https://media.istockphoto.com/id/509349623/photo/happy-bookworm.jpg?s=612x612&w=0&k=20&c=2fPCQ8plw0TmUZH2tlnCTEkCrmbG_nkihDmyJPrg-EY=",
      quote: "I was overwhelmed with choices, but College Finder simplified everything. Found the perfect engineering program!"
    },
    {
      name: "Priya Patel",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=400&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tYW4lMjBwcm9maWxlJTIwcGhvdG98ZW58MHx8MHx8fDA%3D",
      quote: "The platform made it so easy to compare universities. I found my ideal business school in just a few clicks!"
    },
  ]

  return (
    <div className="relative">
      {/* Cards Container */}
      <div className="overflow-hidden">
        <div className="flex">
          {/* All 4 Testimonial Cards */}
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              image={testimonial.image}
              quote={testimonial.quote}
            />
          ))}
        </div>
      </div>
      
    </div>
  )
}

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-grey-light">
      <Header />
      
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden pt-20">
        {/* Background Illustrations */}
        <div className="absolute inset-0 z-10">
        
          {/* Background Elements */}
          <div className="absolute inset-0 z-20">
            {/* People Illustrations */}
            <div className="absolute top-1/6 left-2/10 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-18 lg:h-18 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full opacity-70 blur-xs transform -rotate-12 animate-bounce-slow"></div>
            <div className="absolute top-2/4 right-1/6 w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full opacity-70 blur-xs transform rotate-12 animate-float"></div>
            <div className="absolute bottom-2/5 left-1/4 w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full opacity-70 blur-xs transform -rotate-6 animate-bounce-slow-delayed"></div>
            <div className="absolute top-2/5 right-1/5 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-300 to-green-400 rounded-full opacity-70 blur-xs transform rotate-12 animate-float-delayed"></div>
            <div className="absolute bottom-1/3 right-1/3 w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-18 lg:h-18 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full opacity-70 blur-xs transform -rotate-8 animate-bounce-slow"></div>
            <div className="absolute top-1/8 right-1/8 w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-15 lg:h-15 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full opacity-60 blur-xs transform rotate-15 animate-float"></div>
            <div className="absolute bottom-1/6 left-1/6 w-10 h-10 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-22 lg:h-22 bg-gradient-to-br from-cyan-300 to-cyan-400 rounded-full opacity-65 blur-xs transform -rotate-20 animate-bounce-slow"></div>
            <div className="absolute top-1/3 right-1/12 w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-indigo-300 to-indigo-400 rounded-full opacity-55 blur-xs transform rotate-25 animate-float-delayed"></div>
            <div className="absolute bottom-1/4 right-1/6 w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-rose-300 to-rose-400 rounded-full opacity-70 blur-xs transform -rotate-10 animate-bounce-slow-delayed"></div>
            
            {/* Plants */}
            <div className="absolute bottom-1/10 right-2/7 w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full opacity-70 blur-xs transform -rotate-12 animate-float"></div>
            <div className="absolute top-1/3 left-1/12 w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-16 lg:w-12 lg:h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full opacity-70 blur-xs transform rotate-20 animate-bounce-slow"></div>
            <div className="absolute bottom-1/4 left-1/3 w-6 h-8 sm:w-8 sm:h-10 md:w-10 md:h-14 lg:w-10 lg:h-10 bg-gradient-to-br from-green-300 to-green-400 rounded-full opacity-60 blur-xs transform rotate-15 animate-float-delayed"></div>
            
            {/* Abstract Shapes */}
            <div className="absolute top-1/3 left-1/4 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-8 lg:h-8 bg-teal-primary opacity-20 rounded-full blur-xs animate-bounce-slow"></div>
            <div className="absolute bottom-1/4 left-1/4 w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 lg:w-10 lg:h-10 bg-pink-300 opacity-20 rounded-full blur-xs animate-float"></div>
            <div className="absolute top-1/2 right-1/3 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-8 lg:h-8 bg-blue-300 opacity-20 rounded-full blur-xs animate-bounce-slow-delayed"></div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-40 w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-14 text-center">
          <div className="max-w-xl sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
            <div className="text-grey-text font-medium text-xs sm:text-sm md:text-base mb-2 tracking-wide">
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-6xl font-bold text-grey-dark leading-tight mb-4 sm:mb-6 max-w-full mx-auto">
              <span className="block">Find Your Perfect College</span>
              <span className="block">in Just a Few Clicks</span>
            </h1>
            <p className="text-sm sm:text-lg md:text-lg lg:text-xl text-grey-text mb-6 sm:mb-8 md:mb-12 leading-relaxed">
              Filter by budget, course, and location. Compare colleges and make an informed choice for your future.
            </p>
              <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap">
                <button 
                  className="text-white px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2 lg:px-6 lg:py-2 xl:px-6 xl:py-2.5 rounded-full font-medium sm:font-semibold text-sm sm:text-sm md:text-sm lg:text-lg xl:text-lg transition-colors duration-300 shadow-sm border-2" 
                  style={{backgroundColor: '#f5a742', borderColor: '#f5a742'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f78f05'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f5a742'}
                  onClick={() => navigate('/signin')}
                >
                  Start Finding Colleges
                </button>
                <button 
                  className="hidden sm:block bg-white text-grey-dark px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2 lg:px-6 lg:py-2 xl:px-6 xl:py-2.5 rounded-full font-medium sm:font-semibold text-sm sm:text-sm md:text-sm lg:text-lg xl:text-lg transition-colors duration-300 shadow-sm"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                  }}
                  onClick={() => navigate('/signin')}
                >
                  Learn More
                </button>
              </div>
          </div>
        </div>
        </section>

        {/* Statistics Section */}
        <section id="statistics" className="py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-br from-grey-medium to-grey-light relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-20 h-20 bg-teal-primary rounded-full"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-orange-400 rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-400 rounded-full"></div>
            <div className="absolute bottom-10 right-1/3 w-14 h-14 bg-purple-400 rounded-full"></div>
          </div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center relative z-10">
            {/* Section Heading */}
            <div className="mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-grey-dark mb-4">
                Empowering Students Globally
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-teal-primary to-orange-400 mx-auto rounded-full"></div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
              {/* Card 1 - Colleges */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-white/20 group">
                <div className="relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 group-hover:scale-105 transition-transform duration-300" style={{color: '#f5a742'}}>
                    <RollingNumber target={450} duration={1500} startOffset={0.1} />
                  </div>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-teal-primary to-orange-400 mx-auto mb-3 sm:mb-4 rounded-full"></div>
                </div>
                <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-grey-text font-semibold tracking-wide">
                  Colleges Worldwide
                </div>
              </div>
              
              {/* Card 2 - Courses */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-white/20 group">
                <div className="relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 group-hover:scale-105 transition-transform duration-300" style={{color: '#f5a742'}}>
                    <RollingNumber target={10000} duration={1500} startOffset={0.1} />
                  </div>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-teal-primary to-orange-400 mx-auto mb-3 sm:mb-4 rounded-full"></div>
                </div>
                <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-grey-text font-semibold tracking-wide">
                  Courses Available
                </div>
              </div>
              
              {/* Card 3 - Students */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-white/20 group">
                <div className="relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 group-hover:scale-105 transition-transform duration-300" style={{color: '#f5a742'}}>
                    <RollingNumber target={500} duration={1500} startOffset={0.1} />
                  </div>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-teal-primary to-orange-400 mx-auto mb-3 sm:mb-4 rounded-full"></div>
                </div>
                <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-grey-text font-semibold tracking-wide">
                  Students Guided
                </div>
              </div>
            </div>
          </div>
        </section>

         {/* Featured Colleges Section */}
         <section id="colleges" className="py-16 sm:py-20 md:py-24 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            {/* Section Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-grey-dark text-center mb-12 sm:mb-16">
              Discover Our Featured Colleges
            </h2>
            
            {/* College Cards Carousel */}
            <div className="relative">
              {/* College Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {/* Card 1 - Phoenix University */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                  <div className="relative h-64 bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29sbGVnZSUyMGNhbXB1c3xlbnwwfHwwfHx8MA%3D%3D)'}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-2">Phoenix University</h3>
                      <p className="text-sm opacity-90 mb-2">Arizona, USA</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">₹ 15 Lakhs/year</p>
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs opacity-90">(4.5)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Tech Global Institute */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                  <div className="relative h-64 bg-cover bg-center" style={{backgroundImage: 'url(https://live.staticflickr.com/2322/3555655023_f962515b96_b.jpg)'}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-2">Tech Global Institute</h3>
                      <p className="text-sm opacity-90 mb-2">London, UK</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">₹ 20 Lakhs/year</p>
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs opacity-90">(5.0/5)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Grand State University */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                  <div className="relative h-64 bg-cover bg-center" style={{backgroundImage: 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJKn9mTyn3l37b_v8odSBJqD4Ct6N6xok8Ug&s)'}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-2">Grand State University</h3>
                      <p className="text-sm opacity-90 mb-2">Sydney, AUS</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">₹ 12 Lakhs/year</p>
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs opacity-90">(4.0/5)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4 - Apex Business School */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                  <div className="relative h-64 bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1562774053-701939374585?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnVzaW5lc3MlMjBzY2hvb2wlMjBidWlsZGluZ3xlbnwwfHwwfHx8MA%3D%3D)'}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-2">Apex Business School</h3>
                      <p className="text-sm opacity-90 mb-2">Dubai, UAE</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">₹ 18 Lakhs/year</p>
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs opacity-90">(4.0/5)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-12 md:py-18 lg:py-20 bg-gradient-to-br from-grey-light to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
            {/* Section Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-grey-dark mb-4 sm:mb-6">
              Unlock Your Potential with College Finder
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-grey-text mb-12 sm:mb-16 md:mb-20 max-w-3xl mx-auto">
              Discover the perfect college for your future with our comprehensive platform designed for students worldwide.
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
              {/* Card 1 - Smart Search */}
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300 hover:-translate-y-1 group">
                <div className="w-16 h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center rounded-full group-hover:scale-110 transition-all duration-300 relative">
                  <FaSearch size={32} style={{color: '#f5a742', zIndex: 10, position: 'relative'}} />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-grey-dark mb-3 sm:mb-4 group-hover:text-teal-primary transition-colors duration-300">
                  Smart Search
                </h3>
                <p className="text-sm sm:text-base text-grey-text leading-relaxed">
                  Find colleges matching your exact preferences with advanced filters and AI-driven recommendations.
                </p>
              </div>
              
              {/* Card 2 - Instant Comparison */}
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300 hover:-translate-y-1 group">
                <div className="w-16 h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center rounded-full group-hover:scale-110 transition-all duration-300 relative" >
                  <FaChartBar size={32} style={{color: '#f5a742', zIndex: 10, position: 'relative'}} />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-grey-dark mb-3 sm:mb-4 group-hover:text-teal-primary transition-colors duration-300">
                  Instant Comparison
                </h3>
                <p className="text-sm sm:text-base text-grey-text leading-relaxed">
                  Compare multiple colleges side-by-side on key metrics like fees, courses, and student life.
                </p>
              </div>
              
              {/* Card 3 - Global Database */}
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300 hover:-translate-y-1 group">
                <div className="w-16 h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center rounded-full group-hover:scale-110 transition-all duration-300 relative">
                  <FaGlobe size={32} style={{color: '#f5a742', zIndex: 10, position: 'relative'}} />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-grey-dark mb-3 sm:mb-4 group-hover:text-teal-primary transition-colors duration-300">
                  Global Database
                </h3>
                <p className="text-sm sm:text-base text-grey-text leading-relaxed">
                  Access a comprehensive database of universities from every corner of the world.
                </p>
              </div>
              
              {/* Card 4 - Student-Friendly UI */}
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300 hover:-translate-y-1 group">
                <div className="w-16 h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center rounded-full group-hover:scale-110 transition-all duration-300 relative">
                  <FaUsers size={32} style={{color: '#f5a742', zIndex: 10, position: 'relative'}} />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-grey-dark mb-3 sm:mb-4 group-hover:text-teal-primary transition-colors duration-300">
                  Student-Friendly UI
                </h3>
                <p className="text-sm sm:text-base text-grey-text leading-relaxed">
                  Navigate effortlessly through a clean, intuitive, and mobile-responsive interface.
                </p>
              </div>
            </div>
          </div>
        </section>

       

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-br from-grey-light to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
            {/* Section Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-grey-dark mb-12 sm:mb-16">
              What Our Students Say
            </h2>
            
            {/* Testimonial Carousel */}
            <TestimonialCarousel />
          </div>
        </section>

        {/* Call-to-Action Banner Section */}
        <section id="contact" className="py-16 sm:py-20 md:py-24 lg:py-28" style={{ background: 'linear-gradient(90deg, #ffd08a 0%, #f5a742 20%, #f5a742 80%, #ffd08a 100%)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
              Find Your Perfect College Today
            </h2>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-xl text-white mb-8 sm:mb-10 leading-relaxed">
              Don't wait any longer to kickstart your academic journey. College Finder makes it simple, fast, and free.
            </p>
            
            {/* Call-to-Action Button */}
            <button 
              className="bg-white text-grey-dark px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 rounded-full font-semibold text-sm sm:text-base md:text-lg lg:text-xl transition-all duration-300 hover:bg-grey-light hover:scale-105 shadow-lg"
              onClick={() => navigate('/signin')}
            >
              Start Now - It's Free
            </button>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  export default Home
