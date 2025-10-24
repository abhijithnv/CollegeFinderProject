import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import CollegeListing from './pages/CollegeListing'
import CollegeView from './pages/CollegeView'
import Liked from './pages/Liked'
import Compare from './pages/Compare'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'

// Admin imports
import AdminCollegeListing from './pages/admin/AdminCollegeListing'
import AddCollege from './pages/admin/AddCollege'

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={
            <ProtectedRoute requireAuth={false}>
              <SignIn />
            </ProtectedRoute>
          } />
          <Route path="/signup" element={
            <ProtectedRoute requireAuth={false}>
              <SignUp />
            </ProtectedRoute>
          } />
          
          {/* Protected Routes - Require Authentication */}
          <Route path="/colleges" element={
            <ProtectedRoute requireAuth={true}>
              <CollegeListing />
            </ProtectedRoute>
          } />
          <Route path="/college/:id" element={
            <ProtectedRoute requireAuth={true}>
              <CollegeView />
            </ProtectedRoute>
          } />
          <Route path="/liked" element={
            <ProtectedRoute requireAuth={true}>
              <Liked />
            </ProtectedRoute>
          } />
          <Route path="/compare" element={
            <ProtectedRoute requireAuth={true}>
              <Compare />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes - Require Admin Authentication */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminCollegeListing />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/colleges" element={
            <AdminProtectedRoute>
              <AdminCollegeListing />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/colleges/add" element={
            <AdminProtectedRoute>
              <AddCollege />
            </AdminProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
