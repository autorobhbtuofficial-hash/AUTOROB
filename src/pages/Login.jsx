import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

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
    const { login, signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin && formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await signup(formData.email, formData.password, formData.displayName);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Authentication failed');
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
            setError(err.message || 'Google sign-in failed');
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
                                minLength="6"
                            />
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
                                    minLength="6"
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
