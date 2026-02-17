import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { usersAPI } from '../services/api'
import {
    ArrowLeft, MapPin, Clock, Star, DollarSign, Briefcase, ExternalLink,
    CheckCircle, Mail, Loader2
} from 'lucide-react'
import './FreelancerProfile.css'

function FreelancerProfile() {
    const { id } = useParams()
    const { getAppliedJobs } = useData()
    const [freelancer, setFreelancer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchFreelancer = async () => {
            try {
                setLoading(true)
                const response = await usersAPI.getUser(id)
                const userData = response.data?.user || response.user

                if (userData) {
                    setFreelancer(userData)
                } else {
                    setError('Freelancer not found')
                }
            } catch (err) {
                console.error('Error fetching freelancer:', err)
                setError(err.message || 'Failed to load profile')
            } finally {
                setLoading(false)
            }
        }

        fetchFreelancer()
    }, [id])

    const appliedJobs = freelancer ? getAppliedJobs(freelancer.id || freelancer._id) : []

    if (loading) {
        return (
            <div className="profile-page page">
                <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary-500)" />
                </div>
            </div>
        )
    }

    if (error || !freelancer || freelancer.role !== 'freelancer') {
        return (
            <div className="profile-page page">
                <div className="container">
                    <div className="not-found">
                        <h2>Freelancer Not Found</h2>
                        <p>{error || "The profile you're looking for doesn't exist."}</p>
                        <Link to="/jobs" className="btn btn-primary">
                            Browse Jobs
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="profile-page page">
            <div className="container">
                <Link to="/jobs" className="back-link">
                    <ArrowLeft size={18} />
                    Back to Jobs
                </Link>

                <div className="profile-grid">
                    {/* Main Content */}
                    <div className="profile-main">
                        {/* Header Card */}
                        <div className="profile-header-card">
                            <div className="profile-header-content">
                                <div className="profile-avatar-large">
                                    {freelancer.name?.charAt(0)}
                                </div>
                                <div className="profile-header-info">
                                    <h1>{freelancer.name}</h1>
                                    <p className="profile-title">{freelancer.title || 'Freelancer'}</p>

                                    <div className="profile-meta">
                                        {freelancer.location && (
                                            <span className="meta-item">
                                                <MapPin size={16} />
                                                {freelancer.location}
                                            </span>
                                        )}
                                        {freelancer.experience && (
                                            <span className="meta-item">
                                                <Clock size={16} />
                                                {freelancer.experience} experience
                                            </span>
                                        )}
                                    </div>

                                    <div className="profile-badges">
                                        {freelancer.rating > 0 && (
                                            <span className="profile-badge rating">
                                                <Star size={14} fill="currentColor" />
                                                {freelancer.rating.toFixed(1)}
                                            </span>
                                        )}
                                        {freelancer.completedJobs > 0 && (
                                            <span className="profile-badge">
                                                <CheckCircle size={14} />
                                                {freelancer.completedJobs} jobs completed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        {freelancer.bio && (
                            <div className="profile-section">
                                <h2>About</h2>
                                <p className="profile-bio">{freelancer.bio}</p>
                            </div>
                        )}

                        {/* Skills Section */}
                        {freelancer.skills && freelancer.skills.length > 0 && (
                            <div className="profile-section">
                                <h2>Skills</h2>
                                <div className="skills-grid">
                                    {freelancer.skills.map((skill, index) => (
                                        <span key={index} className="skill-item">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Work History */}
                        {appliedJobs.length > 0 && (
                            <div className="profile-section">
                                <h2>Applied Projects</h2>
                                <div className="work-history">
                                    {appliedJobs.slice(0, 3).map((job) => (
                                        <Link to={`/jobs/${job.id}`} key={job.id} className="work-item">
                                            <div className="work-info">
                                                <h4>{job.title}</h4>
                                                <p>{job.company}</p>
                                            </div>
                                            <span className={`status-badge ${job.status}`}>
                                                {job.status}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <div className="sidebar-card">
                            <div className="rate-display">
                                <span className="rate-label">Hourly Rate</span>
                                <span className="rate-amount">${freelancer.hourlyRate || 0}</span>
                                <span className="rate-period">/hour</span>
                            </div>

                            <button className="btn btn-primary btn-lg hire-btn">
                                <Mail size={18} />
                                Contact Freelancer
                            </button>

                            <p className="sidebar-note">
                                Response time: Usually within 24 hours
                            </p>
                        </div>

                        {freelancer.portfolio && (
                            <div className="sidebar-card">
                                <h4>Portfolio</h4>
                                <a
                                    href={freelancer.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="portfolio-link"
                                >
                                    <ExternalLink size={16} />
                                    View Portfolio
                                </a>
                            </div>
                        )}

                        <div className="sidebar-card stats-card">
                            <div className="profile-stat">
                                <span className="stat-value">{freelancer.completedJobs || 0}</span>
                                <span className="stat-label">Jobs Completed</span>
                            </div>
                            <div className="profile-stat">
                                <span className="stat-value">{freelancer.rating || 0}</span>
                                <span className="stat-label">Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FreelancerProfile
