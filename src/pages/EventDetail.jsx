import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Footer from '../components/common/Footer/Footer';
import DynamicForm from '../components/common/DynamicForm/DynamicForm';
import './EventDetail.css';

const EventDetail = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            const eventDoc = await getDoc(doc(db, 'events', eventId));

            if (eventDoc.exists()) {
                setEvent({ id: eventDoc.id, ...eventDoc.data() });
            } else {
                setError('Event not found');
            }
        } catch (err) {
            console.error('Error fetching event:', err);
            setError('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const getEventStatus = (event) => {
        if (!event?.date) return 'upcoming';
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) return 'completed';
        if (eventDate.toDateString() === today.toDateString()) return 'ongoing';
        return 'upcoming';
    };

    if (loading) {
        return (
            <main className="event-detail-page">
                <div className="loading-container">
                    <div className="loader-spinner"></div>
                    <p>Loading event details...</p>
                </div>
            </main>
        );
    }

    if (error || !event) {
        return (
            <main className="event-detail-page">
                <div className="container">
                    <div className="error-container">
                        <i className="fas fa-exclamation-circle"></i>
                        <h2>{error || 'Event not found'}</h2>
                        <Link to="/events" className="btn btn-primary interactive">
                            <i className="fas fa-arrow-left"></i> Back to Events
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const status = getEventStatus(event);

    return (
        <main className="event-detail-page">
            {/* Hero Section */}
            <section className="event-detail-hero">
                <div className="event-hero-image">
                    <img
                        src={event.imageUrl || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200'}
                        alt={event.title}
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200';
                        }}
                    />
                    <div className="hero-overlay"></div>
                </div>
                <div className="container hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link to="/events" className="back-link interactive">
                            <i className="fas fa-arrow-left"></i> Back to Events
                        </Link>
                        <div className="event-badges">
                            <span className="event-category">{event.category || 'Event'}</span>
                            <span className={`event-status-badge ${status}`}>{status}</span>
                            {event.isFeatured && (
                                <span className="featured-badge">
                                    <i className="fas fa-star"></i> Featured
                                </span>
                            )}
                        </div>
                        <h1 className="event-detail-title gradient-text">{event.title}</h1>
                    </motion.div>
                </div>
            </section>

            {/* Event Details Section */}
            <section className="event-details-section">
                <div className="container">
                    <div className="event-details-grid">
                        {/* Main Content */}
                        <motion.div
                            className="event-main-content glass-card"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2>About This Event</h2>
                            <p className="event-full-description">{event.description}</p>
                        </motion.div>

                        {/* Sidebar */}
                        <motion.div
                            className="event-sidebar"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {/* Event Info Card */}
                            <div className="event-info-card glass-card">
                                <h3>Event Information</h3>
                                <div className="info-item">
                                    <i className="far fa-calendar"></i>
                                    <div>
                                        <span className="info-label">Date</span>
                                        <span className="info-value">
                                            {new Date(event.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {event.time && (
                                    <div className="info-item">
                                        <i className="far fa-clock"></i>
                                        <div>
                                            <span className="info-label">Time</span>
                                            <span className="info-value">{event.time}</span>
                                        </div>
                                    </div>
                                )}

                                {event.venue && (
                                    <div className="info-item">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <div>
                                            <span className="info-label">Venue</span>
                                            <span className="info-value">{event.venue}</span>
                                        </div>
                                    </div>
                                )}

                                {event.maxParticipants && (
                                    <div className="info-item">
                                        <i className="fas fa-users"></i>
                                        <div>
                                            <span className="info-label">Max Participants</span>
                                            <span className="info-value">{event.maxParticipants}</span>
                                        </div>
                                    </div>
                                )}

                                {event.registrationFee !== undefined && (
                                    <div className="info-item">
                                        <i className="fas fa-rupee-sign"></i>
                                        <div>
                                            <span className="info-label">Registration Fee</span>
                                            <span className="info-value">
                                                {event.registrationFee === 0 ? 'Free' : `₹${event.registrationFee}`}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Registration Card */}
                            {event.isRegistrationOpen && status !== 'completed' && (
                                <div className="registration-card glass-card">
                                    <h3>Registration</h3>
                                    <p>Registration is currently open for this event.</p>
                                    <button className="btn btn-primary interactive btn-block">
                                        <i className="fas fa-user-plus"></i> Register Now
                                    </button>
                                    <p className="registration-note">
                                        <i className="fas fa-info-circle"></i>
                                        Contact admin for registration details
                                    </p>
                                </div>
                            )}

                            {!event.isRegistrationOpen && (
                                <div className="registration-card glass-card">
                                    <h3>Registration Closed</h3>
                                    <p>Registration for this event is currently closed.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Registration Form */}
                    {event.registrationFormSchema?.enabled && (
                        <div className="event-registration-section">
                            <DynamicForm
                                schema={event.registrationFormSchema}
                                eventId={event.id}
                                eventTitle={event.title}
                                onSuccess={() => alert('Thank you for registering!')}
                            />
                        </div>
                    )}

                    {!event.registrationFormSchema?.enabled && event.isRegistrationOpen && (
                        <div className="event-registration-section">
                            <div className="contact-admin-card">
                                <i className="fas fa-info-circle"></i>
                                <h3>Registration Available</h3>
                                <p>To register for this event, please contact the admin.</p>
                                <Link to="/contact" className="btn btn-primary interactive">
                                    <i className="fas fa-envelope"></i>
                                    Contact Admin
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default EventDetail;
