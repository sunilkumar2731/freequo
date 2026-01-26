import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import {
    Briefcase, Star, DollarSign, Send, User, Eye, Clock, MapPin,
    CheckCircle, TrendingUp, Bell, FileText, MessageSquare, ArrowRight,
    Target, Zap, Calendar, BarChart3
} from 'lucide-react'
import './Dashboard.css'

const recommendedJobs = [
    { id: 'job-r1', title: 'React Native Mobile App', budget: 5000, budgetType: 'fixed', skills: ['React Native', 'JavaScript'], difficulty: 'Expert', clientName: 'TechStart Inc.' },
    { id: 'job-r2', title: 'E-commerce Website Redesign', budget: 3500, budgetType: 'fixed', skills: ['React', 'UI/UX'], difficulty: 'Intermediate', clientName: 'Fashion Hub' },
    { id: 'job-r3', title: 'Backend API Development', budget: 75, budgetType: 'hourly', skills: ['Node.js', 'MongoDB'], difficulty: 'Expert', clientName: 'DataFlow Ltd.' }
]

const activeProjects = [
    { id: 'proj-1', title: 'Dashboard UI Development', clientName: 'FinTech Solutions', deadline: '2024-01-25', progress: 75 },
    { id: 'proj-2', title: 'Mobile App Bug Fixes', clientName: 'AppMasters', deadline: '2024-01-20', progress: 40 }
]

const notifications = [
    { id: 1, type: 'proposal', message: 'Your proposal was accepted!', time: '10 min ago', unread: true },
    { id: 2, type: 'shortlist', message: 'You were shortlisted for "React Developer"', time: '1 hour ago', unread: true },
    { id: 3, type: 'payment', message: 'Payment of $1,500 received', time: '3 hours ago', unread: false }
]

function FreelancerDashboard() {
    const { user } = useAuth()
    const { getAppliedJobs, getOpenJobs, loading } = useData()

    // Safety checks
    const appliedJobs = getAppliedJobs ? getAppliedJobs(user?.id) || [] : []

    const profileFields = [user?.name, user?.email, user?.title, user?.bio, user?.skills?.length > 0, user?.location, user?.hourlyRate]
    const completedFields = profileFields.filter(Boolean).length
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100)
    const profileComplete = profileCompletion >= 80

    const totalEarnings = user?.totalEarnings || 12500
    const thisMonthEarnings = user?.monthEarnings || 3200
    const pendingPayout = user?.pendingPayout || 850
    const appliedCount = appliedJobs.length

    const formatBudget = (job) => job.budgetType === 'hourly' ? `$${job.budget}/hr` : `$${job.budget.toLocaleString()}`
    const getDaysUntil = (dateString) => Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24))
    const getNotificationIcon = (type) => {
        const icons = { proposal: <FileText size={16} />, shortlist: <Target size={16} />, payment: <DollarSign size={16} />, message: <MessageSquare size={16} /> }
        return icons[type] || <Bell size={16} />
    }

    // Show loading state
    if (loading) {
        return (
            <div className="dashboard-page page">
                <div className="container">
                    <div className="loading-state">
                        <p>Loading dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard-page page">
            <div className="container">
                <div className="dashboard-header">
                    <div className="header-welcome">
                        <span className="wave-emoji">👋</span>
                        <div>
                            <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                            <p>Here's what's happening with your freelance work today.</p>
                        </div>
                    </div>
                    <Link to="/jobs" className="btn btn-primary btn-lg"><Briefcase size={20} /> Find Jobs</Link>
                </div>

                {!profileComplete && (
                    <div className="profile-completion-banner">
                        <div className="completion-content">
                            <div className="completion-icon"><User size={24} /></div>
                            <div className="completion-text">
                                <h4>Complete your profile</h4>
                                <p>A complete profile helps you stand out to potential clients.</p>
                            </div>
                            <div className="completion-progress">
                                <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${profileCompletion}%` }}></div></div>
                                <span className="progress-text">{profileCompletion}% complete</span>
                            </div>
                        </div>
                        <Link to="/freelancer/edit-profile" className="btn btn-primary">Complete Profile</Link>
                    </div>
                )}

                <div className="stats-grid">
                    <div className="stat-card"><div className="stat-icon blue"><Briefcase size={24} /></div><div className="stat-content"><span className="stat-value">{activeProjects.length}</span><span className="stat-label">Active Projects</span></div></div>
                    <div className="stat-card"><div className="stat-icon purple"><Send size={24} /></div><div className="stat-content"><span className="stat-value">{appliedCount}</span><span className="stat-label">Proposals Sent</span></div></div>
                    <div className="stat-card"><div className="stat-icon green"><DollarSign size={24} /></div><div className="stat-content"><span className="stat-value">${totalEarnings.toLocaleString()}</span><span className="stat-label">Total Earnings</span></div></div>
                    <div className="stat-card"><div className="stat-icon orange"><Eye size={24} /></div><div className="stat-content"><span className="stat-value">{user?.profileViews || 156}</span><span className="stat-label">Profile Views</span></div></div>
                </div>

                <div className="dashboard-main-grid">
                    <div className="dashboard-left">
                        <div className="dashboard-section">
                            <div className="section-header"><h2><Zap size={20} /> Recommended Jobs</h2><Link to="/jobs" className="see-all-link">See all <ArrowRight size={14} /></Link></div>
                            <div className="recommended-jobs-grid">
                                {recommendedJobs.map((job) => (
                                    <div key={job.id} className="job-feed-card">
                                        <div className="job-feed-header"><span className={`difficulty-badge ${job.difficulty.toLowerCase()}`}>{job.difficulty}</span><span className="job-budget-tag">{formatBudget(job)}</span></div>
                                        <h4 className="job-feed-title">{job.title}</h4>
                                        <p className="job-feed-client">{job.clientName}</p>
                                        <div className="job-feed-skills">{job.skills.map((skill, i) => <span key={i} className="skill-tag">{skill}</span>)}</div>
                                        <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm btn-full">Apply Now</Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="dashboard-section">
                            <div className="section-header"><h2><Target size={20} /> Active Projects</h2></div>
                            <div className="active-projects-list">
                                {activeProjects.map((project) => (
                                    <div key={project.id} className="project-card">
                                        <div className="project-info"><h4>{project.title}</h4><p className="project-client">{project.clientName}</p></div>
                                        <div className="project-progress"><div className="progress-header"><span className="progress-label">Progress</span><span className="progress-value">{project.progress}%</span></div><div className="progress-bar-container"><div className="progress-bar" style={{ width: `${project.progress}%` }}></div></div></div>
                                        <div className="project-deadline"><Calendar size={14} /><span>{getDaysUntil(project.deadline)} days left</span></div>
                                        <button className="btn btn-secondary btn-sm">Submit Work</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-right">
                        <div className="profile-summary-card">
                            <div className="profile-header"><div className="profile-avatar">{user?.name?.charAt(0)}</div><div><h3>{user?.name}</h3><p>{user?.title || 'Freelancer'}</p></div></div>
                            {user?.skills?.length > 0 && <div className="profile-skills">{user.skills.slice(0, 5).map((skill, i) => <span key={i} className="skill-badge">{skill}</span>)}</div>}
                            <div className="profile-stats">
                                {user?.location && <div className="profile-stat"><MapPin size={16} /><span>{user.location}</span></div>}
                                <div className="profile-stat"><Star size={16} /><span>{user?.rating || 4.8} Rating</span></div>
                            </div>
                            <Link to="/freelancer/edit-profile" className="btn btn-secondary profile-edit-btn">Edit Profile</Link>
                        </div>

                        <div className="dashboard-section earnings-card">
                            <div className="section-header"><h3><DollarSign size={18} /> Earnings</h3></div>
                            <div className="earnings-stats">
                                <div className="earning-item"><span className="earning-label">Total</span><span className="earning-value total">${totalEarnings.toLocaleString()}</span></div>
                                <div className="earning-item"><span className="earning-label">This Month</span><span className="earning-value month">${thisMonthEarnings.toLocaleString()}</span></div>
                                <div className="earning-item"><span className="earning-label">Pending</span><span className="earning-value pending">${pendingPayout.toLocaleString()}</span></div>
                            </div>
                        </div>

                        <div className="dashboard-section notifications-panel">
                            <div className="section-header"><h3><Bell size={18} /> Notifications</h3><span className="notification-badge">{notifications.filter(n => n.unread).length}</span></div>
                            <div className="notifications-list">
                                {notifications.map((n) => (
                                    <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                                        <div className="notification-icon">{getNotificationIcon(n.type)}</div>
                                        <div className="notification-content"><p>{n.message}</p><span className="notification-time">{n.time}</span></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FreelancerDashboard
