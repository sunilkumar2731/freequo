import { useState, useEffect } from 'react'
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
    User,
    X
} from 'lucide-react'
import './JobDetails.css'

function JobDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dataContext = useData()
    const { user, isAuthenticated, getUserById } = useAuth()

    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [error, setError] = useState(null)
    const [proposalData, setProposalData] = useState({
        coverLetter: '',
        proposedBudget: '',
        proposedDuration: '',
        relevantExperience: ''
    })

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
    const job = getJobById ? getJobById(id) : null

    // Initialize proposal data when job is loaded
    useEffect(() => {
        if (job) {
            setProposalData({
                coverLetter: '',
                proposedBudget: job.budget || '',
                proposedDuration: job.duration || '',
                relevantExperience: ''
            })
        }
    }, [job])

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

    const hasApplied = user && Array.isArray(job.applicants) &&
        (job.applicants.includes(user.id) || job.applicants.some(a => a === user.id || a._id === user.id))
    const isOwner = user && (job.clientId === user.id || job.client === user.id || job.client?._id === user.id)
    const canApply = isAuthenticated && user?.role === 'freelancer' && !hasApplied && !isOwner && !applied

    const handleApplyClick = () => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        setShowModal(true)
    }

    const handleApplySubmit = async (e) => {
        if (e) e.preventDefault()

        setError(null)
        setApplying(true)

        const result = await applyToJob(job._id || job.id, user.id, proposalData)

        setApplying(false)
        if (result.success) {
            setApplied(true)
            setShowModal(false)
        } else {
            setError(result.error || 'Failed to submit application')
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setProposalData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Just now'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatBudget = () => {
        if (!job.budget) return 'Contact for budget'
        if (job.budgetType === 'hourly') {
            return `$${job.budget}/hour`
        }
        return `$${job.budget.toLocaleString()}`
    }

    return (
        <div className="job-details-page page">
            <div className="container">
                <Link to="/jobs" className="back-link">
                    <ArrowLeft size={18} />
                    Back to Jobs
                </Link>

                <div className="job-details-grid">
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
                                    {job.clientName?.charAt(0) || job.client?.name?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <div className="client-name">{job.clientName || job.client?.name}</div>
                                    <div className="client-company">{job.company || job.client?.company}</div>
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

                        {isOwner && job.applicants && Array.isArray(job.applicants) && job.applicants.length > 0 && (
                            <div className="job-section">
                                <h2>Applicants ({job.applicants.length})</h2>
                                <div className="applicants-list">
                                    {job.applicants.map((applicant) => {
                                        const applicantId = typeof applicant === 'string' ? applicant : applicant._id || applicant.id
                                        const applicantData = typeof applicant === 'object' ? applicant : getUserById(applicantId)
                                        if (!applicantData) return null
                                        return (
                                            <Link
                                                to={`/freelancer/${applicantId}`}
                                                key={applicantId}
                                                className="applicant-card"
                                            >
                                                <div className="applicant-avatar">
                                                    {applicantData.name?.charAt(0)}
                                                </div>
                                                <div className="applicant-info">
                                                    <div className="applicant-name">{applicantData.name}</div>
                                                    <div className="applicant-title">{applicantData.title || 'Freelancer'}</div>
                                                </div>
                                                <span className="view-profile">View Profile</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

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

                            {canApply && (
                                <button
                                    className="btn btn-primary btn-lg apply-btn"
                                    onClick={handleApplyClick}
                                    disabled={applying}
                                >
                                    Apply Now
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

            {/* Apply Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>Submit Proposal</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    color: 'var(--gray-400)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--text-tertiary)';
                                    e.currentTarget.style.background = 'none';
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleApplySubmit} style={{ padding: '1.5rem' }}>
                            {error && (
                                <div className="alert alert-danger" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)' }}>
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Cover Letter</label>
                                <textarea
                                    className="form-textarea"
                                    name="coverLetter"
                                    placeholder="Explain why you're a good fit for this project..."
                                    value={proposalData.coverLetter}
                                    onChange={handleInputChange}
                                    required
                                    rows={6}
                                />
                            </div>

                            <div className="grid-2 grid" style={{ marginBottom: '1.25rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Proposed Budget ($)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        name="proposedBudget"
                                        value={proposalData.proposedBudget}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Proposed Duration</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="proposedDuration"
                                        placeholder="e.g. 2 weeks"
                                        value={proposalData.proposedDuration}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Relevant Experience (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    name="relevantExperience"
                                    placeholder="Mention similar projects you've worked on..."
                                    value={proposalData.relevantExperience}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={applying}
                                    style={{ flex: 1 }}
                                >
                                    {applying ? 'Submitting...' : 'Submit Proposal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default JobDetails
