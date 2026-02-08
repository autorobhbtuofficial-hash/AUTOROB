import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllEvents } from '../services/adminService';
import Footer from '../components/common/Footer/Footer';
import './Events.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const result = await getAllEvents();
            if (result.success) {
                setEvents(result.data);
            } else {
                console.error('Error fetching events:', result.error);
                setEvents([]);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    // Determine event status based on date and registration
    const getEventStatus = (event) => {
        if (!event?.date) return 'upcoming';
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
            return 'completed';
        } else if (eventDate.toDateString() === today.toDateString()) {
            return 'ongoing';
        } else if (event.isRegistrationOpen) {
            return 'upcoming';
        } else {
            return 'closed';
        }
    };

    // Filter events by category
    const categoryFilteredEvents = filter === 'all'
        ? events
        : events.filter(event => event.category?.toLowerCase() === filter.toLowerCase());

    // Sort events by date proximity to current date (closest upcoming events first)
    const filteredEvents = [...categoryFilteredEvents].sort((a, b) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        // Calculate absolute difference from today
        const diffA = Math.abs(dateA - today);
        const diffB = Math.abs(dateB - today);

        // Prioritize upcoming events over past events
        const isUpcomingA = dateA >= today;
        const isUpcomingB = dateB >= today;

        if (isUpcomingA && !isUpcomingB) return -1; // A is upcoming, B is past
        if (!isUpcomingA && isUpcomingB) return 1;  // B is upcoming, A is past

        // Both upcoming or both past: sort by proximity to today
        return diffA - diffB;
    });

    return (
        <main className="events-page">
            <section className="events-hero">
                <div className="container">
                    <motion.h1
                        className="page-title gradient-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Events & Workshops
                    </motion.h1>
                    <motion.p
                        className="page-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Join us in exciting robotics competitions, workshops, and seminars
                    </motion.p>
                </div>
            </section>

            <section className="events-section">
                <div className="container">
                    {/* Filter Buttons */}
                    <motion.div
                        className="events-filters"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {['all', ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))].map((type) => (
                            <button
                                key={type}
                                className={`filter-btn interactive ${filter === type.toLowerCase() ? 'active' : ''}`}
                                onClick={() => setFilter(type.toLowerCase())}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </motion.div>

                    {/* Events Grid */}
                    {loading ? (
                        <div className="loading-container">
                            <div className="loader-spinner"></div>
                            <p>Loading events...</p>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="no-events">
                            <i className="fas fa-calendar-times" style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }}></i>
                            <p>No events found. Add events from the admin panel!</p>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {filteredEvents.map((event, index) => {
                                const status = getEventStatus(event);
                                return (
                                    <motion.div
                                        key={event.id}
                                        className="event-card glass-card interactive"
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ y: -10 }}
                                    >
                                        <div className="event-image">
                                            <img
                                                src={event.imageUrl || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'}
                                                alt={event.title}
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800';
                                                }}
                                            />
                                            <div className={`event-status ${status}`}>
                                                {status}
                                            </div>
                                            {event.isFeatured && (
                                                <div className="event-featured">
                                                    <i className="fas fa-star"></i> Featured
                                                </div>
                                            )}
                                        </div>
                                        <div className="event-content">
                                            <div className="event-type">{event.category || 'Event'}</div>
                                            <h3 className="event-title">{event.title}</h3>
                                            <p className="event-description event-description-truncated">
                                                {event.description && event.description.length > 150
                                                    ? `${event.description.substring(0, 150)}...`
                                                    : event.description}
                                            </p>
                                            <div className="event-meta">
                                                <div className="event-date">
                                                    <i className="far fa-calendar"></i>
                                                    {new Date(event.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                {event.time && (
                                                    <div className="event-time">
                                                        <i className="far fa-clock"></i>
                                                        {event.time}
                                                    </div>
                                                )}
                                                {event.venue && (
                                                    <div className="event-venue">
                                                        <i className="fas fa-map-marker-alt"></i>
                                                        {event.venue}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="event-footer">
                                                {event.registrationFee && (
                                                    <div className="event-fee">
                                                        Fee: ₹{event.registrationFee}
                                                    </div>
                                                )}
                                                <button
                                                    className="btn btn-primary interactive"
                                                    onClick={() => window.location.href = `/events/${event.id}`}
                                                >
                                                    See More <i className="fas fa-arrow-right"></i>
                                                </button>
                                                {status === 'closed' && (
                                                    <button className="btn btn-glass btn-sm" disabled>
                                                        Registration Closed
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default Events;
