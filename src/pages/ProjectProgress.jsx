import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    CheckCircle,
    Circle,
    Clock,
    MessageSquare,
    Send,
    Paperclip,
    Download,
    User,
    Calendar
} from 'lucide-react'
import './ProjectProgress.css'

const milestones = [
    { id: 1, name: 'Requirement', status: 'completed', date: '2024-01-10' },
    { id: 2, name: 'Design', status: 'completed', date: '2024-01-15' },
    { id: 3, name: 'Development', status: 'active', date: '2024-01-20' },
    { id: 4, name: 'Testing', status: 'pending', date: '2024-01-25' },
    { id: 5, name: 'Delivery', status: 'pending', date: '2024-01-30' }
]

const chatMessages = [
    {
        id: 1,
        sender: 'client',
        name: 'John Smith',
        avatar: 'J',
        message: 'Hi! How is the development going?',
        time: '10:30 AM',
        date: 'Today'
    },
    {
        id: 2,
        sender: 'freelancer',
        name: 'Sarah Johnson',
        avatar: 'S',
        message: 'Great! I\'ve completed the user authentication module. Moving on to the dashboard next.',
        time: '10:45 AM',
        date: 'Today'
    },
    {
        id: 3,
        sender: 'client',
        name: 'John Smith',
        avatar: 'J',
        message: 'Excellent! Can you share a preview?',
        time: '10:50 AM',
        date: 'Today'
    },
    {
        id: 4,
        sender: 'freelancer',
        name: 'Sarah Johnson',
        avatar: 'S',
        message: 'Sure! I\'ll send you the staging link in a few minutes.',
        time: '10:52 AM',
        date: 'Today'
    }
]

const projectFiles = [
    { id: 1, name: 'Requirements.pdf', size: '2.4 MB', uploadedBy: 'Client', date: '2024-01-10' },
    { id: 2, name: 'Design_Mockups.fig', size: '15.8 MB', uploadedBy: 'Freelancer', date: '2024-01-15' },
    { id: 3, name: 'Project_Proposal.docx', size: '1.2 MB', uploadedBy: 'Freelancer', date: '2024-01-12' }
]

function ProjectProgress() {
    const { id } = useParams()
    const [message, setMessage] = useState('')

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (message.trim()) {
            console.log('Sending message:', message)
            setMessage('')
        }
    }

    const getStatusIcon = (status) => {
        if (status === 'completed') {
            return <CheckCircle size={24} className="milestone-icon completed" />
        } else if (status === 'active') {
            return <Clock size={24} className="milestone-icon active" />
        }
        return <Circle size={24} className="milestone-icon pending" />
    }

    return (
        <div className="project-progress-page page">
            <div className="container">
                <Link to="/freelancer/dashboard" className="back-link">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                <div className="project-progress-header">
                    <div>
                        <h1>E-commerce Website Development</h1>
                        <p className="project-client">
                            <User size={16} />
                            Client: John Smith • TechStart Inc.
                        </p>
                    </div>
                    <div className="project-status-badge active">
                        In Progress
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="timeline-section">
                    <h2 className="section-title">Project Timeline</h2>
                    <div className="timeline-container">
                        <div className="timeline-track">
                            {milestones.map((milestone, index) => (
                                <div key={milestone.id} className="timeline-item-wrapper">
                                    <div className={`timeline-item ${milestone.status}`}>
                                        <div className="timeline-icon">
                                            {getStatusIcon(milestone.status)}
                                        </div>
                                        <div className="timeline-content">
                                            <h4 className="timeline-title">{milestone.name}</h4>
                                            <p className="timeline-date">
                                                <Calendar size={14} />
                                                {new Date(milestone.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {index < milestones.length - 1 && (
                                        <div className={`timeline-connector ${milestone.status === 'completed' ? 'completed' : ''}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="project-content-grid">
                    {/* Left: Project Details & Files */}
                    <div className="project-details-section">
                        <div className="details-card">
                            <h3>Milestone Details</h3>
                            <div className="milestone-info">
                                <div className="info-item">
                                    <span className="info-label">Current Phase</span>
                                    <span className="info-value">Development</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Progress</span>
                                    <span className="info-value">60%</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Due Date</span>
                                    <span className="info-value">Jan 30, 2024</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Budget</span>
                                    <span className="info-value">$5,000</span>
                                </div>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '60%' }}></div>
                            </div>
                        </div>

                        <div className="files-card">
                            <h3>Project Files</h3>
                            <div className="files-list">
                                {projectFiles.map((file) => (
                                    <div key={file.id} className="file-item">
                                        <div className="file-info">
                                            <div className="file-icon">
                                                <Paperclip size={18} />
                                            </div>
                                            <div className="file-details">
                                                <h5>{file.name}</h5>
                                                <p>{file.size} • {file.uploadedBy} • {file.date}</p>
                                            </div>
                                        </div>
                                        <button className="file-download">
                                            <Download size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-secondary btn-sm">
                                <Paperclip size={16} />
                                Upload File
                            </button>
                        </div>
                    </div>

                    {/* Right: Chat Panel */}
                    <div className="chat-panel">
                        <div className="chat-header">
                            <h3>
                                <MessageSquare size={20} />
                                Project Chat
                            </h3>
                        </div>
                        <div className="chat-messages">
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`chat-message ${msg.sender}`}>
                                    <div className="message-avatar">{msg.avatar}</div>
                                    <div className="message-content">
                                        <div className="message-header">
                                            <span className="message-name">{msg.name}</span>
                                            <span className="message-time">{msg.time}</span>
                                        </div>
                                        <p className="message-text">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form className="chat-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="chat-input"
                            />
                            <button type="submit" className="btn btn-primary btn-icon">
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectProgress
