import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

import { getAuthErrorMessage } from '../utils/authErrors';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(null);
    const [lockoutSeconds, setLockoutSeconds] = useState(0);
    const { login, signup, loginWithGoogle, bannedError } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Lockout countdown timer
    React.useEffect(() => {
        if (!lockoutUntil) return;
        const interval = setInterval(() => {
            const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
            if (remaining <= 0) {
                setLockoutUntil(null);
                setLockoutSeconds(0);
                setFailedAttempts(0);
                clearInterval(interval);
            } else {
                setLockoutSeconds(remaining);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [lockoutUntil]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Brute force lockout check
        if (lockoutUntil && Date.now() < lockoutUntil) {
            setError(`Too many failed attempts. Try again in ${lockoutSeconds}s.`);
            return;
        }

        if (!isLogin && formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        // Password strength for signup
        if (!isLogin) {
            const pwd = formData.password;
            if (pwd.length < 8) return setError('Password must be at least 8 characters.');
            if (!/[A-Z]/.test(pwd)) return setError('Password must contain at least one uppercase letter.');
            if (!/[0-9]/.test(pwd)) return setError('Password must contain at least one number.');
            if (!/[^A-Za-z0-9]/.test(pwd)) return setError('Password must contain at least one special character.');
        }

        setLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                setFailedAttempts(0); // reset on success
            } else {
                await signup(formData.email, formData.password, formData.displayName);
            }
            navigate('/dashboard');
        } catch (err) {
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);
            // Lock out after 5 failed login attempts for 30 seconds
            if (isLogin && newAttempts >= 5) {
                const until = Date.now() + 30000;
                setLockoutUntil(until);
                setLockoutSeconds(30);
                setError('Too many failed attempts. You are locked out for 30 seconds.');
            } else {
                setError(getAuthErrorMessage(err));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <div className="login-container">
                <motion.div
                    className="login-card glass-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="login-header">
                        <h1 className="gradient-text">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                        <p>{isLogin ? 'Sign in to your account' : 'Join the AUTOROB community'}</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {bannedError && (
                            <div className="form-error" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px' }}>
                                <i className="fas fa-ban" style={{ marginRight: '0.5rem' }}></i>
                                {bannedError}
                            </div>
                        )}
                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="displayName">Full Name</label>
                                <input
                                    type="text"
                                    id="displayName"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    required={!isLogin}
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                minLength="8"
                            />
                            {!isLogin && (
                                <small style={{ color: 'var(--text-muted, #9ca3af)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                                    Min 8 chars, 1 uppercase, 1 number, 1 special character
                                </small>
                            )}
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required={!isLogin}
                                    placeholder="••••••••"
                                    minLength="8"
                                />
                            </div>
                        )}

                        {error && <div className="form-error">{error}</div>}

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <button className="btn btn-google interactive" onClick={handleGoogleLogin} disabled={loading}>
                        <i className="fab fa-google"></i>
                        Continue with Google
                    </button>

                    <div className="login-footer">
                        <p>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
};

export default Login;
