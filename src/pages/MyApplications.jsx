import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { proposalsAPI } from '../services/api'
import {
    Briefcase, Clock, DollarSign, Calendar, FileText,
    Search, Filter, ChevronRight, AlertCircle, ArrowLeft,
    CheckCircle, XCircle, Loader2, User
} from 'lucide-react'
import './Dashboard.css'

function MyApplications() {
    const { user } = useAuth()
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                setLoading(true)
                const response = await proposalsAPI.getMyProposals({ status: filter, limit: 100 })
                // The API returns { success: true, data: { proposals, pagination } }
                const proposalsData = response.data?.proposals || response.proposals || []
                setProposals(proposalsData)
            } catch (error) {
                console.error('Error fetching applications:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProposals()
    }, [filter])

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return 'success';
            case 'rejected': return 'danger';
            case 'shortlisted': return 'warning';
            case 'withdrawn': return 'gray';
            default: return 'pending';
        }
    }

    const filteredProposals = proposals.filter(p =>
        p.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.job?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="dashboard-page page">
                <div className="container">
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={32} />
                        <p>Loading your applications...</p>
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
                        <Link to="/freelancer/dashboard" className="btn-icon-back">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1>My Applications</h1>
                            <p>Track and manage all your job proposals in one place.</p>
                        </div>
                    </div>
                    <Link to="/jobs" className="btn btn-primary">
                        Find More Jobs
                    </Link>
                </div>

                <div className="dashboard-section" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by job title or client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '40px', marginBottom: 0 }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['all', 'pending', 'shortlisted', 'accepted', 'rejected'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {filteredProposals.length === 0 ? (
                    <div className="dashboard-section" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ background: 'var(--primary-50)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary-600)' }}>
                            <FileText size={40} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No applications found</h2>
                        <p style={{ color: 'var(--gray-500)', maxWidth: '400px', margin: '0 auto 2rem' }}>
                            {searchTerm ? "We couldn't find any applications matching your search." : "You haven't applied for any jobs yet. Start applying to grow your freelance career! 🚀"}
                        </p>
                        {!searchTerm && (
                            <Link to="/jobs" className="btn btn-primary btn-lg">
                                Browse Available Jobs
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="applications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredProposals.map((proposal) => (
                            <div key={proposal._id} className="dashboard-section" style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                                                <Link to={`/jobs/${proposal.job?._id || proposal.job?.id}`} style={{ color: 'var(--gray-900)' }}>
                                                    {proposal.job?.title || 'Job Unavailable'}
                                                </Link>
                                            </h3>
                                            <span className={`status-pill ${getStatusColor(proposal.status)}`}>
                                                {proposal.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <Calendar size={14} />
                                                Applied on {formatDate(proposal.createdAt)}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <User size={14} />
                                                Client: {proposal.job?.client?.name || proposal.job?.company || 'The Client'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <Briefcase size={14} />
                                                Category: {proposal.job?.category}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
                                        <div>
                                            <div style={{ color: 'var(--gray-400)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Budget</div>
                                            <div style={{ color: 'var(--primary-600)', fontWeight: 700, fontSize: '1.125rem' }}>${proposal.proposedBudget || proposal.job?.budget}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--gray-400)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Duration</div>
                                            <div style={{ color: 'var(--gray-900)', fontWeight: 600 }}>{proposal.proposedDuration || proposal.job?.duration}</div>
                                        </div>
                                        <Link to={`/jobs/${proposal.job?._id || proposal.job?.id}`} className="btn-icon">
                                            <ChevronRight size={20} />
                                        </Link>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--gray-700)', fontWeight: 600, fontSize: '0.875rem' }}>
                                        <FileText size={16} /> Cover Letter Preview
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {proposal.coverLetter}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyApplications
