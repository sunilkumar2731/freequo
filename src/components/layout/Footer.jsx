import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Footer.css'

function Footer() {
    const { user } = useAuth()
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="logo-accent">Free</span>quo
                        </Link>
                        <p className="footer-description">
                            The worlds's leading marketplace for high-quality freelance services and creative talent.
                        </p>
                        <div className="footer-contact-info">
                            <a href="mailto:freequoo@gmail.com" className="contact-item">
                                <Mail size={16} />
                                <span>freequoo@gmail.com</span>
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="footer-links">
                        <h4 className="footer-heading">NAVIGATION</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            {(!user || user.role === 'freelancer') && (
                                <li><Link to="/jobs">Find Jobs</Link></li>
                            )}
                            {user?.role === 'client' && (
                                <li><Link to="/client/post-job">Post a Job</Link></li>
                            )}
                            <li><a href="#">Features</a></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><a href="#">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="footer-links">
                        <h4 className="footer-heading">LEGAL</h4>
                        <ul>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Cookie Policy</a></li>
                            <li><Link to="/admin">Admin Panel</Link></li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div className="footer-links">
                        <h4 className="footer-heading">CONNECT</h4>
                        <div className="footer-social-new">
                            <a href="#" className="social-circle" aria-label="Twitter">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="social-circle" aria-label="LinkedIn">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="social-circle" aria-label="Instagram">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="copyright">© {currentYear} Freequo. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Sitemap</a>
                        <a href="#">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
