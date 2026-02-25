import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isElevated, getRoleLabel } from '../utils/roles';
import './Dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { currentUser, userRole, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!currentUser) return null;

    const sidebarItems = [
        { id: 'profile', icon: 'fa-user', label: 'Profile' },
        { id: 'events', icon: 'fa-calendar-alt', label: 'Events' },
        { id: 'activities', icon: 'fa-chart-line', label: 'Activities' },
        { id: 'news', icon: 'fa-newspaper', label: 'News' },
        { id: 'certificates', icon: 'fa-certificate', label: 'Certificates' },
        { id: 'settings', icon: 'fa-cog', label: 'Settings' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileTab currentUser={currentUser} userRole={userRole} />;
            case 'events':
                return <EventsTab />;
            case 'activities':
                return <ActivitiesTab />;
            case 'news':
                return <NewsTab />;
            case 'certificates':
                return <CertificatesTab />;
            case 'settings':
                return <SettingsTab currentUser={currentUser} />;
            default:
                return <ProfileTab currentUser={currentUser} userRole={userRole} />;
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Mobile Sidebar Toggle */}
            <button
                className="sidebar-toggle interactive"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
                <span>Menu</span>
            </button>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Left Sidebar - Clean and minimal */}
            <aside className={`dashboard-sidebar glass-card ${isSidebarOpen ? 'open' : ''}`}>
                <nav className="sidebar-nav">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-item interactive ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Control Panel Button - Only for elevated roles */}
                {isElevated(userRole) && (
                    <button
                        className="sidebar-admin-btn interactive"
                        onClick={() => navigate('/admin')}
                    >
                        <i className="fas fa-user-shield"></i>
                        <span>Admin Panel</span>
                    </button>
                )}

                <button className="sidebar-logout interactive" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="dashboard-content"
                >
                    {renderContent()}
                </motion.div>
            </main>
        </div>
    );
};

// Profile Tab Component - Shows all user details
const ProfileTab = ({ currentUser, userRole }) => {
    const stats = [
        { label: 'Events Registered', value: '5', icon: 'fa-calendar-check', color: '#6366f1' },
        { label: 'Projects', value: '3', icon: 'fa-project-diagram', color: '#8b5cf6' },
        { label: 'Workshops', value: '8', icon: 'fa-graduation-cap', color: '#ec4899' },
        { label: 'Points', value: '250', icon: 'fa-star', color: '#f59e0b' }
    ];

    return (
        <div className="profile-tab">
            {/* Profile Header with Avatar */}
            <div className="profile-header glass-card">
                <div className="profile-avatar">
                    {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="Profile" />
                    ) : (
                        <div className="avatar-placeholder">
                            <i className="fas fa-user"></i>
                        </div>
                    )}
                </div>
                <div className="profile-info">
                    <h1 className="profile-name gradient-text">{currentUser.displayName || 'User'}</h1>
                    <p className="profile-email">{currentUser.email}</p>
                    {userRole && <span className="user-badge">{userRole.toUpperCase()}</span>}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="stat-card glass-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="stat-icon" style={{ color: stat.color }}>
                            <i className={`fas ${stat.icon}`}></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-value gradient-text">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Personal Information */}
            <div className="profile-details glass-card">
                <h2>Personal Information</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Full Name</label>
                        <p>{currentUser.displayName || 'Not set'}</p>
                    </div>
                    <div className="info-item">
                        <label>Email</label>
                        <p>{currentUser.email}</p>
                    </div>
                    <div className="info-item">
                        <label>Role</label>
                        <p>{userRole || 'User'}</p>
                    </div>
                    <div className="info-item">
                        <label>Member Since</label>
                        <p>{new Date(currentUser.metadata.creationTime).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Events Tab Component
const EventsTab = () => {
    const { currentUser } = useAuth();
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserRegistrations();
    }, [currentUser]);

    const fetchUserRegistrations = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            // Import the function dynamically
            const { getUserEventRegistrations } = await import('../services/formService');
            const result = await getUserEventRegistrations(currentUser.uid);

            if (result.success) {
                setRegisteredEvents(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewResponse = (event) => {
        setSelectedResponse(event);
        setShowResponseModal(true);
    };

    const getEventStatus = (eventDate) => {
        const today = new Date();
        const eventDateObj = new Date(eventDate);
        return eventDateObj >= today ? 'Upcoming' : 'Completed';
    };

    if (loading) {
        return (
            <div className="events-tab">
                <h1 className="tab-title gradient-text">My Events</h1>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
                    <p>Loading your registrations...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="events-tab">
                <h1 className="tab-title gradient-text">My Events</h1>

                {registeredEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <i className="fas fa-calendar-times" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                        <p style={{ marginTop: '1rem', opacity: 0.7 }}>You haven't registered for any events yet.</p>
                        <button
                            className="btn btn-primary interactive"
                            style={{ marginTop: '1rem' }}
                            onClick={() => navigate('/events')}
                        >
                            <i className="fas fa-search"></i> Browse Events
                        </button>
                    </div>
                ) : (
                    <div className="events-list">
                        {registeredEvents.map((event, index) => (
                            <motion.div
                                key={index}
                                className="event-card glass-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="event-header">
                                    <h3>{event.eventTitle}</h3>
                                    <span className={`event-badge ${getEventStatus(event.eventDate).toLowerCase()}`}>
                                        {getEventStatus(event.eventDate)}
                                    </span>
                                </div>
                                <div className="event-details">
                                    <span><i className="far fa-calendar"></i> {event.eventDate}</span>
                                    <span><i className="fas fa-clock"></i> {event.eventTime}</span>
                                    <span><i className="fas fa-map-marker-alt"></i> {event.eventVenue}</span>
                                    <span><i className="fas fa-tag"></i> {event.eventCategory}</span>
                                </div>
                                <div className="event-status">
                                    <span className={`status-badge status-${event.status}`}>
                                        {event.status}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                        Registered: {(() => {
                                            const ts = event.submittedAt;
                                            if (!ts) return '';
                                            const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
                                            return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
                                        })()}
                                    </span>
                                </div>
                                <div className="event-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-primary btn-sm interactive"
                                        onClick={() => handleViewResponse(event)}
                                    >
                                        <i className="fas fa-eye"></i> View Response
                                    </button>
                                    <button
                                        className="btn btn-glass btn-sm interactive"
                                        onClick={() => navigate(`/events/${event.eventId}`)}
                                    >
                                        <i className="fas fa-info-circle"></i> Event Details
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Response Modal */}
            {showResponseModal && selectedResponse && (
                <div className="modal-overlay" onClick={() => setShowResponseModal(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Your Response</h2>
                            <button className="modal-close" onClick={() => setShowResponseModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>{selectedResponse.eventTitle}</h3>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem', opacity: 0.8 }}>
                                    <span><i className="far fa-calendar"></i> {selectedResponse.eventDate}</span>
                                    <span><i className="fas fa-clock"></i> {selectedResponse.eventTime}</span>
                                </div>
                            </div>

                            <div className="response-fields" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {Object.entries(selectedResponse.responses || {}).map(([fieldId, field]) => (
                                    <div key={fieldId} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', opacity: 0.9 }}>
                                            {field.label}
                                        </label>
                                        <div>
                                            {field.type === 'file' ? (
                                                <a href={field.value} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-glass interactive">
                                                    <i className="fas fa-file"></i> {field.fileName || 'View File'}
                                                </a>
                                            ) : Array.isArray(field.value) ? (
                                                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                                    {field.value.map((v, i) => <li key={i}>{v}</li>)}
                                                </ul>
                                            ) : (
                                                <p style={{ margin: 0 }}>{field.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className={`status-badge status-${selectedResponse.status}`}>
                                        {selectedResponse.status}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                        Submitted: {(() => {
                                            const ts = selectedResponse.submittedAt;
                                            if (!ts) return 'processing...';
                                            const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
                                            return isNaN(d.getTime()) ? 'Recently' : d.toLocaleString();
                                        })()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-glass interactive" onClick={() => setShowResponseModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Activities Tab Component
const ActivitiesTab = () => {
    const activities = [
        { action: 'Registered for RoboWars 2024', time: '2 days ago', icon: 'fa-calendar-plus' },
        { action: 'Completed AI Workshop', time: '1 week ago', icon: 'fa-check-circle' },
        { action: 'Uploaded project documentation', time: '2 weeks ago', icon: 'fa-upload' },
        { action: 'Joined AUTOROB community', time: '1 month ago', icon: 'fa-users' }
    ];

    return (
        <div className="activities-tab">
            <h1 className="tab-title gradient-text">Recent Activities</h1>

            <div className="activity-timeline">
                {activities.map((activity, index) => (
                    <motion.div
                        key={index}
                        className="activity-item glass-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="activity-icon">
                            <i className={`fas ${activity.icon}`}></i>
                        </div>
                        <div className="activity-content">
                            <p>{activity.action}</p>
                            <span className="activity-time">{activity.time}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// News Tab Component
const NewsTab = () => {
    const news = [
        {
            title: 'New Workshop Series Announced',
            excerpt: 'Join our upcoming AI and ML workshop series starting next month...',
            date: '2024-02-10',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'
        },
        {
            title: 'RoboWars 2024 Registration Open',
            excerpt: 'Get ready for the biggest robotics competition of the year...',
            date: '2024-02-05',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400'
        }
    ];

    return (
        <div className="news-tab">
            <h1 className="tab-title gradient-text">Latest News</h1>

            <div className="news-grid">
                {news.map((item, index) => (
                    <motion.div
                        key={index}
                        className="news-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="news-image">
                            <img src={item.image} alt={item.title} />
                        </div>
                        <div className="news-content">
                            <h3>{item.title}</h3>
                            <p>{item.excerpt}</p>
                            <span className="news-date">
                                <i className="far fa-calendar"></i> {new Date(item.date).toLocaleDateString()}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// Certificates Tab Component
const CertificatesTab = () => {
    const certificates = [
        { title: 'AI Workshop Completion', issueDate: '2024-02-10', id: 'CERT-001' },
        { title: 'Line Following Robot Competition', issueDate: '2024-01-15', id: 'CERT-002' },
        { title: 'IoT Automation Seminar', issueDate: '2023-12-20', id: 'CERT-003' }
    ];

    return (
        <div className="certificates-tab">
            <h1 className="tab-title gradient-text">My Certificates</h1>

            <div className="certificates-grid">
                {certificates.map((cert, index) => (
                    <motion.div
                        key={index}
                        className="certificate-card glass-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="certificate-icon">
                            <i className="fas fa-award"></i>
                        </div>
                        <h3>{cert.title}</h3>
                        <p className="cert-id">ID: {cert.id}</p>
                        <p className="cert-date">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                        <button className="btn btn-primary btn-sm">
                            <i className="fas fa-download"></i> Download
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// Settings Tab Component
const SettingsTab = ({ currentUser }) => {
    const [nameValue, setNameValue] = React.useState(currentUser?.displayName || '');
    const [saving, setSaving] = React.useState(false);
    const [saveMsg, setSaveMsg] = React.useState(null);

    const handleSave = async () => {
        if (!nameValue.trim()) {
            setSaveMsg({ type: 'error', text: 'Display name cannot be empty.' });
            return;
        }
        setSaving(true);
        setSaveMsg(null);
        try {
            const { updateProfile } = await import('firebase/auth');
            const { auth } = await import('../services/firebase');
            await updateProfile(auth.currentUser, { displayName: nameValue.trim() });
            setSaveMsg({ type: 'success', text: 'Changes saved successfully!' });
        } catch (err) {
            setSaveMsg({ type: 'error', text: 'Failed to save changes. Please try again.' });
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(null), 3000);
        }
    };

    return (
        <div className="settings-tab">
            <h1 className="tab-title gradient-text">Settings</h1>

            <div className="settings-section glass-card">
                <h2>Account Settings</h2>
                <div className="settings-form">
                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={currentUser.email} disabled />
                    </div>
                    {saveMsg && (
                        <div style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            marginBottom: '0.75rem',
                            fontSize: '0.875rem',
                            background: saveMsg.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: saveMsg.type === 'success' ? '#4ade80' : '#f87171',
                            border: `1px solid ${saveMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                        }}>
                            {saveMsg.text}
                        </div>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="settings-section glass-card">
                <h2>Notifications</h2>
                <div className="settings-options">
                    <label className="setting-option">
                        <input type="checkbox" defaultChecked />
                        <span>Email notifications for events</span>
                    </label>
                    <label className="setting-option">
                        <input type="checkbox" defaultChecked />
                        <span>Newsletter updates</span>
                    </label>
                    <label className="setting-option">
                        <input type="checkbox" />
                        <span>SMS notifications</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
