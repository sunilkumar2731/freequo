import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import {
    Search,
    Filter,
    MapPin,
    Clock,
    DollarSign,
    Briefcase,
    ChevronDown,
    X
} from 'lucide-react'
import './Jobs.css'

function Jobs() {
    const { jobs = [], categories = [] } = useData() || {}
    const [searchParams, setSearchParams] = useSearchParams()

    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
    const [selectedExperience, setSelectedExperience] = useState('')
    const [selectedBudgetType, setSelectedBudgetType] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Debug log
    console.log('Jobs Component Render:', { jobsLength: jobs?.length, categoriesLength: categories?.length })

    const openJobs = useMemo(() => {
        if (!Array.isArray(jobs)) return []
        return jobs.filter(job => job && job.status === 'open')
    }, [jobs])

    const filteredJobs = useMemo(() => {
        if (!Array.isArray(openJobs)) return []

        return openJobs.filter(job => {
            if (!job) return false

            // Safe access to properties with defaults
            const title = job.title || ''
            const description = job.description || ''
            const skills = Array.isArray(job.skills) ? job.skills : []
            const jobCategory = job.category || ''
            const jobExperience = job.experience || ''
            const jobBudgetType = job.budgetType || ''

            const matchesSearch = !searchQuery ||
                title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCategory = !selectedCategory || jobCategory === selectedCategory
            const matchesExperience = !selectedExperience || jobExperience === selectedExperience
            const matchesBudgetType = !selectedBudgetType || jobBudgetType === selectedBudgetType

            return matchesSearch && matchesCategory && matchesExperience && matchesBudgetType
        })
    }, [openJobs, searchQuery, selectedCategory, selectedExperience, selectedBudgetType])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery) {
            setSearchParams({ search: searchQuery })
        } else {
            setSearchParams({})
        }
    }

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedCategory('')
        setSelectedExperience('')
        setSelectedBudgetType('')
        setSearchParams({})
    }

    const hasActiveFilters = selectedCategory || selectedExperience || selectedBudgetType

    const formatBudget = (job) => {
        if (!job || !job.budget) return '$0'
        if (job.budgetType === 'hourly') {
            return `$${job.budget}/hr`
        }
        return `$${Number(job.budget).toLocaleString()}`
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Recently'
        try {
            const date = new Date(dateString)
            const now = new Date()
            const diffTime = Math.abs(now - date)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays === 1) return 'Today'
            if (diffDays === 2) return 'Yesterday'
            if (diffDays <= 7) return `${diffDays} days ago`
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } catch (e) {
            return 'Recently'
        }
    }

    return (
        <div className="jobs-page page">
            <div className="container">
                {/* Page Header */}
                <div className="jobs-header">
                    <div className="jobs-header-content">
                        <h1>Find Your Next Project</h1>
                        <p>Browse {openJobs.length} opportunities from top companies worldwide</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="jobs-toolbar">
                    <form onSubmit={handleSearch} className="jobs-search">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by title, skill, or keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="btn btn-primary">
                            Search
                        </button>
                    </form>

                    <button
                        className={`filter-toggle ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                        Filters
                        {hasActiveFilters && <span className="filter-count">!</span>}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label className="filter-label">Category</label>
                                <div className="select-wrapper">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="select-icon" />
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Experience Level</label>
                                <div className="select-wrapper">
                                    <select
                                        value={selectedExperience}
                                        onChange={(e) => setSelectedExperience(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="">Any Experience</option>
                                        <option value="Entry">Entry Level</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                    <ChevronDown size={16} className="select-icon" />
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Budget Type</label>
                                <div className="select-wrapper">
                                    <select
                                        value={selectedBudgetType}
                                        onChange={(e) => setSelectedBudgetType(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="">Any Type</option>
                                        <option value="fixed">Fixed Price</option>
                                        <option value="hourly">Hourly Rate</option>
                                    </select>
                                    <ChevronDown size={16} className="select-icon" />
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <button className="clear-filters" onClick={clearFilters}>
                                    <X size={16} />
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Results */}
                <div className="jobs-results">
                    <div className="results-header">
                        <span className="results-count">
                            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
                        </span>
                    </div>

                    {filteredJobs.length > 0 ? (
                        <div className="jobs-list">
                            {filteredJobs.map((job) => (
                                <Link to={`/jobs/${job._id || job.id}`} key={job._id || job.id} className="job-card">
                                    <div className="job-card-header">
                                        <div className="job-main">
                                            <h3 className="job-title">{job.title}</h3>
                                            <p className="job-company">{job.clientName} • {job.company}</p>
                                        </div>
                                        <div className="job-budget">
                                            <span className="budget-value">{formatBudget(job)}</span>
                                            <span className="budget-type">
                                                {job.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="job-description">{job.description ? `${job.description.slice(0, 180)}...` : 'No description available'}</p>

                                    <div className="job-skills">
                                        {job.skills && Array.isArray(job.skills) && job.skills.slice(0, 4).map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill}</span>
                                        ))}
                                        {job.skills && job.skills.length > 4 && (
                                            <span className="skill-more">+{job.skills.length - 4}</span>
                                        )}
                                    </div>

                                    <div className="job-meta">
                                        <span className="meta-item">
                                            <MapPin size={14} />
                                            {job.location}
                                        </span>
                                        <span className="meta-item">
                                            <Clock size={14} />
                                            {job.duration}
                                        </span>
                                        <span className="meta-item">
                                            <Briefcase size={14} />
                                            {job.experience}
                                        </span>
                                        <span className="meta-item time">
                                            Posted {formatDate(job.createdAt)}
                                        </span>
                                    </div>

                                    {(job.applicantsCount > 0 || (job.applicants && job.applicants.length > 0)) && (
                                        <div className="job-applicants">
                                            <span>{job.applicantsCount || job.applicants?.length || 0} applicant{(job.applicantsCount || job.applicants?.length || 0) !== 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Briefcase size={48} className="empty-icon" />
                            <h3>No jobs found</h3>
                            <p>Try adjusting your search or filters to find more opportunities</p>
                            {hasActiveFilters && (
                                <button className="btn btn-secondary" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Jobs
