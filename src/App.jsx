import { createContext, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'

// Layout
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminLoginModal from './components/modals/AdminLoginModal'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import FreelancerProfile from './pages/FreelancerProfile'
import ClientDashboard from './pages/ClientDashboard'
import FreelancerDashboard from './pages/FreelancerDashboard'
import AdminPanel from './pages/AdminPanel'
import PostJob from './pages/PostJob'
import EditProfile from './pages/EditProfile'
import About from './pages/About'
import MyApplications from './pages/MyApplications'
import ProjectProgress from './pages/ProjectProgress'
import ClientProfile from './pages/ClientProfile'

import PhoneAuthTest from './pages/PhoneAuthTest'

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// Special Admin Route with Password Protection
function AdminRoute({ children }) {
  const { isAdminAuthenticated, adminLogin } = useAuth()
  const [showModal, setShowModal] = useState(true)

  if (isAdminAuthenticated) {
    return children
  }

  return (
    <>
      <AdminLoginModal
        isOpen={showModal}
        onClose={(success) => {
          if (success === true) {
            setShowModal(false)
          } else {
            setShowModal(false)
            window.location.href = '/'
          }
        }}
        onLogin={adminLogin}
      />
      <div style={{
        height: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'var(--gray-500)'
      }}>
        <div className="loader"></div>
        <p>This is a restricted area. Authentication required.</p>
      </div>
    </>
  )
}

function AppContent() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/freelancer/:id" element={<FreelancerProfile />} />
          <Route path="/client/:id" element={<ClientProfile />} />
          <Route path="/test-phone-auth" element={<PhoneAuthTest />} />

          {/* Protected Routes */}
          <Route path="/client/dashboard" element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/client/post-job" element={
            <ProtectedRoute allowedRoles={['client']}>
              <PostJob />
            </ProtectedRoute>
          } />

          <Route path="/freelancer/dashboard" element={
            <ProtectedRoute allowedRoles={['freelancer']}>
              <FreelancerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/freelancer/edit-profile" element={
            <ProtectedRoute allowedRoles={['freelancer']}>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/freelancer/my-applications" element={
            <ProtectedRoute allowedRoles={['freelancer']}>
              <MyApplications />
            </ProtectedRoute>
          } />

          <Route path="/project/:id" element={
            <ProtectedRoute allowedRoles={['freelancer', 'client']}>
              <ProjectProgress />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
