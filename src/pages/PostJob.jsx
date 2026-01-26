import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { ArrowLeft, Plus, X } from 'lucide-react'
import './Forms.css'

function PostJob() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { createJob, categories } = useData()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        budget: '',
        budgetType: 'fixed',
        duration: '',
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
        if (!formData.duration.trim()) newErrors.duration = 'Duration is required'
        if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validate()) return

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

    return (
        <div className="form-page page">
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-link">
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="form-container">
                    <div className="form-header">
                        <h1>Post a New Job</h1>
                        <p>Describe your project and find the perfect freelancer</p>
                    </div>

                    <form onSubmit={handleSubmit} className="job-form">
                        <div className="form-group">
                            <label className="form-label">Job Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Build a Modern E-commerce Website"
                                className={`form-input ${errors.title ? 'error' : ''}`}
                            />
                            {errors.title && <span className="form-error">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your project in detail. Include requirements, deliverables, and any specific skills needed..."
                                className={`form-textarea ${errors.description ? 'error' : ''}`}
                                rows={8}
                            />
                            {errors.description && <span className="form-error">{errors.description}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`form-select ${errors.category ? 'error' : ''}`}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category && <span className="form-error">{errors.category}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Experience Level</label>
                                <select
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="Entry">Entry Level</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Budget *</label>
                                <div className="input-group">
                                    <span className="input-prefix">$</span>
                                    <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        placeholder="5000"
                                        className={`form-input with-prefix ${errors.budget ? 'error' : ''}`}
                                        min="1"
                                    />
                                </div>
                                {errors.budget && <span className="form-error">{errors.budget}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Budget Type</label>
                                <div className="radio-group">
                                    <label className={`radio-option ${formData.budgetType === 'fixed' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="budgetType"
                                            value="fixed"
                                            checked={formData.budgetType === 'fixed'}
                                            onChange={handleChange}
                                        />
                                        <span>Fixed Price</span>
                                    </label>
                                    <label className={`radio-option ${formData.budgetType === 'hourly' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="budgetType"
                                            value="hourly"
                                            checked={formData.budgetType === 'hourly'}
                                            onChange={handleChange}
                                        />
                                        <span>Hourly Rate</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Duration *</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g., 2-3 months"
                                    className={`form-input ${errors.duration ? 'error' : ''}`}
                                />
                                {errors.duration && <span className="form-error">{errors.duration}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="Remote">Remote</option>
                                    <option value="On-site">On-site</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Required Skills *</label>
                            <div className="skills-input-container">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a skill and press Enter"
                                    className="form-input"
                                />
                                <button type="button" onClick={addSkill} className="btn btn-secondary">
                                    <Plus size={18} />
                                    Add
                                </button>
                            </div>
                            {errors.skills && <span className="form-error">{errors.skills}</span>}

                            {formData.skills.length > 0 && (
                                <div className="skills-list">
                                    {formData.skills.map((skill, index) => (
                                        <span key={index} className="skill-tag">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)}>
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Posting...' : 'Post Job'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PostJob
