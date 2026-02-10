import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import {
    Briefcase,
    Users,
    DollarSign,
    TrendingUp,
    Plus,
    Eye,
    Clock,
    CheckCircle,
    Bell,
    FileText,
    Star,
    MessageSquare,
    ArrowRight,
    Zap,
    Award,
    Target
} from 'lucide-react'
import './Dashboard.css'

// Sample recommended freelancers data
const recommendedFreelancers = [
    {
        id: 'fl-1',
        name: 'Alex Johnson',
        title: 'Senior Full-Stack Developer',
        avatar: 'A',
        skills: ['React', 'Node.js', 'TypeScript'],
        rating: 4.9,
        completedJobs: 47,
        hourlyRate: 75
    },
    {
        id: 'fl-2',
        name: 'Sarah Miller',
        title: 'UI/UX Designer',
        avatar: 'S',
        skills: ['Figma', 'Adobe XD', 'Prototyping'],
        rating: 5.0,
        completedJobs: 32,
        hourlyRate: 65
    },
    {
        id: 'fl-3',
        name: 'James Wilson',
        title: 'Mobile App Developer',
        avatar: 'J',
        skills: ['React Native', 'Flutter', 'iOS'],
        rating: 4.8,
        completedJobs: 28,
        hourlyRate: 70
    }
]

// Sample notifications
const notifications = [
    { id: 1, type: 'proposal', message: 'New proposal received for "E-commerce Website"', time: '5 min ago', unread: true },
    { id: 2, type: 'shortlist', message: 'Your job was shortlisted by 3 freelancers', time: '1 hour ago', unread: true },
    { id: 3, type: 'payment', message: 'Payment of $2,500 released successfully', time: '2 hours ago', unread: false },
    { id: 4, type: 'message', message: 'New message from Alex Johnson', time: '3 hours ago', unread: false }
]

// Sample recent payments
const recentPayments = [
    { id: 1, jobTitle: 'Logo Design Project', amount: 500, status: 'paid', date: '2024-01-10' },
    { id: 2, jobTitle: 'Mobile App Development', amount: 3500, status: 'pending', date: '2024-01-09' },
    { id: 3, jobTitle: 'Website Redesign', amount: 1200, status: 'paid', date: '2024-01-05' }
]

function ClientDashboard() {
    const { user } = useAuth()
    const dataContext = useData()

    // Safety check for data context
    if (!dataContext) {
        return (
            <div className="dashboard-page page">
                <div className="container">
                    <div className="loading-state">
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        )
    }

    const { getJobsByClient, jobs, loading } = dataContext

    // Safety check: ensure getJobsByClient exists and returns an array
    const myJobs = getJobsByClient ? getJobsByClient(user?.id) || [] : []

    const totalApplicants = myJobs.reduce((sum, job) => {
        const applicants = Array.isArray(job.applicants) ? job.applicants : []
        return sum + applicants.length
    }, 0)

    const openJobs = myJobs.filter(job => job.status === 'open').length
    const completedJobs = myJobs.filter(job => job.status === 'completed').length
    const totalSpent = myJobs.reduce((sum, job) => {
        return job.status === 'completed' ? sum + (job.budget || 0) : sum
    }, 0)

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatBudget = (job) => {
        if (job.budgetType === 'hourly') {
            return `$${job.budget}/hr`
        }
        return `$${job.budget.toLocaleString()}`
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'proposal': return <FileText size={16} />
            case 'shortlist': return <Target size={16} />
            case 'payment': return <DollarSign size={16} />
            case 'message': return <MessageSquare size={16} />
            default: return <Bell size={16} />
        }
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
                {/* Header */}
                <div className="dashboard-header">
                    <div className="header-welcome">
                        <span className="wave-emoji">👋</span>
                        <div>
                            <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                            <p>Here's what's happening with your projects today.</p>
                        </div>
                    </div>
                    <Link to="/client/post-job" className="btn btn-primary btn-lg">
                        <Plus size={20} />
                        Post a Job
                    </Link>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <Briefcase size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{openJobs}</span>
                            <span className="stat-label">Active Jobs</span>
                        </div>
                        <div className="stat-trend up">
                            <TrendingUp size={14} />
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple">
                            <Users size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{totalApplicants}</span>
                            <span className="stat-label">Proposals Received</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{completedJobs}</span>
                            <span className="stat-label">Jobs Completed</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange">
                            <DollarSign size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">${totalSpent.toLocaleString()}</span>
                            <span className="stat-label">Total Spent</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-main-grid">
                    {/* Left Column */}
                    <div className="dashboard-left">
                        {/* Active Jobs Section */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2><Briefcase size={20} /> Active Jobs</h2>
                                {myJobs.length > 0 && (
                                    <Link to="/client/post-job" className="btn btn-secondary btn-sm">
                                        <Plus size={16} />
                                        New Job
                                    </Link>
                                )}
                            </div>

                            {myJobs.length > 0 ? (
                                <div className="active-jobs-grid">
                                    {myJobs.slice(0, 4).map((job) => (
                                        <div key={job.id} className="job-card-dashboard">
                                            <div className="job-card-header">
                                                <span className={`status-pill ${job.status}`}>
                                                    {job.status === 'open' ? 'Open' : job.status === 'in-progress' ? 'In Progress' : 'Completed'}
                                                </span>
                                                <span className="job-budget">{formatBudget(job)}</span>
                                            </div>
                                            <h4 className="job-card-title">
                                                <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                                            </h4>
                                            <p className="job-category">{job.category}</p>
                                            <div className="job-card-footer">
                                                <span className="proposals-count">
                                                    <Users size={14} />
                                                    {job.applicants?.length || 0} proposals
                                                </span>
                                                <Link to={`/jobs/${job.id}`} className="view-link">
                                                    View <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <Briefcase size={48} />
                                    </div>
                                    <h3>No jobs posted yet</h3>
                                    <p>Post your first job and start receiving applications from talented freelancers.</p>
                                    <Link to="/client/post-job" className="btn btn-primary">
                                        <Plus size={18} />
                                        Post Your First Job
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Proposals Received */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2><FileText size={20} /> Recent Proposals</h2>
                                <Link to="/client/proposals" className="see-all-link">
                                    See all <ArrowRight size={14} />
                                </Link>
                            </div>

                            {totalApplicants > 0 ? (
                                <div className="proposals-list">
                                    {recommendedFreelancers.slice(0, 3).map((freelancer, index) => (
                                        <div key={index} className="proposal-card">
                                            <div className="proposal-freelancer">
                                                <div className="freelancer-avatar">{freelancer.avatar}</div>
                                                <div className="freelancer-info">
                                                    <h4>{freelancer.name}</h4>
                                                    <p>{freelancer.title}</p>
                                                </div>
                                            </div>
                                            <div className="proposal-details">
                                                <div className="skill-match">
                                                    <Zap size={14} />
                                                    <span>95% Match</span>
                                                </div>
                                                <div className="freelancer-rating">
                                                    <Star size={14} fill="currentColor" />
                                                    <span>{freelancer.rating}</span>
                                                </div>
                                                <span className="bid-amount">${freelancer.hourlyRate}/hr</span>
                                            </div>
                                            <Link to={`/freelancer/${freelancer.id}`} className="btn btn-outline btn-sm">
                                                View Profile
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state compact">
                                    <FileText size={32} />
                                    <p>No proposals yet. Post a job to start receiving proposals.</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Payments */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2><DollarSign size={20} /> Recent Payments</h2>
                            </div>
                            <div className="payments-list">
                                {recentPayments.map((payment) => (
                                    <div key={payment.id} className="payment-item">
                                        <div className="payment-info">
                                            <h4>{payment.jobTitle}</h4>
                                            <span className="payment-date">{formatDate(payment.date)}</span>
                                        </div>
                                        <div className="payment-right">
                                            <span className="payment-amount">${payment.amount.toLocaleString()}</span>
                                            <span className={`status-pill ${payment.status}`}>{payment.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="dashboard-right">
                        {/* Quick Actions */}
                        <div className="dashboard-section quick-actions-card">
                            <h3>Quick Actions</h3>
                            <div className="quick-actions-grid">
                                <Link to="/client/post-job" className="quick-action">
                                    <Plus size={20} />
                                    <span>Post Job</span>
                                </Link>
                                <Link to={`/client/${user?._id || user?.id}`} className="quick-action">
                                    <Users size={20} />
                                    <span>My Profile</span>
                                </Link>
                                <Link to="/messages" className="quick-action">
                                    <MessageSquare size={20} />
                                    <span>Messages</span>
                                </Link>
                                <Link to="/client/settings" className="quick-action">
                                    <Award size={20} />
                                    <span>Settings</span>
                                </Link>
                            </div>
                        </div>

                        {/* Notifications Panel */}
                        <div className="dashboard-section notifications-panel">
                            <div className="section-header">
                                <h3><Bell size={18} /> Notifications</h3>
                                <span className="notification-badge">{notifications.filter(n => n.unread).length}</span>
                            </div>
                            <div className="notifications-list">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                                        <div className="notification-icon">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <p>{notification.message}</p>
                                            <span className="notification-time">{notification.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommended Freelancers */}
                        <div className="dashboard-section recommended-section">
                            <div className="section-header">
                                <h3><Star size={18} /> Top Freelancers</h3>
                            </div>
                            <div className="recommended-list">
                                {recommendedFreelancers.map((freelancer) => (
                                    <div key={freelancer.id} className="recommended-card">
                                        <div className="recommended-header">
                                            <div className="freelancer-avatar-sm">{freelancer.avatar}</div>
                                            <div>
                                                <h4>{freelancer.name}</h4>
                                                <div className="freelancer-rating-sm">
                                                    <Star size={12} fill="currentColor" />
                                                    <span>{freelancer.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="recommended-skills">
                                            {freelancer.skills.slice(0, 2).map((skill, i) => (
                                                <span key={i} className="skill-tag-sm">{skill}</span>
                                            ))}
                                        </div>
                                        <Link to={`/freelancer/${freelancer.id}`} className="btn btn-primary btn-sm btn-full">
                                            Hire
                                        </Link>
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

export default ClientDashboard
