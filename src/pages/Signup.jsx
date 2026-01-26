import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    UserPlus,
    AlertCircle,
    ArrowRight,
    Check,
    Briefcase,
    Building
} from 'lucide-react';
import './Auth.css';

function Signup() {
    const navigate = useNavigate();
    const { signup, loginWithGoogle, isAuthenticated, user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'freelancer' // Default role
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(`/${user.role}/dashboard`);
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        setIsVisible(true);
        document.title = 'Join Freequo | Sign Up';
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signup(formData);
            if (!result.success) {
                setError(result.error || 'Signup failed. Please try again.');
                setLoading(false);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        try {
            // Pass the selected role to Google login
            const result = await loginWithGoogle(formData.role);
            if (!result.success) {
                setError(result.error);
            }
        } catch (err) {
            setError('Google signup failed');
        }
    };

    return (
        <div className="auth-cinematic">
            {/* Background Effects */}
            <div className="auth-canvas">
                <div className="orb orb-primary"></div>
                <div className="orb orb-secondary"></div>
                <div className="orb orb-accent"></div>
                <div className="grid-overlay"></div>
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>

                <div className="particles">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="particle"
                            style={{
                                '--x': `${Math.random() * 100}%`,
                                '--y': `${Math.random() * 100}%`,
                                '--size': `${Math.random() * 4 + 2}px`,
                                '--duration': `${Math.random() * 15 + 10}s`,
                                '--delay': `${Math.random() * 10}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            <div className={`auth-card-wrapper ${isVisible ? 'visible' : ''}`}>
                <div className="auth-glass-card">
                    <div className="card-glow-border"></div>
                    <div className="card-inner">
                        <div className="mode-toggle">
                            <Link to="/login" className="mode-btn">Login</Link>
                            <button className="mode-btn active">Sign Up</button>
                            <div className="mode-slider signup"></div>
                        </div>

                        <div className="form-content">
                            <div className="form-header">
                                <div className="header-icon">
                                    <UserPlus size={32} />
                                </div>
                                <h1>Create Account</h1>
                                <p>Join the world's best freelance marketplace</p>
                            </div>

                            {error && (
                                <div className="error-alert">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form className="auth-form" onSubmit={handleSubmit}>
                                <div className="role-selector">
                                    <div
                                        className={`role-option ${formData.role === 'freelancer' ? 'active' : ''}`}
                                        onClick={() => handleRoleSelect('freelancer')}
                                    >
                                        <div className="role-check">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <Briefcase size={18} />
                                        <span>Freelancer</span>
                                    </div>
                                    <div
                                        className={`role-option ${formData.role === 'client' ? 'active' : ''}`}
                                        onClick={() => handleRoleSelect('client')}
                                    >
                                        <div className="role-check">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <Building size={18} />
                                        <span>Client</span>
                                    </div>
                                </div>

                                <div className={`input-group ${focusedField === 'name' ? 'focused' : ''} ${formData.name ? 'filled' : ''}`}>
                                    <User className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                    />
                                    <label htmlFor="name">Full Name</label>
                                    <div className="input-glow"></div>
                                    <div className="input-line"></div>
                                </div>

                                <div className={`input-group ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
                                    <Mail className="input-icon" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                    />
                                    <label htmlFor="email">Email Address</label>
                                    <div className="input-glow"></div>
                                    <div className="input-line"></div>
                                </div>

                                <div className={`input-group ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'filled' : ''}`}>
                                    <Lock className="input-icon" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        id="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                    />
                                    <label htmlFor="password">Password</label>
                                    <button
                                        type="button"
                                        className="toggle-visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                    <div className="input-glow"></div>
                                    <div className="input-line"></div>
                                </div>

                                <button
                                    type="submit"
                                    className={`submit-btn ${loading ? 'loading' : ''}`}
                                    disabled={loading}
                                >
                                    <div className="btn-bg"></div>
                                    <div className="btn-shine"></div>
                                    <div className="btn-content">
                                        {loading ? (
                                            <div className="loader"></div>
                                        ) : (
                                            <>
                                                <span>Join Now</span>
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>

                            <div className="auth-divider">
                                <span>OR</span>
                            </div>

                            <div className="social-auth-buttons">
                                <button type="button" className="social-btn google" onClick={handleGoogleSignup}>
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/icon_google.svg" alt="Google" />
                                    <span>Continue with Google</span>
                                </button>
                            </div>

                            <div className="form-footer">
                                <p>Already have an account? <Link to="/login">Log In</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
