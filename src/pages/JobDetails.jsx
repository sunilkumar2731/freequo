import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import {
    ArrowLeft,
    MapPin,
    Clock,
    DollarSign,
    Briefcase,
    Calendar,
    Users,
    CheckCircle,
    AlertCircle,
    User
} from 'lucide-react'
import './JobDetails.css'

function JobDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dataContext = useData()
    const { user, isAuthenticated, getUserById } = useAuth()

    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)

    // Safety check for data context
    if (!dataContext) {
        return (
            <div className="job-details-page page">
                <div className="container">
                    <div className="not-found">
                        <AlertCircle size={48} />
                        <h2>Loading...</h2>
                        <p>Please wait while we load the job details.</p>
                    </div>
                </div>
            </div>
        )
    }

    const { getJobById, applyToJob, loading } = dataContext

    console.log('JobDetails - ID from URL:', id)
    console.log('JobDetails - Loading:', loading)

    const job = getJobById ? getJobById(id) : null

    console.log('JobDetails - Job found:', job)

    // Show loading state
    if (loading) {
        return (
            <div className="job-details-page page">
                <div className="container">
                    <div className="not-found">
                        <h2>Loading job details...</h2>
                    </div>
                </div>
            </div>
        )
    }

    if (!job) {
        return (
            <div className="job-details-page page">
                <div className="container">
                    <div className="not-found">
                        <AlertCircle size={48} />
                        <h2>Job Not Found</h2>
                        <p>The job you're looking for doesn't exist or has been removed.</p>
                        <Link to="/jobs" className="btn btn-primary">
                            Browse Jobs
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Safety checks for job data
    const hasApplied = user && Array.isArray(job.applicants) && job.applicants.includes(user.id)
    const isOwner = user && (job.clientId === user.id || job.client === user.id || job.client?._id === user.id)
    const canApply = isAuthenticated && user?.role === 'freelancer' && !hasApplied && !isOwner

    const handleApply = () => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        setApplying(true)
        setTimeout(() => {
            applyToJob(job._id || job.id, user.id)
            setApplying(false)
            setApplied(true)
        }, 800)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatBudget = () => {
        if (job.budgetType === 'hourly') {
            return `$${job.budget}/hour`
        }
        return `$${job.budget.toLocaleString()}`
    }

    return (
        <div className="job-details-page page">
            <div className="container">
                {/* Back Button */}
                <Link to="/jobs" className="back-link">
                    <ArrowLeft size={18} />
                    Back to Jobs
                </Link>

                <div className="job-details-grid">
                    {/* Main Content */}
                    <div className="job-main-content">
                        <div className="job-header-card">
                            <div className="job-status-row">
                                <span className={`status-badge ${job.status}`}>
                                    {job.status === 'open' ? 'Open for Applications' : job.status}
                                </span>
                                <span className="posted-date">
                                    <Calendar size={14} />
                                    Posted {formatDate(job.createdAt)}
                                </span>
                            </div>

                            <h1 className="job-title">{job.title}</h1>

                            <div className="job-client">
                                <div className="client-avatar">
                                    {job.clientName?.charAt(0)}
                                </div>
                                <div>
                                    <div className="client-name">{job.clientName}</div>
                                    <div className="client-company">{job.company}</div>
                                </div>
                            </div>

                            <div className="job-tags">
                                <span className="job-tag">
                                    <MapPin size={14} />
                                    {job.location}
                                </span>
                                <span className="job-tag">
                                    <Briefcase size={14} />
                                    {job.experience}
                                </span>
                                <span className="job-tag">
                                    <Clock size={14} />
                                    {job.duration}
                                </span>
                            </div>
                        </div>

                        <div className="job-section">
                            <h2>About the Project</h2>
                            <div className="job-description">
                                {job.description ? (
                                    typeof job.description === 'string' ? (
                                        job.description.split('\n').map((paragraph, index) => (
                                            <p key={index}>{paragraph}</p>
                                        ))
                                    ) : (
                                        <p>{job.description}</p>
                                    )
                                ) : (
                                    <p>No description available.</p>
                                )}
                            </div>
                        </div>

                        <div className="job-section">
                            <h2>Skills Required</h2>
                            <div className="skills-list">
                                {job.skills && Array.isArray(job.skills) && job.skills.length > 0 ? (
                                    job.skills.map((skill, index) => (
                                        <span key={index} className="skill-badge">{skill}</span>
                                    ))
                                ) : (
                                    <p>No specific skills listed</p>
                                )}
                            </div>
                        </div>

                        {/* Applicants Section (for job owner) */}
                        {isOwner && job.applicants && Array.isArray(job.applicants) && job.applicants.length > 0 && (
                            <div className="job-section">
                                <h2>Applicants ({job.applicants.length})</h2>
                                <div className="applicants-list">
                                    {job.applicants.map((applicantId) => {
                                        const applicant = getUserById(applicantId)
                                        if (!applicant) return null
                                        return (
                                            <Link
                                                to={`/freelancer/${applicant.id}`}
                                                key={applicantId}
                                                className="applicant-card"
                                            >
                                                <div className="applicant-avatar">
                                                    {applicant.name?.charAt(0)}
                                                </div>
                                                <div className="applicant-info">
                                                    <div className="applicant-name">{applicant.name}</div>
                                                    <div className="applicant-title">{applicant.title || 'Freelancer'}</div>
                                                </div>
                                                <span className="view-profile">View Profile</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="job-sidebar">
                        <div className="sidebar-card">
                            <div className="budget-display">
                                <span className="budget-label">Budget</span>
                                <span className="budget-amount">{formatBudget()}</span>
                                <span className="budget-type">
                                    {job.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                                </span>
                            </div>

                            <div className="sidebar-stats">
                                <div className="stat">
                                    <Users size={18} />
                                    <div>
                                        <span className="stat-value">{job.applicants?.length || job.applicantsCount || 0}</span>
                                        <span className="stat-label">Applicants</span>
                                    </div>
                                </div>
                                <div className="stat">
                                    <Clock size={18} />
                                    <div>
                                        <span className="stat-value">{job.duration}</span>
                                        <span className="stat-label">Duration</span>
                                    </div>
                                </div>
                            </div>

                            {canApply && !applied && (
                                <button
                                    className="btn btn-primary btn-lg apply-btn"
                                    onClick={handleApply}
                                    disabled={applying}
                                >
                                    {applying ? 'Submitting...' : 'Apply Now'}
                                </button>
                            )}

                            {(hasApplied || applied) && (
                                <div className="applied-status">
                                    <CheckCircle size={20} />
                                    <span>You've applied to this job</span>
                                </div>
                            )}

                            {isOwner && (
                                <div className="owner-status">
                                    <User size={20} />
                                    <span>This is your job posting</span>
                                </div>
                            )}

                            {!isAuthenticated && (
                                <div className="login-prompt">
                                    <p>Log in to apply for this job</p>
                                    <Link to="/login" className="btn btn-primary btn-lg">
                                        Log In to Apply
                                    </Link>
                                </div>
                            )}

                            {isAuthenticated && user?.role === 'client' && !isOwner && (
                                <div className="client-notice">
                                    <AlertCircle size={18} />
                                    <span>Only freelancers can apply to jobs</span>
                                </div>
                            )}
                        </div>

                        <div className="sidebar-card sidebar-category">
                            <span className="category-label">Category</span>
                            <span className="category-value">{job.category}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobDetails
