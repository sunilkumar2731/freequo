import { Link } from 'react-router-dom'
import {
    ArrowRight,
    Search,
    CheckCircle,
    Users,
    Briefcase,
    Star,
    Code,
    Smartphone,
    Palette,
    PenTool,
    TrendingUp,
    BarChart,
    Video,
    Music,
    Quote
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const iconMap = {
    Code, Smartphone, Palette, PenTool, TrendingUp, BarChart, Video, Music
}

const testimonials = [
    {
        id: 1,
        name: 'Michael Torres',
        role: 'CEO, StartupX',
        avatar: 'M',
        content: 'Freequo transformed how we build our team. We found incredible developers who delivered beyond expectations. The quality of talent here is unmatched.',
        rating: 5
    },
    {
        id: 2,
        name: 'Jennifer Kim',
        role: 'Full-Stack Developer',
        avatar: 'J',
        content: "As a freelancer, this platform gave me access to amazing projects and clients. I've doubled my income and work with companies I never thought possible.",
        rating: 5
    },
    {
        id: 3,
        name: 'David Chen',
        role: 'Product Manager, TechCo',
        avatar: 'D',
        content: "The hiring process is seamless. We've built lasting relationships with freelancers who understand our vision and deliver consistently excellent work.",
        rating: 5
    }
]

const stats = [
    { value: '50K+', label: 'Active Freelancers' },
    { value: '25K+', label: 'Jobs Posted' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '$15M+', label: 'Total Earnings' }
]

function Home() {
    const { categories } = useData()
    const { isAuthenticated, user } = useAuth()

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-gradient" />
                    <div className="hero-pattern" />
                </div>
                <div className="container hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge-dot" />
                            Trusted by 50,000+ professionals
                        </div>
                        <h1 className="hero-title">
                            Hire Freelancers.
                            <br />
                            <span className="gradient-text">Get Work Done.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Connect with top-tier freelancers and transform your ideas into reality.
                            Join thousands of businesses and talented professionals on the platform built for success.
                        </p>
                        <div className="hero-actions">
                            {isAuthenticated ? (
                                user?.role === 'client' ? (
                                    <Link to="/client/post-job" className="btn btn-primary btn-lg">
                                        Post a Job <ArrowRight size={20} />
                                    </Link>
                                ) : user?.role === 'freelancer' ? (
                                    <Link to="/jobs" className="btn btn-primary btn-lg">
                                        Find Work <ArrowRight size={20} />
                                    </Link>
                                ) : (
                                    <Link to="/admin" className="btn btn-primary btn-lg">
                                        Admin Panel <ArrowRight size={20} />
                                    </Link>
                                )
                            ) : (
                                <>
                                    <Link to="/signup?role=client" className="btn btn-primary btn-lg">
                                        Post a Job <ArrowRight size={20} />
                                    </Link>
                                    <Link to="/signup?role=freelancer" className="btn btn-secondary btn-lg">
                                        Find Work
                                    </Link>
                                </>
                            )}
                        </div>

                        {(!isAuthenticated || user?.role === 'freelancer') && (
                            <div className="hero-search">
                                <div className="search-box">
                                    <Search size={20} className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search for any service..."
                                        className="search-input"
                                    />
                                    <Link to="/jobs" className="btn btn-primary">
                                        Search
                                    </Link>
                                </div>
                                <div className="popular-searches">
                                    <span>Popular:</span>
                                    <Link to="/jobs?category=Web Development">Web Development</Link>
                                    <Link to="/jobs?category=Design">Design</Link>
                                    <Link to="/jobs?category=Writing">Writing</Link>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="hero-visual">
                        <div className="hero-card hero-card-1">
                            <div className="card-icon success">
                                <CheckCircle size={24} />
                            </div>
                            <div className="card-content">
                                <div className="card-label">Project Completed</div>
                                <div className="card-value">E-commerce Website</div>
                            </div>
                        </div>
                        <div className="hero-card hero-card-2">
                            <div className="card-icon primary">
                                <Users size={24} />
                            </div>
                            <div className="card-content">
                                <div className="card-label">New Applicants</div>
                                <div className="card-value">+28 this week</div>
                            </div>
                        </div>
                        <div className="hero-card hero-card-3">
                            <div className="card-icon warning">
                                <Star size={24} />
                            </div>
                            <div className="card-content">
                                <div className="card-label">Average Rating</div>
                                <div className="card-value">4.9 / 5.0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="section how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">How Freequo Works</h2>
                        <p className="section-subtitle">
                            Get started in three simple steps. Whether you're hiring or looking for work,
                            we make it easy to connect and collaborate.
                        </p>
                    </div>
                    <div className="steps-grid">
                        <Link
                            to={isAuthenticated && user?.role === 'client' ? '/client/post-job' : '/signup?role=client'}
                            className="step-card step-card-clickable"
                        >
                            <div className="step-number">01</div>
                            <div className="step-icon">
                                <Briefcase size={32} />
                            </div>
                            <h3>Post Your Job</h3>
                            <p>Describe your project, set your budget, and let talented freelancers come to you.</p>
                        </Link>
                        <div className="step-connector" />
                        <Link
                            to="/jobs"
                            className="step-card step-card-clickable"
                        >
                            <div className="step-number">02</div>
                            <div className="step-icon">
                                <Search size={32} />
                            </div>
                            <h3>Find the Perfect Match</h3>
                            <p>Review proposals, check portfolios, and select the best freelancer for your needs.</p>
                        </Link>
                        <div className="step-connector" />
                        <Link
                            to={isAuthenticated ? (user?.role === 'client' ? '/client/dashboard' : user?.role === 'freelancer' ? '/freelancer/dashboard' : '/admin') : '/login'}
                            className="step-card step-card-clickable"
                        >
                            <div className="step-number">03</div>
                            <div className="step-icon">
                                <CheckCircle size={32} />
                            </div>
                            <h3>Get Work Done</h3>
                            <p>Collaborate seamlessly, track progress, and receive high-quality deliverables.</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section categories-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Explore Popular Categories</h2>
                        <p className="section-subtitle">
                            Find talented freelancers across a wide range of skills and industries.
                        </p>
                    </div>
                    <div className="categories-grid">
                        {categories.map((category, index) => {
                            const IconComponent = iconMap[category.icon] || Code
                            return (
                                <Link to={`/jobs?category=${category.name}`} key={index} className="category-card">
                                    <div className="category-icon">
                                        <IconComponent size={28} />
                                    </div>
                                    <h4>{category.name}</h4>
                                    <p>{category.count} jobs available</p>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="section testimonials-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">What Our Users Say</h2>
                        <p className="section-subtitle">
                            Hear from clients and freelancers who have found success on Freequo.
                        </p>
                    </div>
                    <div className="testimonials-grid">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="testimonial-card">
                                <div className="testimonial-quote">
                                    <Quote size={32} />
                                </div>
                                <p className="testimonial-content">{testimonial.content}</p>
                                <div className="testimonial-rating">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="currentColor" />
                                    ))}
                                </div>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{testimonial.avatar}</div>
                                    <div>
                                        <div className="author-name">{testimonial.name}</div>
                                        <div className="author-role">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <div className="cta-blur-circle cta-blur-1"></div>
                        <div className="cta-blur-circle cta-blur-2"></div>
                        <div className="cta-content">
                            <h2>Ready to Get Started?</h2>
                            <p>Join thousands of freelancers and businesses already growing with Freequo.</p>
                            <div className="cta-buttons">
                                <Link to="/signup?role=freelancer" className="btn btn-primary btn-lg">
                                    Start as Freelancer <ArrowRight size={18} />
                                </Link>
                                <Link to="/signup?role=client" className="btn btn-secondary btn-lg">
                                    Hire Talent
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
