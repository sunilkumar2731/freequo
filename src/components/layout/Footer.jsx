import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'
import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <img src="/logo.png" alt="Freequo" className="footer-logo-image" />
                            <span>Freequo</span>
                        </Link>
                        <p className="footer-description">
                            Connect with top freelancers and get your projects done. The trusted marketplace for quality work.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>

                    {/* For Clients */}
                    <div className="footer-links">
                        <h4>For Clients</h4>
                        <ul>
                            <li><Link to="/jobs">Browse Jobs</Link></li>
                            <li><Link to="/signup">Post a Project</Link></li>
                            <li><a href="#">How to Hire</a></li>
                            <li><a href="#">Talent Marketplace</a></li>
                        </ul>
                    </div>

                    {/* For Freelancers */}
                    <div className="footer-links">
                        <h4>For Freelancers</h4>
                        <ul>
                            <li><Link to="/jobs">Find Work</Link></li>
                            <li><Link to="/signup">Create Profile</Link></li>
                            <li><a href="#">Success Stories</a></li>
                            <li><a href="#">Resources</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-links">
                        <h4>Contact Us</h4>
                        <ul className="contact-list">
                            <li>
                                <Mail size={16} />
                                <span>support@freequo.com</span>
                            </li>
                            <li>
                                <Phone size={16} />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li>
                                <MapPin size={16} />
                                <span>San Francisco, CA</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Freequo. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
