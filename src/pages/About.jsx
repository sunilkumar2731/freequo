import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Users, Target, Shield, Sparkles,
    ArrowRight, CheckCircle, Globe, Zap
} from 'lucide-react'
import './About.css'

function About() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100)
    }, [])

    const values = [
        {
            icon: <Target size={28} />,
            title: 'Simplicity',
            description: 'We believe in keeping things straightforward. No complex processes, just seamless connections.'
        },
        {
            icon: <Shield size={28} />,
            title: 'Transparency',
            description: 'Clear communication and honest dealings are at the heart of everything we do.'
        },
        {
            icon: <Sparkles size={28} />,
            title: 'Opportunity',
            description: 'We create pathways for freelancers and businesses to grow and succeed together.'
        }
    ]

    const stats = [
        { number: '10K+', label: 'Active Freelancers' },
        { number: '5K+', label: 'Projects Completed' },
        { number: '98%', label: 'Satisfaction Rate' },
        { number: '50+', label: 'Skill Categories' }
    ]

    return (
        <div className={`about-page ${isVisible ? 'visible' : ''}`}>
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-background">
                    <div className="hero-orb hero-orb-1" />
                    <div className="hero-orb hero-orb-2" />
                    <div className="hero-grid" />
                </div>

                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <Globe size={16} />
                            <span>About Freequo</span>
                        </div>

                        <h1 className="hero-title">
                            Connecting <span className="gradient-text">Talent</span> with <span className="gradient-text">Opportunity</span>
                        </h1>

                        <p className="hero-description">
                            Freequo is a modern freelance marketplace built to connect skilled freelancers,
                            students, and businesses in one trusted platform. We focus on simplicity,
                            transparency, and opportunity — helping clients get work done and freelancers
                            grow their careers with confidence.
                        </p>

                        <div className="hero-actions">
                            <Link to="/jobs" className="btn btn-primary btn-lg">
                                <span>Explore Jobs</span>
                                <ArrowRight size={20} />
                            </Link>
                            <Link to="/signup" className="btn btn-secondary btn-lg">
                                Join Our Community
                            </Link>
                        </div>
                    </div>

                    <div className="hero-illustration">
                        <div className="illustration-card">
                            <img src="/freequo-logo.png" alt="Freequo" className="about-logo" />
                            <h3>Freequo</h3>
                            <p>Your trusted freelance partner</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                <span className="stat-number">{stat.number}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="mission-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">
                            <Zap size={16} />
                            Our Mission
                        </span>
                        <h2>Empowering the Future of Work</h2>
                        <p>
                            We're building more than a platform — we're creating a community where
                            talent meets opportunity without barriers.
                        </p>
                    </div>

                    <div className="mission-content">
                        <div className="mission-text">
                            <div className="mission-point">
                                <CheckCircle size={20} className="check-icon" />
                                <span>Connect skilled professionals with meaningful projects</span>
                            </div>
                            <div className="mission-point">
                                <CheckCircle size={20} className="check-icon" />
                                <span>Provide students with real-world experience opportunities</span>
                            </div>
                            <div className="mission-point">
                                <CheckCircle size={20} className="check-icon" />
                                <span>Enable businesses to find the perfect talent quickly</span>
                            </div>
                            <div className="mission-point">
                                <CheckCircle size={20} className="check-icon" />
                                <span>Foster a transparent and fair working environment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">
                            <Users size={16} />
                            Our Values
                        </span>
                        <h2>What We Stand For</h2>
                        <p>These core values guide everything we do at Freequo.</p>
                    </div>

                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="value-card"
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                <div className="value-icon">{value.icon}</div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <div className="cta-content">
                            <h2>Ready to Get Started?</h2>
                            <p>
                                Join thousands of freelancers and businesses already growing with Freequo.
                            </p>
                            <div className="cta-buttons">
                                <Link to="/signup?role=freelancer" className="btn btn-white btn-lg">
                                    <span>Start as Freelancer</span>
                                    <ArrowRight size={20} />
                                </Link>
                                <Link to="/signup?role=client" className="btn btn-outline-white btn-lg">
                                    Hire Talent
                                </Link>
                            </div>
                        </div>
                        <div className="cta-decoration">
                            <div className="cta-circle cta-circle-1" />
                            <div className="cta-circle cta-circle-2" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default About
