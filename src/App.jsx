import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'

// Layout
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

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
import ProjectProgress from './pages/ProjectProgress'
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
          <Route path="/project/:id" element={
            <ProtectedRoute allowedRoles={['freelancer', 'client']}>
              <ProjectProgress />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
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
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  )
}

export default App
