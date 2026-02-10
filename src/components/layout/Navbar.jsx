import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Menu, X, User, LogOut, LayoutDashboard, Briefcase, ChevronDown, FileText, Shield, Sun, Moon } from 'lucide-react'
import './Navbar.css'

function Navbar() {
    const { user, isAuthenticated, logout, isAdminAuthenticated, adminLogout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const handleLogout = () => {
        if (isAdminAuthenticated) {
            adminLogout()
        } else {
            logout()
        }
        navigate('/')
        setDropdownOpen(false)
        setMobileMenuOpen(false)
    }

    const getDashboardLink = () => {
        if (isAdminAuthenticated) return '/admin'
        if (!user) return '/'
        switch (user.role) {
            case 'admin': return '/admin'
            case 'client': return '/client/dashboard'
            case 'freelancer': return '/freelancer/dashboard'
            default: return '/'
        }
    }

    const isActive = (path) => location.pathname === path

    const handleLogoClick = (e) => {
        if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const { theme, toggleTheme } = useTheme()

    return (
        <div className="navbar-wrapper">
            <nav className="navbar">
                <div className="navbar-container">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo" onClick={handleLogoClick}>
                        <img
                            src={theme === 'dark' ? '/freequo-logo-dark.png' : '/freequo-logo.png'}
                            alt="Freequo"
                            className="logo-image"
                        />
                        <span className="logo-text">Freequo</span>
                    </Link>

                    {/* Desktop Navigation (Center) */}
                    <div className="navbar-links hide-tablet">
                        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                            Home
                        </Link>

                        {(!user || user.role === 'freelancer') && (
                            <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>
                                Find Jobs
                            </Link>
                        )}

                        {user?.role === 'client' && (
                            <Link to="/client/post-job" className={`nav-link ${isActive('/client/post-job') ? 'active' : ''}`}>
                                Post a Job
                            </Link>
                        )}

                        <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                            About
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="navbar-actions">
                        {/* Theme Toggle */}
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        {isAuthenticated || isAdminAuthenticated ? (
                            <div className="user-menu">
                                <button
                                    className="user-menu-trigger"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <div className="user-avatar" style={isAdminAuthenticated ? { background: 'var(--error-500)' } : {}}>
                                        {isAdminAuthenticated ? 'A' : user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="user-name hide-tablet">
                                        {isAdminAuthenticated ? 'Admin Owner' : user?.name.split(' ')[0]}
                                    </span>
                                    <ChevronDown size={14} className={`chevron ${dropdownOpen ? 'rotated' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <>
                                        <div className="dropdown-overlay" onClick={() => setDropdownOpen(false)} />
                                        <div className="user-dropdown">
                                            <div className="dropdown-header">
                                                <div className="user-avatar" style={isAdminAuthenticated ? { background: 'var(--error-500)', width: '40px', height: '40px' } : { width: '40px', height: '40px' }}>
                                                    {isAdminAuthenticated ? 'A' : user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="dropdown-info">
                                                    <h4>{isAdminAuthenticated ? 'Admin Owner' : user?.name}</h4>
                                                    <p>{isAdminAuthenticated ? 'Platform Owner' : user?.role}</p>
                                                </div>
                                            </div>

                                            {isAdminAuthenticated ? (
                                                <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                    <Shield size={18} /> Control Center
                                                </Link>
                                            ) : (
                                                <>
                                                    <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                        <LayoutDashboard size={18} /> Dashboard
                                                    </Link>
                                                    {user.role === 'freelancer' && (
                                                        <>
                                                            <Link to="/freelancer/edit-profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                                <User size={18} /> Edit Profile
                                                            </Link>
                                                            <Link to="/freelancer/my-applications" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                                <FileText size={18} /> My Applications
                                                            </Link>
                                                        </>
                                                    )}
                                                    {user.role === 'client' && (
                                                        <Link to="/client/post-job" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                            <Briefcase size={18} /> Post a Job
                                                        </Link>
                                                    )}
                                                </>
                                            )}

                                            <div className="dropdown-divider" />
                                            <button className="dropdown-item logout" onClick={handleLogout}>
                                                <LogOut size={18} /> {isAdminAuthenticated ? 'Logout Admin' : 'Logout'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="auth-buttons hide-tablet">
                                <Link to="/login" className="btn btn-secondary btn-sm" style={{ border: 'none', background: 'transparent' }}>
                                    Log In
                                </Link>
                                <Link to="/signup" className="btn btn-primary btn-sm" style={{ borderRadius: '999px', padding: '0.6rem 1.5rem' }}>
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Toggle */}
                        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <Link to="/" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>

                        {(!user || user.role === 'freelancer') && (
                            <Link to="/jobs" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Find Jobs</Link>
                        )}

                        {user?.role === 'client' && (
                            <Link to="/client/post-job" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Post a Job</Link>
                        )}

                        <Link to="/about" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
                        <div className="dropdown-divider" />
                        {!isAuthenticated && !isAdminAuthenticated ? (
                            <div className="mobile-auth" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                                <Link to="/signup" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                            </div>
                        ) : (
                            <div style={{ padding: '0.5rem' }}>
                                <Link to={getDashboardLink()} className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                                <button className="mobile-link logout" onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                )}
            </nav>
        </div>
    )
}

export default Navbar
