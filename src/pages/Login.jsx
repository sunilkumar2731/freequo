import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    AlertCircle,
    ArrowRight,
    User,
    Shield,
    Briefcase
} from 'lucide-react';

import './Auth.css';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loginWithGoogle, isAuthenticated, user, adminLogout } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [focusedField, setFocusedField] = useState(null);


    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const from = location.state?.from?.pathname || `/${user.role}/dashboard`;
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, user, navigate, location]);

    useEffect(() => {
        setIsVisible(true);
        // Page title
        document.title = 'Login | Freequo';
    }, []);



    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            if (!result.success) {
                setError(result.error || 'Invalid credentials');
                setLoading(false);
            }
            // Success handler is in useEffect (redirects on auth state change)
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    const handleDemoLogin = async (role) => {
        if (role === 'admin') {
            // Force a fresh password prompt when clicking Admin from Login page
            adminLogout();
            navigate('/admin');
            return;
        }

        setLoading(true);
        setError('');

        let demoEmail = '';
        let demoPassword = 'demo123';

        if (role === 'client') {
            demoEmail = 'john@company.com';
        } else if (role === 'freelancer') {
            demoEmail = 'sarah@gmail.com';
        }

        try {
            const result = await login(demoEmail, demoPassword);
            if (!result.success) {
                setError(result.error);
                setLoading(false);
            }
        } catch (err) {
            setError('Demo login failed');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            const result = await loginWithGoogle();
            if (!result.success) {
                setError(result.error);
            }
        } catch (err) {
            setError('Google login failed');
        }
    };



    return (
        <div className="auth-cinematic">
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
                            <button className="mode-btn active">Login</button>
                            <Link to="/signup" className="mode-btn">Sign Up</Link>
                            <div className="mode-slider"></div>
                        </div>

                        <div className="form-content">
                            <div className="form-header">
                                <div className="header-icon">
                                    <LogIn size={32} />
                                </div>
                                <h1>Welcome Back</h1>
                                <p>Log in to your account to continue</p>
                            </div>

                            {error && (
                                <div className="error-alert">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form className="auth-form" onSubmit={handleSubmit}>
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
                                                <span>Log In</span>
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
                                <button type="button" className="social-btn google" onClick={handleGoogleLogin}>
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/icon_google.svg" alt="Google" />
                                    <span>Continue with Google</span>
                                </button>
                            </div>

                            <div className="demo-section">
                                <div className="demo-label">Login with Demo Account</div>
                                <div className="demo-buttons">
                                    <button className="demo-btn" onClick={() => handleDemoLogin('client')}>
                                        <div className="demo-badge client">C</div>
                                        <span>Client</span>
                                    </button>
                                    <button className="demo-btn" onClick={() => handleDemoLogin('freelancer')}>
                                        <div className="demo-badge freelancer">F</div>
                                        <span>Freelancer</span>
                                    </button>
                                    <button className="demo-btn" onClick={() => handleDemoLogin('admin')}>
                                        <div className="demo-badge admin">A</div>
                                        <span>Admin</span>
                                    </button>
                                </div>
                            </div>

                            <div className="form-footer">
                                <p>Don't have an account? <Link to="/signup">Create One</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
