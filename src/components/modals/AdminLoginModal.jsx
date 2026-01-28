import { useState } from 'react'
import { X, Lock, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react'

function AdminLoginModal({ isOpen, onClose, onLogin }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await onLogin(password)
            if (result.success) {
                // Success is handled by state change in App.jsx
                onClose(true)
            } else {
                setError(result.error || 'Invalid admin password')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal-content admin-login-modal" style={{ maxWidth: '450px', padding: '2.5rem' }}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--error-600)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <ShieldAlert size={36} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--gray-900)' }}>Owner Authentication</h2>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                        This Admin panel contains sensitive platform data such as user information, job applications, and system statistics.
                        <strong> For security reasons, only the platform owner is allowed to access it.</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter Admin Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '42px', marginBottom: 0 }}
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.875rem',
                            background: 'var(--error-50)',
                            color: 'var(--error-700)',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: '0.875rem',
                            marginBottom: '1.5rem'
                        }}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Loader2 className="animate-spin" size={20} />
                                Authenticating...
                            </div>
                        ) : (
                            'Verify & Access'
                        )}
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-full"
                        style={{ marginTop: '0.75rem' }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div >
    )
}

export default AdminLoginModal
