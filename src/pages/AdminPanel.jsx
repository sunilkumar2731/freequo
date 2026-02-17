import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI, adminAPI } from '../services/api'
import {
    Users, Briefcase, Shield, Eye, UserCheck, UserX, Trash2, Search, Filter,
    DollarSign, TrendingUp, Activity, AlertTriangle, CheckCircle, Clock,
    BarChart3, FileText, Bell, ArrowRight, Settings, Globe, Mail, Loader2,
    Calendar, ExternalLink, ShieldAlert
} from 'lucide-react'
import './AdminPanel.css'

function AdminPanel() {
    const { isAdminAuthenticated, adminLogout } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({
        stats: {
            totalUsers: 0,
            totalClients: 0,
            totalFreelancers: 0,
            totalJobs: 0,
            totalProposals: 0,
            totalPayments: 0,
            platformRevenue: 0,
            activeUsers: 0,
            suspendedUsers: 0
        },
        users: [],
        proposals: []
    })

    const [lastUpdated, setLastUpdated] = useState(new Date())
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [emailModal, setEmailModal] = useState({ open: false, user: null })
    const [emailData, setEmailData] = useState({ subject: '', message: '' })
    const [sendingEmail, setSendingEmail] = useState(false)

    const fetchAdminData = async (silent = false) => {
        if (!isAdminAuthenticated) return;

        try {
            if (!silent) setLoading(true)
            else setIsRefreshing(true)

            // Fetch both dashboard and platform stats
            const [dashResponse, statsResponse] = await Promise.all([
                dashboardAPI.getAdminDashboard(),
                adminAPI.getStats()
            ])

            const dashResult = dashResponse.data || dashResponse
            const statsResult = statsResponse.data || statsResponse

            setData({
                stats: {
                    ...(dashResult.stats || {}),
                    ...(statsResult.activityStats || {})
                },
                users: dashResult.users || [],
                proposals: dashResult.proposals || [],
                recentlyActive: statsResult.recentlyActive || []
            })
            setLastUpdated(new Date())
        } catch (error) {
            console.error('Error fetching admin data:', error)
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    const handleSendEmail = async (e) => {
        e.preventDefault()
        if (!emailModal.user || !emailData.subject || !emailData.message) return

        try {
            setSendingEmail(true)
            await adminAPI.sendEmail(emailModal.user._id, emailData)
            alert(`Email sent successfully to ${emailModal.user.name}`)
            setEmailModal({ open: false, user: null })
            setEmailData({ subject: '', message: '' })
        } catch (error) {
            console.error('Error sending email:', error)
            alert('Failed to send email. Please try again.')
        } finally {
            setSendingEmail(false)
        }
    }

    useEffect(() => {
        fetchAdminData()

        const interval = setInterval(() => {
            fetchAdminData(true)
        }, 30000)

        return () => clearInterval(interval)
    }, [isAdminAuthenticated])

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const filteredUsers = data.users.filter(u => {
        const matchesSearch = !searchQuery ||
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = !roleFilter || u.role === roleFilter
        return matchesSearch && matchesRole
    })

    const filteredProposals = data.proposals.filter(p => {
        const matchesSearch = !searchQuery ||
            p.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.freelancer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    })

    if (loading && activeTab === 'overview') {
        return (
            <div className="admin-loading-state">
                <Loader2 className="animate-spin" size={48} />
                <p>Loading real-time platform data...</p>
            </div>
        )
    }

    return (
        <div className="admin-page page">
            <div className="container">
                <div className="admin-header">
                    <div className="admin-title">
                        <div className="admin-badge">OWNER ONLY</div>
                        <Shield size={32} className="admin-icon" />
                        <div>
                            <h1>Platform Control Center</h1>
                            <p>Real-time database monitoring and system administration</p>
                        </div>
                    </div>
                    <div className="admin-actions">
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                {isRefreshing ? 'Syncing...' : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                            </span>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => fetchAdminData(true)}
                                    className="btn btn-secondary"
                                    disabled={isRefreshing}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                                >
                                    <Clock size={16} className={isRefreshing ? 'animate-spin' : ''} />
                                    Sync Live Data
                                </button>
                                <button onClick={adminLogout} className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                    Logout Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Platform Stats */}
                <div className="admin-stats">
                    <div className="admin-stat-card primary">
                        <div className="stat-icon-wrap"><Users size={24} /></div>
                        <div>
                            <span className="stat-value">{data.stats.totalUsers || 0}</span>
                            <span className="stat-label">Total Users</span>
                        </div>
                        <div className="stat-sub">{data.stats.activeUsers || 0} active users</div>
                    </div>
                    <div className="admin-stat-card success">
                        <div className="stat-icon-wrap"><Briefcase size={24} /></div>
                        <div>
                            <span className="stat-value">{data.stats.totalJobs || 0}</span>
                            <span className="stat-label">Jobs Posted</span>
                        </div>
                        <div className="stat-sub">{data.stats.totalProposals || 0} applications</div>
                    </div>
                    <div className="admin-stat-card info">
                        <div className="stat-icon-wrap"><DollarSign size={24} /></div>
                        <div>
                            <span className="stat-value">${(data.stats.platformRevenue || 0).toLocaleString()}</span>
                            <span className="stat-label">Net Revenue</span>
                        </div>
                        <div className="stat-sub">10% Platform Fee</div>
                    </div>
                    <div className="admin-stat-card warning">
                        <div className="stat-icon-wrap"><TrendingUp size={24} /></div>
                        <div>
                            <span className="stat-value">{data.stats.totalLogins || 0}</span>
                            <span className="stat-label">Platform Engagements</span>
                        </div>
                        <div className="stat-sub">Total user logins tracked</div>
                    </div>
                </div>

                {/* Quick Role Breakdown */}
                <div className="admin-quick-stats">
                    <div className="quick-stat">
                        <span className="quick-stat-value">{data.stats.totalFreelancers || 0}</span>
                        <span className="quick-stat-label">Freelancers</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-stat-value">{data.stats.totalClients || 0}</span>
                        <span className="quick-stat-label">Clients</span>
                    </div>
                    <div className="quick-stat alert">
                        <span className="quick-stat-value">{data.stats.suspendedUsers || 0}</span>
                        <span className="quick-stat-label">Suspended</span>
                    </div>
                    <div className="quick-stat info">
                        <span className="quick-stat-value">{data.stats.totalProposals || 0}</span>
                        <span className="quick-stat-label">Proposals</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <BarChart3 size={18} /> Overview
                    </button>
                    <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={18} /> User Tracking
                    </button>
                    <button className={`admin-tab ${activeTab === 'proposals' ? 'active' : ''}`} onClick={() => setActiveTab('proposals')}>
                        <FileText size={18} /> Application Monitoring
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="admin-overview-grid">
                        <div className="admin-section">
                            <div className="section-header"><h3><Activity size={18} /> System Activity</h3></div>
                            <div className="recent-activity-summary">
                                <div className="activity-stat-row">
                                    <span>Newly Joined (Last 24h)</span>
                                    <span className="count">{data.users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 86400000)).length}</span>
                                </div>
                                <div className="activity-stat-row">
                                    <span>New Applications</span>
                                    <span className="count">{data.proposals.filter(p => new Date(p.createdAt) > new Date(Date.now() - 86400000)).length}</span>
                                </div>
                            </div>
                        </div>
                        <div className="admin-section">
                            <div className="section-header"><h3><Clock size={18} /> Recently Active Users</h3></div>
                            <div className="active-users-list">
                                {(data.recentlyActive || []).map(u => (
                                    <div key={u._id} className="active-user-item">
                                        <div className="user-info">
                                            <strong>{u.name}</strong>
                                            <span>{u.email}</span>
                                        </div>
                                        <div className="login-time">
                                            {formatDate(u.lastLogin)} at {new Date(u.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                                {(!data.recentlyActive || data.recentlyActive.length === 0) && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No recent activity tracked yet.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="admin-content-area">
                        <div className="admin-toolbar">
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="filter-box">
                                <Filter size={18} />
                                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                    <option value="">All Roles</option>
                                    <option value="freelancer">Freelancers Only</option>
                                    <option value="client">Clients Only</option>
                                </select>
                            </div>
                        </div>

                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name / Email</th>
                                        <th>Role</th>
                                        <th>Signup Method</th>
                                        <th>Status</th>
                                        <th>Joined On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u._id || u.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <div className="user-name">{u.name}</div>
                                                        <div className="user-email">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`role-badge ${u.role}`}>
                                                    {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="signup-method">
                                                    {u.signupMethod === 'google' ? (
                                                        <><Globe size={14} className="google-icon" /> Google Auth</>
                                                    ) : (
                                                        <><Mail size={14} /> Email & Pass</>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${u.status || 'active'}`}>
                                                    {u.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="date-cell">{formatDate(u.createdAt)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <Link
                                                        to={u.role === 'freelancer' ? `/freelancer/${u._id}` : `/client/${u._id}`}
                                                        className="action-btn"
                                                        title="View Profile"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    <button
                                                        className="action-btn"
                                                        title="Send Email"
                                                        onClick={() => setEmailModal({ open: true, user: u })}
                                                    >
                                                        <Mail size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="empty-table">
                                    <Users size={48} />
                                    <p>No users found in database</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'proposals' && (
                    <div className="admin-content-area">
                        <div className="admin-toolbar">
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by job or applicant..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Job Title</th>
                                        <th>Applicant</th>
                                        <th>Budget / Duration</th>
                                        <th>Status</th>
                                        <th>Applied Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProposals.map((p) => (
                                        <tr key={p._id || p.id}>
                                            <td className="job-title-cell">
                                                <strong>{p.job?.title || 'Unknown Job'}</strong>
                                            </td>
                                            <td>
                                                <div className="applicant-info">
                                                    <span className="applicant-name">{p.freelancer?.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="proposal-details">
                                                    <div className="budget">${p.proposedBudget}</div>
                                                    <div className="duration">{p.proposedDuration}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${p.status}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="date-cell">{formatDate(p.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredProposals.length === 0 && (
                                <div className="empty-table">
                                    <FileText size={48} />
                                    <p>No job applications found in database</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Email Modal */}
            {emailModal.open && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h3>Send Message to {emailModal.user?.name}</h3>
                            <button className="close-btn" onClick={() => setEmailModal({ open: false, user: null })}>×</button>
                        </div>
                        <form onSubmit={handleSendEmail} className="email-form">
                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Account Verification Update"
                                    value={emailData.subject}
                                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    rows="6"
                                    placeholder="Write your official message here..."
                                    value={emailData.message}
                                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setEmailModal({ open: false, user: null })}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={sendingEmail}>
                                    {sendingEmail ? <><Loader2 className="animate-spin" size={16} /> Sending...</> : 'Send Email Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminPanel;
