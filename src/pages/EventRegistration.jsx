import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import DynamicForm from '../components/common/DynamicForm/DynamicForm';
import Footer from '../components/common/Footer/Footer';
import './EventRegistration.css';

const EventRegistration = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [event, setEvent] = useState(null);
    const [existingResponse, setExistingResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    // Check auth state first
    useEffect(() => {
        // Wait a moment for auth to initialize
        const timer = setTimeout(() => {
            setAuthChecked(true);
            if (!currentUser) {
                navigate(`/login?redirect=/events/${eventId}/register`);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [currentUser, eventId, navigate]);

    // Fetch event data once auth is checked
    useEffect(() => {
        if (authChecked && currentUser) {
            fetchEventAndResponse();
        }
    }, [authChecked, currentUser, eventId]);

    const fetchEventAndResponse = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch event details
            const eventDoc = await getDoc(doc(db, 'events', eventId));
            if (!eventDoc.exists()) {
                setError('Event not found');
                setLoading(false);
                return;
            }

            const eventData = { id: eventDoc.id, ...eventDoc.data() };
            setEvent(eventData);

            // Check if user already registered
            if (currentUser) {
                const q = query(
                    collection(db, 'form_responses'),
                    where('eventId', '==', eventId),
                    where('userId', '==', currentUser.uid)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setExistingResponse({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(`Failed to load registration form: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrationSuccess = () => {
        alert('Registration submitted successfully!');
        navigate(`/events/${eventId}`);
    };

    if (!authChecked || loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading registration form...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="error-container">
                <i className="fas fa-exclamation-circle"></i>
                <h2>{error || 'Event not found'}</h2>
                <Link to="/events" className="btn btn-primary interactive">
                    <i className="fas fa-arrow-left"></i>
                    Back to Events
                </Link>
            </div>
        );
    }

    // Check if registration is closed
    if (!event.isRegistrationOpen) {
        return (
            <div className="registration-page">
                <div className="registration-container">
                    <div className="registration-closed">
                        <i className="fas fa-lock"></i>
                        <h2>Registration Closed</h2>
                        <p>Registration for this event is currently closed.</p>
                        <Link to={`/events/${eventId}`} className="btn btn-glass interactive">
                            <i className="fas fa-arrow-left"></i>
                            Back to Event
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Check if custom form is enabled
    if (!event.registrationFormSchema?.enabled) {
        return (
            <div className="registration-page">
                <div className="registration-container">
                    <div className="no-form">
                        <i className="fas fa-info-circle"></i>
                        <h2>Registration Available</h2>
                        <p>To register for this event, please contact the admin.</p>
                        <div className="action-buttons">
                            <Link to="/contact" className="btn btn-primary interactive">
                                <i className="fas fa-envelope"></i>
                                Contact Admin
                            </Link>
                            <Link to={`/events/${eventId}`} className="btn btn-glass interactive">
                                <i className="fas fa-arrow-left"></i>
                                Back to Event
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // User already registered - show response view
    if (existingResponse) {
        const canEdit = event.allowResponseEdits || false; // Add this field to event schema if needed

        return (
            <div className="registration-page">
                <div className="registration-container">
                    <motion.div
                        className="response-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="response-header">
                            <i className="fas fa-check-circle success-icon"></i>
                            <h2>You're Registered!</h2>
                            <p>You have already submitted your registration for this event.</p>
                        </div>

                        <div className="event-info-card">
                            <h3>{event.title}</h3>
                            <div className="event-meta">
                                <span><i className="fas fa-calendar"></i> {event.date}</span>
                                <span><i className="fas fa-clock"></i> {event.time}</span>
                                <span><i className="fas fa-map-marker-alt"></i> {event.venue}</span>
                            </div>
                        </div>

                        <div className="response-details">
                            <h4>Your Response</h4>
                            <div className="response-fields">
                                {Object.entries(existingResponse.responses || {}).map(([fieldId, field]) => (
                                    <div key={fieldId} className="response-field">
                                        <label>{field.label}</label>
                                        <div className="field-value">
                                            {field.type === 'file' ? (
                                                <a href={field.value} target="_blank" rel="noopener noreferrer" className="file-link">
                                                    <i className="fas fa-file"></i>
                                                    {field.fileName || 'View File'}
                                                </a>
                                            ) : Array.isArray(field.value) ? (
                                                <ul>
                                                    {field.value.map((v, i) => <li key={i}>{v}</li>)}
                                                </ul>
                                            ) : (
                                                <p>{field.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="response-status">
                                <span className={`status-badge status-${existingResponse.status}`}>
                                    {existingResponse.status}
                                </span>
                                <span className="submitted-time">
                                    Submitted: {new Date(existingResponse.submittedAt?.seconds * 1000).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="action-buttons">
                            {canEdit && (
                                <button className="btn btn-primary interactive" disabled>
                                    <i className="fas fa-edit"></i>
                                    Edit Response (Coming Soon)
                                </button>
                            )}
                            <Link to={`/events/${eventId}`} className="btn btn-glass interactive">
                                <i className="fas fa-arrow-left"></i>
                                Back to Event
                            </Link>
                        </div>
                    </motion.div>
                </div>
                <Footer />
            </div>
        );
    }

    // Show registration form
    return (
        <div className="registration-page">
            <div className="registration-container">
                <motion.div
                    className="registration-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link to={`/events/${eventId}`} className="back-link">
                        <i className="fas fa-arrow-left"></i>
                        Back to Event
                    </Link>
                    <h1>Event Registration</h1>
                    <div className="event-info-card">
                        <h2>{event.title}</h2>
                        <div className="event-meta">
                            <span><i className="fas fa-calendar"></i> {event.date}</span>
                            <span><i className="fas fa-clock"></i> {event.time}</span>
                            <span><i className="fas fa-map-marker-alt"></i> {event.venue}</span>
                        </div>
                        {event.registrationFee > 0 && (
                            <div className="registration-fee">
                                <i className="fas fa-rupee-sign"></i>
                                Registration Fee: ₹{event.registrationFee}
                            </div>
                        )}
                    </div>
                </motion.div>

                <DynamicForm
                    schema={event.registrationFormSchema}
                    eventId={event.id}
                    eventTitle={event.title}
                    onSuccess={handleRegistrationSuccess}
                />
            </div>
            <Footer />
        </div>
    );
};

export default EventRegistration;
