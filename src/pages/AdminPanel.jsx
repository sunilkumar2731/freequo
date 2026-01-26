import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import {
    Users, Briefcase, Shield, Eye, UserCheck, UserX, Trash2, Search, Filter,
    DollarSign, TrendingUp, Activity, AlertTriangle, CheckCircle, Clock,
    BarChart3, FileText, Bell, ArrowRight, Settings
} from 'lucide-react'
import './AdminPanel.css'

const platformStats = {
    revenue: 125000,
    monthlyGrowth: 12.5,
    pendingVerifications: 8,
    reportedJobs: 3
}

const recentTransactions = [
    { id: 1, type: 'Platform Fee', amount: 250, date: '2024-01-14', status: 'completed' },
    { id: 2, type: 'Freelancer Payout', amount: 2500, date: '2024-01-13', status: 'completed' },
    { id: 3, type: 'Subscription', amount: 99, date: '2024-01-12', status: 'pending' }
]

const notifications = [
    { id: 1, message: 'New freelancer verification request', time: '5 min ago', type: 'verification' },
    { id: 2, message: 'Job reported for review', time: '1 hour ago', type: 'report' },
    { id: 3, message: 'Payment dispute opened', time: '2 hours ago', type: 'dispute' }
]

function AdminPanel() {
    const { user, getAllUsers, updateUserStatus, removeUser } = useAuth()
    const { jobs, deleteJob } = useData()

    const [activeTab, setActiveTab] = useState('overview')
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('')

    const allUsers = getAllUsers()
    const filteredUsers = allUsers.filter(u => {
        const matchesSearch = !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = !roleFilter || u.role === roleFilter
        return matchesSearch && matchesRole
    })
    const filteredJobs = jobs.filter(job => !searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase()))

    const freelancerCount = allUsers.filter(u => u.role === 'freelancer').length
    const clientCount = allUsers.filter(u => u.role === 'client').length
    const openJobsCount = jobs.filter(j => j.status === 'open').length
    const activeFreelancers = allUsers.filter(u => u.role === 'freelancer' && u.status !== 'suspended').length

    const handleStatusToggle = (userId, currentStatus) => updateUserStatus(userId, currentStatus === 'active' ? 'suspended' : 'active')
    const handleRemoveUser = (userId) => { if (window.confirm('Remove this user permanently?')) removeUser(userId) }
    const handleDeleteJob = (jobId) => { if (window.confirm('Delete this job?')) deleteJob(jobId) }
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return (
        <div className="admin-page page">
            <div className="container">
                <div className="admin-header">
                    <div className="admin-title">
                        <Shield size={28} className="admin-icon" />
                        <div>
                            <h1>Admin Dashboard</h1>
                            <p>Manage platform, users, and content</p>
                        </div>
                    </div>
                    <div className="admin-actions">
                        <Link to="/admin/settings" className="btn btn-secondary"><Settings size={18} /> Settings</Link>
                    </div>
                </div>

                {/* Platform Stats */}
                <div className="admin-stats">
                    <div className="admin-stat-card primary">
                        <div className="stat-icon-wrap"><Users size={24} /></div>
                        <div><span className="stat-value">{allUsers.length}</span><span className="stat-label">Total Users</span></div>
                        <div className="stat-trend up"><TrendingUp size={14} /> +8%</div>
                    </div>
                    <div className="admin-stat-card success">
                        <div className="stat-icon-wrap"><Briefcase size={24} /></div>
                        <div><span className="stat-value">{jobs.length}</span><span className="stat-label">Total Jobs</span></div>
                    </div>
                    <div className="admin-stat-card info">
                        <div className="stat-icon-wrap"><Activity size={24} /></div>
                        <div><span className="stat-value">{activeFreelancers}</span><span className="stat-label">Active Freelancers</span></div>
                    </div>
                    <div className="admin-stat-card warning">
                        <div className="stat-icon-wrap"><DollarSign size={24} /></div>
                        <div><span className="stat-value">${platformStats.revenue.toLocaleString()}</span><span className="stat-label">Platform Revenue</span></div>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="admin-quick-stats">
                    <div className="quick-stat"><span className="quick-stat-value">{freelancerCount}</span><span className="quick-stat-label">Freelancers</span></div>
                    <div className="quick-stat"><span className="quick-stat-value">{clientCount}</span><span className="quick-stat-label">Clients</span></div>
                    <div className="quick-stat"><span className="quick-stat-value">{openJobsCount}</span><span className="quick-stat-label">Open Jobs</span></div>
                    <div className="quick-stat alert"><span className="quick-stat-value">{platformStats.pendingVerifications}</span><span className="quick-stat-label">Pending Verifications</span></div>
                    <div className="quick-stat alert"><span className="quick-stat-value">{platformStats.reportedJobs}</span><span className="quick-stat-label">Reported Jobs</span></div>
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><BarChart3 size={18} /> Overview</button>
                    <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><Users size={18} /> Users</button>
                    <button className={`admin-tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}><Briefcase size={18} /> Jobs</button>
                    <button className={`admin-tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}><DollarSign size={18} /> Payments</button>
                </div>

                {activeTab === 'overview' && (
                    <div className="admin-overview-grid">
                        <div className="admin-section">
                            <div className="section-header"><h3><AlertTriangle size={18} /> Pending Actions</h3></div>
                            <div className="pending-actions">
                                <div className="action-item"><div className="action-icon verify"><UserCheck size={20} /></div><div className="action-info"><h4>Verify Freelancers</h4><p>{platformStats.pendingVerifications} pending verifications</p></div><button className="btn btn-primary btn-sm">Review</button></div>
                                <div className="action-item"><div className="action-icon report"><AlertTriangle size={20} /></div><div className="action-info"><h4>Review Reported Jobs</h4><p>{platformStats.reportedJobs} jobs flagged</p></div><button className="btn btn-secondary btn-sm">Review</button></div>
                            </div>
                        </div>
                        <div className="admin-section">
                            <div className="section-header"><h3><Bell size={18} /> Recent Activity</h3></div>
                            <div className="activity-list">
                                {notifications.map(n => (
                                    <div key={n.id} className="activity-item">
                                        <div className={`activity-dot ${n.type}`}></div>
                                        <div className="activity-content"><p>{n.message}</p><span>{n.time}</span></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="admin-section full-width">
                            <div className="section-header"><h3><DollarSign size={18} /> Recent Transactions</h3><Link to="#" className="see-all-link">View All <ArrowRight size={14} /></Link></div>
                            <div className="transactions-list">
                                {recentTransactions.map(t => (
                                    <div key={t.id} className="transaction-item">
                                        <div className="transaction-type">{t.type}</div>
                                        <div className="transaction-date">{formatDate(t.date)}</div>
                                        <div className={`transaction-amount ${t.amount > 0 ? 'positive' : ''}`}>${t.amount}</div>
                                        <span className={`status-badge ${t.status}`}>{t.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'users' || activeTab === 'jobs') && (
                    <div className="admin-toolbar">
                        <div className="search-box"><Search size={18} /><input type="text" placeholder={`Search ${activeTab}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                        {activeTab === 'users' && (
                            <div className="filter-box"><Filter size={18} /><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}><option value="">All Roles</option><option value="freelancer">Freelancers</option><option value="client">Clients</option></select></div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id}>
                                        <td><div className="user-cell"><div className="user-avatar">{u.name?.charAt(0)}</div><div><div className="user-name">{u.name}</div><div className="user-email">{u.email}</div></div></div></td>
                                        <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                        <td><span className={`status-badge ${u.status || 'active'}`}>{u.status || 'active'}</span></td>
                                        <td className="date-cell">{formatDate(u.createdAt)}</td>
                                        <td><div className="action-buttons">
                                            {u.role === 'freelancer' && <Link to={`/freelancer/${u.id}`} className="action-btn view" title="View"><Eye size={16} /></Link>}
                                            <button className={`action-btn ${u.status === 'suspended' ? 'activate' : 'suspend'}`} onClick={() => handleStatusToggle(u.id, u.status || 'active')} title={u.status === 'suspended' ? 'Activate' : 'Suspend'}>{u.status === 'suspended' ? <UserCheck size={16} /> : <UserX size={16} />}</button>
                                            <button className="action-btn delete" onClick={() => handleRemoveUser(u.id)} title="Remove"><Trash2 size={16} /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && <div className="empty-table"><Users size={36} /><p>No users found</p></div>}
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead><tr><th>Job Title</th><th>Client</th><th>Category</th><th>Status</th><th>Posted</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filteredJobs.map((job) => (
                                    <tr key={job.id}>
                                        <td><Link to={`/jobs/${job.id}`} className="job-link">{job.title}</Link></td>
                                        <td>{job.clientName}</td>
                                        <td><span className="category-badge">{job.category}</span></td>
                                        <td><span className={`status-badge ${job.status}`}>{job.status}</span></td>
                                        <td className="date-cell">{formatDate(job.createdAt)}</td>
                                        <td><div className="action-buttons">
                                            <Link to={`/jobs/${job.id}`} className="action-btn view" title="View"><Eye size={16} /></Link>
                                            <button className="action-btn delete" onClick={() => handleDeleteJob(job.id)} title="Delete"><Trash2 size={16} /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredJobs.length === 0 && <div className="empty-table"><Briefcase size={36} /><p>No jobs found</p></div>}
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="admin-payments-grid">
                        <div className="payment-stat-card"><h4>Total Revenue</h4><span className="payment-value">${platformStats.revenue.toLocaleString()}</span><span className="payment-trend up"><TrendingUp size={14} /> +{platformStats.monthlyGrowth}% this month</span></div>
                        <div className="payment-stat-card"><h4>Platform Fees</h4><span className="payment-value">$18,750</span></div>
                        <div className="payment-stat-card"><h4>Freelancer Payouts</h4><span className="payment-value">$106,250</span></div>
                        <div className="admin-section full-width">
                            <div className="section-header"><h3>Transaction History</h3></div>
                            <div className="transactions-list">
                                {recentTransactions.map(t => (
                                    <div key={t.id} className="transaction-item">
                                        <div className="transaction-type">{t.type}</div>
                                        <div className="transaction-date">{formatDate(t.date)}</div>
                                        <div className="transaction-amount">${t.amount}</div>
                                        <span className={`status-badge ${t.status}`}>{t.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminPanel
