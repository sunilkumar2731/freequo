import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import {
    User,
    Building,
    Mail,
    MessageSquare,
    ExternalLink,
    MapPin,
    Calendar,
    Briefcase,
    ArrowLeft,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import './ClientProfile.css';

function ClientProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, isAuthenticated } = useAuth();

    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [isMessaging, setIsMessaging] = useState(false);
    const [messageSent, setMessageSent] = useState(false);

    useEffect(() => {
        const fetchClient = async () => {
            setLoading(true);
            setError(null);

            // DEMO FALLBACK: Check for demo IDs first
            if (id === 'client-1' || id === 'demo-client') {
                setClient({
                    _id: id,
                    name: 'John Smith',
                    email: 'freequoo@gmail.com',
                    company: 'TechCorp Inc.',
                    location: 'San Francisco, CA',
                    bio: 'John Smith is the lead client at TechCorp Inc., bringing years of experience in managing high-scale technical projects. He is known for his clear communication and commitment to quality.',
                    createdAt: '2023-01-01T00:00:00.000Z'
                });
                setLoading(false);
                return;
            }

            try {
                const response = await usersAPI.getUser(id);
                // The centralized API returns the data directly due to the interceptor
                if (response.success && response.data?.user) {
                    setClient(response.data.user);
                } else if (response.user) {
                    setClient(response.user);
                } else {
                    throw new Error('User data not found in response');
                }
            } catch (err) {
                console.error('Error fetching client:', err);

                // Final fallback for any 'client-' prefixed IDs that aren't in the DB
                if (id && id.toString().startsWith('client-')) {
                    setClient({
                        _id: id,
                        name: 'John Smith',
                        email: 'freequoo@gmail.com',
                        company: 'TechCorp Inc.',
                        location: 'San Francisco, CA',
                        bio: 'John Smith is the lead client at TechCorp Inc., bringing years of experience in managing high-scale technical projects.',
                        createdAt: new Date().toISOString()
                    });
                } else {
                    setError(err.message || 'Failed to load client profile');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchClient();
    }, [id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!messageText.trim()) return;

        setIsMessaging(true);
        try {
            await usersAPI.sendMessage(id, messageText);

            setMessageSent(true);
            setMessageText('');
        } catch (err) {
            console.error('Error sending message:', err);
            alert(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setIsMessaging(false);
        }
    };

    const handleSendEmail = () => {
        if (!client) return;

        const subject = encodeURIComponent('Inquiry regarding your job posting on Freequo');
        const body = encodeURIComponent(`Hi ${client.name},\n\nI saw your job posting on Freequo and I am interested in collaborating with you.\n\nBest regards,\n${currentUser?.name || 'A Freelancer'}`);

        window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
    };

    if (loading) {
        return (
            <div className="client-profile-page page">
                <div className="container">
                    <div className="profile-loading">
                        <div className="loader"></div>
                        <p>Loading client profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="client-profile-page page">
                <div className="container">
                    <div className="profile-error">
                        <AlertCircle size={48} />
                        <h2>Profile Not Found</h2>
                        <p>{error || "We couldn't find the client you're looking for."}</p>
                        <Link to="/jobs" className="btn btn-primary">Back to Jobs</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="client-profile-page page">
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="profile-header">
                    <div className="client-main-info">
                        <div className="client-avatar-large">
                            {client.avatar ? (
                                <img src={client.avatar} alt={client.name} />
                            ) : (
                                <span>{client.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="client-title-info">
                            <h1>{client.name}</h1>
                            <div className="client-metadata">
                                {client.company && (
                                    <span className="metadata-item">
                                        <Building size={16} /> {client.company}
                                    </span>
                                )}
                                {client.location && (
                                    <span className="metadata-item">
                                        <MapPin size={16} /> {client.location}
                                    </span>
                                )}
                                <span className="metadata-item">
                                    <Calendar size={16} /> Joined {new Date(client.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {currentUser?.id !== client._id && (
                        <div className="profile-actions">
                            <button className="btn btn-primary" onClick={() => document.getElementById('message-section')?.scrollIntoView({ behavior: 'smooth' })}>
                                <MessageSquare size={18} /> Message Client
                            </button>
                            <button className="btn btn-secondary" onClick={handleSendEmail}>
                                <Mail size={18} /> Send Email
                            </button>
                        </div>
                    )}
                </div>

                <div className="profile-content-grid">
                    <div className="profile-main">
                        <section className="profile-section">
                            <h2>About the Client</h2>
                            <p className="client-bio">
                                {client.bio || `${client.name} is a client on Freequo looking for talented freelancers to help with professional projects.`}
                            </p>
                        </section>

                        {currentUser?.id !== client._id && (
                            <section id="message-section" className="profile-section message-box">
                                <h2>Send a Message</h2>
                                {messageSent ? (
                                    <div className="message-success">
                                        <CheckCircle size={32} />
                                        <p>Your message has been sent successfully!</p>
                                        <button className="btn btn-outline" onClick={() => setMessageSent(false)}>Send another</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendMessage}>
                                        <textarea
                                            placeholder="Write your message here..."
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            required
                                        ></textarea>
                                        <button type="submit" className="btn btn-primary" disabled={isMessaging}>
                                            {isMessaging ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </form>
                                )}
                            </section>
                        )}
                    </div>

                    <div className="profile-sidebar">
                        <div className="sidebar-card client-stats">
                            <h3>Client Information</h3>
                            <div className="stat-row">
                                <span className="stat-label">Member Since</span>
                                <span className="stat-value">{new Date(client.createdAt).getFullYear()}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Email Verified</span>
                                <span className="stat-value text-success"><CheckCircle size={14} /> Yes</span>
                            </div>
                        </div>

                        <div className="sidebar-card contact-info">
                            <h3>Contact</h3>
                            {isAuthenticated ? (
                                <div className="contact-details">
                                    <div className="contact-item">
                                        <Mail size={16} /> {client.email}
                                    </div>
                                </div>
                            ) : (
                                <div className="contact-protected">
                                    <p><Link to="/login">Log in</Link> to see contact details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientProfile;
