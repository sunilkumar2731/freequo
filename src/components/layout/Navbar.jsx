import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, User, LogOut, LayoutDashboard, Briefcase, ChevronDown } from 'lucide-react'
import './Navbar.css'

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/')
        setDropdownOpen(false)
        setMobileMenuOpen(false)
    }

    const getDashboardLink = () => {
        if (!user) return '/'
        switch (user.role) {
            case 'admin': return '/admin'
            case 'client': return '/client/dashboard'
            case 'freelancer': return '/freelancer/dashboard'
            default: return '/'
        }
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/about" className="navbar-logo">
                    <img src="/freequo-logo.png" alt="Freequo" className="logo-image" />
                    <span className="logo-text">Freequo</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="navbar-links hide-mobile">
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                        Home
                    </Link>
                    <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>
                        Find Jobs
                    </Link>
                    {isAuthenticated && user?.role === 'client' && (
                        <Link to="/client/post-job" className={`nav-link ${isActive('/client/post-job') ? 'active' : ''}`}>
                            Post a Job
                        </Link>
                    )}
                </div>

                {/* Desktop Auth Actions */}
                <div className="navbar-actions hide-mobile">
                    {isAuthenticated ? (
                        <div className="user-menu">
                            <button
                                className="user-menu-trigger"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <div className="avatar avatar-sm">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="user-name">{user.name}</span>
                                <ChevronDown size={16} className={`chevron ${dropdownOpen ? 'rotated' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <>
                                    <div className="dropdown-overlay" onClick={() => setDropdownOpen(false)} />
                                    <div className="user-dropdown">
                                        <div className="dropdown-header">
                                            <div className="avatar">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="dropdown-name">{user.name}</div>
                                                <div className="dropdown-role">{user.role}</div>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider" />
                                        <Link
                                            to={getDashboardLink()}
                                            className="dropdown-item"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <LayoutDashboard size={18} />
                                            Dashboard
                                        </Link>
                                        {user.role === 'freelancer' && (
                                            <Link
                                                to="/freelancer/edit-profile"
                                                className="dropdown-item"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <User size={18} />
                                                Edit Profile
                                            </Link>
                                        )}
                                        {user.role === 'client' && (
                                            <Link
                                                to="/client/post-job"
                                                className="dropdown-item"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <Briefcase size={18} />
                                                Post a Job
                                            </Link>
                                        )}
                                        <div className="dropdown-divider" />
                                        <button className="dropdown-item logout" onClick={handleLogout}>
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary btn-sm">
                                Log In
                            </Link>
                            <Link to="/signup" className="btn btn-primary btn-sm">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn show-mobile"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu show-mobile">
                    <Link
                        to="/"
                        className={`mobile-link ${isActive('/') ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        to="/jobs"
                        className={`mobile-link ${isActive('/jobs') ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Find Jobs
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link
                                to={getDashboardLink()}
                                className="mobile-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            {user?.role === 'freelancer' && (
                                <Link
                                    to="/freelancer/edit-profile"
                                    className="mobile-link"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Edit Profile
                                </Link>
                            )}
                            {user?.role === 'client' && (
                                <Link
                                    to="/client/post-job"
                                    className="mobile-link"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Post a Job
                                </Link>
                            )}
                            <button className="mobile-link logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="mobile-auth">
                            <Link
                                to="/login"
                                className="btn btn-secondary"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Log In
                            </Link>
                            <Link
                                to="/signup"
                                className="btn btn-primary"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar
