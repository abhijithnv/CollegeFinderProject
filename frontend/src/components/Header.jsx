import React from 'react'
import { Link } from 'react-router-dom'

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const Header = () => {
  return (
    <header className="bg-white py-3 md:py-4 fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 sm:gap-2">
          <div className="text-xl sm:text-xl md:text-xl lg:text-3xl xl:text-3xl text-teal-primary font-bold">✦</div>
          <span className="text-base sm:text-base md:text-base lg:text-xl xl:text-xl text-teal-primary font-bold font-sans">CampusX</span>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex gap-4 lg:gap-6 xl:gap-8 items-center">
          <button 
            onClick={() => scrollToSection('home')}
            className="text-teal-primary font-medium text-xs lg:text-base xl:text-base hover:scale-110 transition-transform duration-300"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('statistics')}
            className="text-grey-text font-medium text-xs lg:text-base xl:text-base hover:text-teal-primary hover:scale-110 transition-all duration-300"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('colleges')}
            className="text-grey-text font-medium text-xs lg:text-base xl:text-base hover:text-teal-primary hover:scale-110 transition-all duration-300"
          >
            Colleges
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className="text-grey-text font-medium text-xs lg:text-base xl:text-base hover:text-teal-primary hover:scale-110 transition-all duration-300"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact')}
            className="text-grey-text font-medium text-xs lg:text-base xl:text-base hover:text-teal-primary hover:scale-110 transition-all duration-300"
          >
            Contact
          </button>
        </nav>
        
        {/* Call-to-Action Button */}
        <div className="flex items-center">
            <Link 
              to="/signin"
              className="text-white px-2 py-2 sm:px-4 sm:py-2.5 md:px-4 md:py-2 lg:px-6 lg:py-2 xl:px-6 xl:py-2.5 rounded-full font-medium sm:font-semibold text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm transition-colors duration-300 shadow-sm border-2" 
              style={{backgroundColor: '#f5a742', borderColor: '#f5a742'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f78f05'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f5a742'}
            >
              Get Started
            </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
