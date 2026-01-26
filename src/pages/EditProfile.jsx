import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Plus, X, Upload } from 'lucide-react'
import './Forms.css'

function EditProfile() {
    const navigate = useNavigate()
    const { user, updateUser } = useAuth()

    const [formData, setFormData] = useState({
        name: user?.name || '',
        title: user?.title || '',
        bio: user?.bio || '',
        skills: user?.skills || [],
        hourlyRate: user?.hourlyRate || '',
        experience: user?.experience || '',
        location: user?.location || '',
        portfolio: user?.portfolio || ''
    })
    const [skillInput, setSkillInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setSaved(false)
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

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)

        const profileData = {
            ...formData,
            hourlyRate: parseFloat(formData.hourlyRate) || 0
        }

        setTimeout(() => {
            updateUser(profileData)
            setLoading(false)
            setSaved(true)
        }, 800)
    }

    const suggestedSkills = [
        'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript',
        'Figma', 'UI Design', 'Content Writing', 'SEO', 'Marketing'
    ].filter(skill => !formData.skills.includes(skill))

    return (
        <div className="form-page page">
            <div className="container">
                <button onClick={() => navigate('/freelancer/dashboard')} className="back-link">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>

                <div className="form-container">
                    <div className="form-header">
                        <h1>Edit Your Profile</h1>
                        <p>Make your profile stand out to attract more clients</p>
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form">
                        {/* Avatar Section */}
                        <div className="avatar-section">
                            <div className="avatar-display">
                                <div className="large-avatar">
                                    {formData.name?.charAt(0) || 'U'}
                                </div>
                            </div>
                            <div className="avatar-info">
                                <h3>Profile Picture</h3>
                                <p>A professional photo helps you stand out</p>
                                <button type="button" className="btn btn-secondary btn-sm" disabled>
                                    <Upload size={16} />
                                    Upload Photo (Coming Soon)
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Professional Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Senior Full-Stack Developer"
                                className="form-input"
                            />
                            <span className="form-hint">This appears right below your name</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                                className="form-textarea"
                                rows={6}
                            />
                            <span className="form-hint">{formData.bio.length}/500 characters</span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Hourly Rate ($)</label>
                                <div className="input-group">
                                    <span className="input-prefix">$</span>
                                    <input
                                        type="number"
                                        name="hourlyRate"
                                        value={formData.hourlyRate}
                                        onChange={handleChange}
                                        placeholder="75"
                                        className="form-input with-prefix"
                                        min="1"
                                    />
                                    <span className="input-suffix">/hr</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Experience</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    placeholder="e.g., 5 years"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., San Francisco, CA"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Portfolio URL</label>
                                <input
                                    type="url"
                                    name="portfolio"
                                    value={formData.portfolio}
                                    onChange={handleChange}
                                    placeholder="https://yourportfolio.com"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Skills</label>
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

                            {suggestedSkills.length > 0 && (
                                <div className="suggested-skills">
                                    <span className="suggested-label">Suggested:</span>
                                    {suggestedSkills.slice(0, 5).map((skill) => (
                                        <button
                                            key={skill}
                                            type="button"
                                            className="suggested-skill"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    skills: [...prev.skills, skill]
                                                }))
                                            }}
                                        >
                                            + {skill}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/freelancer/dashboard')}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditProfile
