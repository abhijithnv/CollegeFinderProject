import React from 'react'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="text-teal-primary font-bold text-2xl">✦</div>
              <div className="text-teal-primary font-bold text-xl">CollegeFinder</div>
            </div>
            <p className="text-grey-text text-sm leading-relaxed max-w-xs">
              Your ultimate guide to finding the perfect college.
            </p>
            <div className="flex items-center gap-4 mt-4 text-grey-dark">
              <a href="#" aria-label="Facebook" className="hover:text-teal-primary transition-colors"><FaFacebookF size={14} /></a>
              <a href="#" aria-label="Twitter" className="hover:text-teal-primary transition-colors"><FaTwitter size={14} /></a>
              <a href="#" aria-label="Instagram" className="hover:text-teal-primary transition-colors"><FaInstagram size={14} /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-teal-primary transition-colors"><FaLinkedinIn size={14} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-grey-dark font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-grey-text">
              <li><a href="#home" className="hover:text-teal-primary transition-colors">Home</a></li>
              <li><a href="#features" className="hover:text-teal-primary transition-colors">Features</a></li>
              <li><a href="#colleges" className="hover:text-teal-primary transition-colors">Colleges</a></li>
              <li><a href="#about" className="hover:text-teal-primary transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-teal-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-grey-dark font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-grey-text">
              <li><a href="#" className="hover:text-teal-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-teal-primary transition-colors">Admissions Guide</a></li>
              <li><a href="#" className="hover:text-teal-primary transition-colors">Scholarships</a></li>
              <li><a href="#" className="hover:text-teal-primary transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-teal-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-grey-dark font-semibold mb-3">Contact Us</h4>
            <ul className="space-y-2 text-sm text-grey-text">
              <li><a href="mailto:support@collegefinder.com" className="hover:text-teal-primary transition-colors">support@collegefinder.com</a></li>
              <li><a href="tel:+15551234567" className="hover:text-teal-primary transition-colors">+1 (555) 123-4567</a></li>
              <li><span>123 University Ave, City, State 12345</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 text-xs text-center text-grey-text border-t border-grey-medium/40">
          © 2025 College Finder. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer


