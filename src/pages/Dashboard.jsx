import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');
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
            {/* Left Sidebar - Clean and minimal */}
            <aside className="dashboard-sidebar glass-card">
                <nav className="sidebar-nav">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-item interactive ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Admin Panel Button - Only for admin/subadmin */}
                {(userRole === 'admin' || userRole === 'subadmin') && (
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
    const registeredEvents = [
        { title: 'RoboWars 2024', date: '2024-03-15', status: 'Upcoming', category: 'Competition' },
        { title: 'AI Workshop', date: '2024-02-20', status: 'Upcoming', category: 'Workshop' },
        { title: 'Line Following Robot', date: '2024-01-10', status: 'Completed', category: 'Competition' }
    ];

    return (
        <div className="events-tab">
            <h1 className="tab-title gradient-text">My Events</h1>

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
                            <h3>{event.title}</h3>
                            <span className={`event-badge ${event.status.toLowerCase()}`}>
                                {event.status}
                            </span>
                        </div>
                        <div className="event-details">
                            <span><i className="far fa-calendar"></i> {new Date(event.date).toLocaleDateString()}</span>
                            <span><i className="fas fa-tag"></i> {event.category}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
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
    return (
        <div className="settings-tab">
            <h1 className="tab-title gradient-text">Settings</h1>

            <div className="settings-section glass-card">
                <h2>Account Settings</h2>
                <div className="settings-form">
                    <div className="form-group">
                        <label>Display Name</label>
                        <input type="text" defaultValue={currentUser.displayName || ''} placeholder="Your name" />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={currentUser.email} disabled />
                    </div>
                    <button className="btn btn-primary">Save Changes</button>
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
