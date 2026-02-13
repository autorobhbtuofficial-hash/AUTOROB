import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAnalytics } from '../services/adminService';
import EventManagement from '../components/admin/EventManagement/EventManagement';
import UserManagement from '../components/admin/UserManagement/UserManagement';
import TeamManagement from '../components/admin/TeamManagement/TeamManagement';
import GalleryManagement from '../components/admin/GalleryManagement/GalleryManagement';
import NewsManagement from '../components/admin/NewsManagement/NewsManagement';
import FormResponsesManagement from '../components/admin/FormResponsesManagement/FormResponsesManagement';
import './AdminPanel.css';

const AdminPanel = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentUser, userRole, logout } = useAuth();
    const navigate = useNavigate();

    // Refs for management components
    const eventManagementRef = useRef(null);
    const teamManagementRef = useRef(null);
    const galleryManagementRef = useRef(null);
    const newsManagementRef = useRef(null);
    const formResponsesManagementRef = useRef(null);

    useEffect(() => {
        // Check if user is admin or subadmin
        if (!currentUser || (userRole !== 'admin' && userRole !== 'subadmin')) {
            navigate('/dashboard');
            return;
        }

        // Fetch analytics data
        fetchAnalytics();
    }, [currentUser, userRole, navigate]);

    const fetchAnalytics = async () => {
        setLoading(true);
        const result = await getAnalytics();
        if (result.success) {
            setAnalytics(result.data);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        { id: 'overview', icon: 'fa-chart-line', label: 'Overview', roles: ['admin', 'subadmin'] },
        { id: 'events', icon: 'fa-calendar-alt', label: 'Events', roles: ['admin', 'subadmin'] },
        { id: 'users', icon: 'fa-users', label: 'Users', roles: ['admin'] },
        { id: 'team', icon: 'fa-user-friends', label: 'Team', roles: ['admin', 'subadmin'] },
        { id: 'gallery', icon: 'fa-images', label: 'Gallery', roles: ['admin', 'subadmin'] },
        { id: 'news', icon: 'fa-newspaper', label: 'News', roles: ['admin', 'subadmin'] },
        { id: 'responses', icon: 'fa-clipboard-list', label: 'Form Responses', roles: ['admin', 'subadmin'] },
    ];

    const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

    // Quick Actions handlers
    const handleQuickAction = (action) => {
        switch (action) {
            case 'createEvent':
                setActiveSection('events');
                setTimeout(() => eventManagementRef.current?.triggerCreate(), 100);
                break;
            case 'addTeamMember':
                setActiveSection('team');
                setTimeout(() => teamManagementRef.current?.triggerCreate(), 100);
                break;
            case 'uploadImages':
                setActiveSection('gallery');
                setTimeout(() => galleryManagementRef.current?.triggerCreate(), 100);
                break;
            case 'postNews':
                setActiveSection('news');
                setTimeout(() => newsManagementRef.current?.triggerCreate(), 100);
                break;
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <OverviewSection analytics={analytics} loading={loading} onQuickAction={handleQuickAction} />;
            case 'events':
                return <EventManagement ref={eventManagementRef} userRole={userRole} />;
            case 'users':
                return <UserManagement />;
            case 'team':
                return <TeamManagement ref={teamManagementRef} userRole={userRole} />;
            case 'gallery':
                return <GalleryManagement ref={galleryManagementRef} userRole={userRole} />;
            case 'news':
                return <NewsManagement ref={newsManagementRef} userRole={userRole} />;
            case 'responses':
                return <FormResponsesManagement ref={formResponsesManagementRef} userRole={userRole} />;
            default:
                return <OverviewSection analytics={analytics} loading={loading} onQuickAction={handleQuickAction} />;
        }
    };

    if (!currentUser || (userRole !== 'admin' && userRole !== 'subadmin')) {
        return null;
    }

    return (
        <div className="admin-panel-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar glass-card">
                <div className="admin-header">
                    <h2 className="gradient-text">Admin Panel</h2>
                    <span className="role-badge">{userRole.toUpperCase()}</span>
                </div>

                <nav className="admin-nav">
                    {filteredMenuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`admin-nav-item interactive ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="admin-footer">
                    <button className="btn btn-glass btn-sm interactive" onClick={() => navigate('/dashboard')}>
                        <i className="fas fa-arrow-left"></i>
                        Back to Dashboard
                    </button>
                    <button className="btn btn-glass btn-sm interactive" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="admin-content"
                >
                    {renderContent()}
                </motion.div>
            </main>
        </div>
    );
};

// Overview Section Component
const OverviewSection = ({ analytics, loading, onQuickAction }) => {
    if (loading) {
        return (
            <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading analytics...</p>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Users',
            value: analytics?.totalUsers || 0,
            icon: 'fa-users',
            color: '#6366f1',
            change: '+12%'
        },
        {
            label: 'Total Events',
            value: analytics?.totalEvents || 0,
            icon: 'fa-calendar-alt',
            color: '#8b5cf6',
            change: '+8%'
        },
        {
            label: 'Registrations',
            value: analytics?.totalRegistrations || 0,
            icon: 'fa-ticket-alt',
            color: '#ec4899',
            change: '+24%'
        },
        {
            label: 'Active Members',
            value: analytics?.activeMembers || 0,
            icon: 'fa-user-check',
            color: '#10b981',
            change: '+5%'
        }
    ];

    return (
        <div className="overview-section">
            <h1 className="section-title gradient-text">Dashboard Overview</h1>

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
                            <div className="stat-change positive">
                                <i className="fas fa-arrow-up"></i>
                                {stat.change}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions glass-card">
                <h2>Quick Actions</h2>
                <div className="action-grid">
                    <button className="action-btn interactive" onClick={() => onQuickAction('createEvent')}>
                        <i className="fas fa-plus-circle"></i>
                        <span>Create Event</span>
                    </button>
                    <button className="action-btn interactive" onClick={() => onQuickAction('addTeamMember')}>
                        <i className="fas fa-user-plus"></i>
                        <span>Add Team Member</span>
                    </button>
                    <button className="action-btn interactive" onClick={() => onQuickAction('uploadImages')}>
                        <i className="fas fa-upload"></i>
                        <span>Upload Images</span>
                    </button>
                    <button className="action-btn interactive" onClick={() => onQuickAction('postNews')}>
                        <i className="fas fa-newspaper"></i>
                        <span>Post News</span>
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity glass-card">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-user-plus"></i>
                        </div>
                        <div className="activity-content">
                            <p><strong>New user registered</strong></p>
                            <span className="activity-time">2 hours ago</span>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <div className="activity-content">
                            <p><strong>Event registration received</strong></p>
                            <span className="activity-time">5 hours ago</span>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-image"></i>
                        </div>
                        <div className="activity-content">
                            <p><strong>New images uploaded to gallery</strong></p>
                            <span className="activity-time">1 day ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
