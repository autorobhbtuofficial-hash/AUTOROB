import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
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
            const q = query(collection(db, 'events'), orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            const eventsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsData);
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents(demoEventsData);
        } finally {
            setLoading(false);
        }
    };

    const demoEventsData = [
        {
            id: '1',
            title: 'RoboWars 2024',
            description: 'Annual robotics combat competition featuring the best fighting robots from colleges across India.',
            date: '2024-03-15',
            type: 'competition',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
            status: 'upcoming',
            registrationLink: '/register'
        },
        {
            id: '2',
            title: 'AI & ML Workshop',
            description: 'Hands-on workshop on Artificial Intelligence and Machine Learning applications in robotics.',
            date: '2024-02-20',
            type: 'workshop',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
            status: 'upcoming',
            registrationLink: '/register'
        },
        {
            id: '3',
            title: 'Line Following Robot Competition',
            description: 'Build and program autonomous line-following robots to navigate complex tracks.',
            date: '2024-01-10',
            type: 'competition',
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
            status: 'completed'
        },
        {
            id: '4',
            title: 'IoT in Automation Seminar',
            description: 'Expert talk on Internet of Things and its applications in industrial automation.',
            date: '2023-12-05',
            type: 'seminar',
            image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800',
            status: 'completed'
        },
        {
            id: '5',
            title: 'Drone Building Workshop',
            description: 'Learn to build and program your own quadcopter drone from scratch.',
            date: '2024-04-10',
            type: 'workshop',
            image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
            status: 'upcoming',
            registrationLink: '/register'
        },
        {
            id: '6',
            title: 'Tech Fest 2024',
            description: 'Annual technical festival showcasing innovative projects and competitions.',
            date: '2024-05-01',
            type: 'festival',
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            status: 'upcoming',
            registrationLink: '/register'
        }
    ];

    const filteredEvents = filter === 'all'
        ? events
        : events.filter(event => event.type === filter);

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
                        {['all', 'competition', 'workshop', 'seminar', 'festival'].map((type) => (
                            <button
                                key={type}
                                className={`filter-btn interactive ${filter === type ? 'active' : ''}`}
                                onClick={() => setFilter(type)}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </motion.div>

                    {/* Events Grid */}
                    <div className="events-grid">
                        {filteredEvents.map((event, index) => (
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
                                    <img src={event.image} alt={event.title} />
                                    <div className={`event-status ${event.status}`}>
                                        {event.status}
                                    </div>
                                </div>
                                <div className="event-content">
                                    <div className="event-type">{event.type}</div>
                                    <h3 className="event-title">{event.title}</h3>
                                    <p className="event-description">{event.description}</p>
                                    <div className="event-footer">
                                        <div className="event-date">
                                            <i className="far fa-calendar"></i>
                                            {new Date(event.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        {event.status === 'upcoming' && event.registrationLink && (
                                            <a href={event.registrationLink} className="btn btn-primary btn-sm">
                                                Register Now
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filteredEvents.length === 0 && !loading && (
                        <div className="no-events">
                            <p>No events found for this category.</p>
                        </div>
                    )}
                </div>
            </section>

            {loading && (
                <div className="loading-container">
                    <div className="loader-spinner"></div>
                </div>
            )}

            <Footer />
        </main>
    );
};

export default Events;
