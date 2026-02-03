import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Footer from '../components/common/Footer/Footer';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await addDoc(collection(db, 'contacts'), {
                ...formData,
                timestamp: new Date(),
                status: 'unread'
            });
            setSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            console.error('Error submitting form:', err);
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="contact-page">
            <section className="contact-hero">
                <div className="container">
                    <motion.h1
                        className="page-title gradient-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Get In Touch
                    </motion.h1>
                    <motion.p
                        className="page-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Have questions? We'd love to hear from you
                    </motion.p>
                </div>
            </section>

            <section className="contact-section">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Info */}
                        <motion.div
                            className="contact-info"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="gradient-text">Contact Information</h2>
                            <p className="contact-description">
                                Reach out to us for collaborations, queries, or just to say hello!
                            </p>

                            <div className="contact-details">
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div>
                                        <h4>Email</h4>
                                        <a href="mailto:contact@autorob.com">contact@autorob.com</a>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <i className="fas fa-phone"></i>
                                    </div>
                                    <div>
                                        <h4>Phone</h4>
                                        <a href="tel:+919876543210">+91 98765 43210</a>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <i className="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div>
                                        <h4>Address</h4>
                                        <p>HBTU Campus, Kanpur<br />Uttar Pradesh, India - 208002</p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div>
                                        <h4>Working Hours</h4>
                                        <p>Mon - Fri: 9:00 AM - 6:00 PM<br />Sat: 10:00 AM - 4:00 PM</p>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-socials">
                                <h4>Follow Us</h4>
                                <div className="social-links">
                                    <a href="#" className="social-link interactive"><i className="fab fa-instagram"></i></a>
                                    <a href="#" className="social-link interactive"><i className="fab fa-linkedin"></i></a>
                                    <a href="#" className="social-link interactive"><i className="fab fa-youtube"></i></a>
                                    <a href="#" className="social-link interactive"><i className="fab fa-twitter"></i></a>
                                    <a href="#" className="social-link interactive"><i className="fab fa-github"></i></a>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            className="contact-form-wrapper glass-card"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Your name"
                                    />
                                </div>

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
                                    <label htmlFor="subject">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="What is this about?"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        placeholder="Your message..."
                                    ></textarea>
                                </div>

                                {error && <div className="form-error">{error}</div>}
                                {success && <div className="form-success">Message sent successfully!</div>}

                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default Contact;
