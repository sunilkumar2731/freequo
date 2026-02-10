import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { ArrowLeft, Plus, X, Briefcase, DollarSign, Clock, LayoutGrid, Award, Calendar } from 'lucide-react'
import './PostJob.css'

function PostJob() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { createJob, categories } = useData()

    useEffect(() => {
        if (isAuthenticated && user?.role !== 'client') {
            navigate('/')
        }
    }, [user, isAuthenticated, navigate])

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        budget: '',
        budgetType: 'fixed',
        duration: '',
        deadline: '',
        experience: 'Intermediate',
        skills: [],
        location: 'Remote'
    })
    const [skillInput, setSkillInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const setBudgetType = (type) => {
        setFormData(prev => ({ ...prev, budgetType: type }))
    }

    const setExperience = (level) => {
        setFormData(prev => ({ ...prev, experience: level }))
    }

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skillInput.trim()]
            }))
            setSkillInput('')
        }
    }

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }))
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addSkill()
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.title.trim()) newErrors.title = 'Title is required'
        if (!formData.description.trim()) newErrors.description = 'Description is required'
        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.budget || isNaN(formData.budget)) newErrors.budget = 'Valid budget is required'
        if (!formData.duration.trim()) newErrors.duration = 'Project duration is required'
        if (!formData.deadline.trim()) newErrors.deadline = 'Application deadline is required'
        if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validate()) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        setLoading(true)

        const jobData = {
            ...formData,
            budget: parseFloat(formData.budget),
            clientId: user?._id || user?.id,
            clientName: user?.name,
            company: user?.company || 'Independent Client'
        }

        try {
            const result = await createJob(jobData)
            if (result.success) {
                navigate('/client/dashboard')
            } else {
                setErrors(prev => ({ ...prev, submit: result.error || 'Failed to post job' }))
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, submit: 'An error occurred while posting the job' }))
        } finally {
            setLoading(false)
        }
    }

    if (user?.role !== 'client') return null;

    return (
        <div className="post-job-page">
            <div className="post-job-container">
                <div className="post-job-header">
                    <h1>Create a New Project</h1>
                    <p>Provide the details below to find the perfect expert for your project.</p>
                </div>

                <div className="post-job-card">
                    <form onSubmit={handleSubmit}>
                        {/* Section 1: Basic Info */}
                        <div className="job-section">
                            <h3><span>1</span> Project Basics</h3>

                            <div className="field-group">
                                <label className="field-label">Project Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Build a High-Performance Landing Page"
                                    className={`input-style ${errors.title ? 'error' : ''}`}
                                />
                                {errors.title && <span className="field-error">{errors.title}</span>}
                            </div>

                            <div className="grid-2">
                                <div className="field-group">
                                    <label className="field-label">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className={`input-style ${errors.category ? 'error' : ''}`}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category && <span className="field-error">{errors.category}</span>}
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Location</label>
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="input-style"
                                    >
                                        <option value="Remote">Remote</option>
                                        <option value="On-site">On-site</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Details */}
                        <div className="job-section">
                            <h3><span>2</span> Project Details</h3>

                            <div className="field-group">
                                <label className="field-label">Detailed Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Explain your goals, requirements, and what you expect from the freelancer..."
                                    className={`input-style textarea-style ${errors.description ? 'error' : ''}`}
                                />
                                {errors.description && <span className="field-error">{errors.description}</span>}
                            </div>

                            <div className="field-group">
                                <label className="field-label">Experience Level Targeted</label>
                                <div className="pill-selector">
                                    {['Entry', 'Intermediate', 'Expert'].map(level => (
                                        <div
                                            key={level}
                                            className={`pill-option ${formData.experience === level ? 'active' : ''}`}
                                            onClick={() => setExperience(level)}
                                        >
                                            {level}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Budget & Timeline */}
                        <div className="job-section">
                            <h3><span>3</span> Budget & Timeline</h3>

                            <div className="grid-2">
                                <div className="field-group">
                                    <label className="field-label">Primary Budget ($)</label>
                                    <div className="budget-input-wrapper">
                                        <span className="budget-prefix">$</span>
                                        <input
                                            type="number"
                                            name="budget"
                                            value={formData.budget}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className={`input-style budget-input ${errors.budget ? 'error' : ''}`}
                                        />
                                    </div>
                                    {errors.budget && <span className="field-error">{errors.budget}</span>}
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Budget Structure</label>
                                    <div className="pill-selector">
                                        <div
                                            className={`pill-option ${formData.budgetType === 'fixed' ? 'active' : ''}`}
                                            onClick={() => setBudgetType('fixed')}
                                        >
                                            Fixed Price
                                        </div>
                                        <div
                                            className={`pill-option ${formData.budgetType === 'hourly' ? 'active' : ''}`}
                                            onClick={() => setBudgetType('hourly')}
                                        >
                                            Hourly Rate
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="field-group">
                                    <label className="field-label">Project Duration</label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        placeholder="e.g. 2 Months"
                                        className={`input-style ${errors.duration ? 'error' : ''}`}
                                    />
                                    {errors.duration && <span className="field-error">{errors.duration}</span>}
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Application Deadline</label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        className={`input-style ${errors.deadline ? 'error' : ''}`}
                                    />
                                    {errors.deadline && <span className="field-error">{errors.deadline}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Skills */}
                        <div className="job-section">
                            <h3><span>4</span> Skills & Expertise</h3>
                            <div className="field-group">
                                <label className="field-label">Required Skills</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type skill and press Enter"
                                        className="input-style"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSkill}
                                        className="btn-premium btn-premium-secondary"
                                        style={{ padding: '0 1.5rem' }}
                                    >
                                        Add
                                    </button>
                                </div>
                                {errors.skills && <span className="field-error">{errors.skills}</span>}

                                <div className="skills-container">
                                    {formData.skills.length > 0 ? (
                                        <div className="skill-pills-list">
                                            {formData.skills.map((skill, index) => (
                                                <span key={index} className="skill-pill">
                                                    {skill}
                                                    <button type="button" onClick={() => removeSkill(skill)}>
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No skills added yet</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-footer">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="btn-premium btn-premium-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-premium btn-premium-primary"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Launch Project'}
                            </button>
                        </div>
                        {errors.submit && <p className="field-error" style={{ textAlign: 'center', marginTop: '1rem' }}>{errors.submit}</p>}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PostJob
