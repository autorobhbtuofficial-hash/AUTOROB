import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import Footer from '../components/common/Footer/Footer';
import './Library.css';

const Library = () => {
    const [resources, setResources] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'library'));
            const resourcesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setResources(resourcesData);
        } catch (error) {
            console.error('Error fetching resources:', error);
            setResources(demoResourcesData);
        } finally {
            setLoading(false);
        }
    };

    const demoResourcesData = [
        {
            id: '1',
            title: 'Introduction to Robotics',
            description: 'Comprehensive guide covering the fundamentals of robotics, including kinematics, dynamics, and control systems.',
            category: 'tutorial',
            type: 'PDF',
            link: '#',
            author: 'Dr. Rajesh Kumar',
            date: '2024-01-15'
        },
        {
            id: '2',
            title: 'Arduino Programming Basics',
            description: 'Step-by-step tutorial for beginners to learn Arduino programming and hardware interfacing.',
            category: 'tutorial',
            type: 'Video',
            link: '#',
            author: 'AUTOROB Team',
            date: '2024-01-20'
        },
        {
            id: '3',
            title: 'ROS (Robot Operating System) Guide',
            description: 'Complete guide to Robot Operating System for building complex robotic applications.',
            category: 'documentation',
            type: 'PDF',
            link: '#',
            author: 'Prof. Sharma',
            date: '2023-12-10'
        },
        {
            id: '4',
            title: 'Line Following Robot Code',
            description: 'Source code and circuit diagrams for building a line-following robot using IR sensors.',
            category: 'project',
            type: 'GitHub',
            link: '#',
            author: 'Aryan Sharma',
            date: '2024-02-01'
        },
        {
            id: '5',
            title: 'Computer Vision for Robotics',
            description: 'Learn how to implement computer vision algorithms for robotic applications using OpenCV.',
            category: 'tutorial',
            type: 'Video',
            link: '#',
            author: 'Priya Verma',
            date: '2024-01-25'
        },
        {
            id: '6',
            title: 'Autonomous Drone Project',
            description: 'Complete project files for building an autonomous navigation drone with GPS and obstacle avoidance.',
            category: 'project',
            type: 'GitHub',
            link: '#',
            author: 'Rahul Kumar',
            date: '2023-11-15'
        },
        {
            id: '7',
            title: 'Machine Learning in Robotics',
            description: 'Research paper on applying machine learning techniques to improve robot decision-making.',
            category: 'research',
            type: 'PDF',
            link: '#',
            author: 'Dr. Singh',
            date: '2023-10-20'
        },
        {
            id: '8',
            title: 'PCB Design for Robotics',
            description: 'Tutorial on designing custom PCBs for robotics projects using KiCad and Eagle.',
            category: 'tutorial',
            type: 'PDF',
            link: '#',
            author: 'Sneha Patel',
            date: '2024-02-05'
        }
    ];

    const filteredResources = filter === 'all'
        ? resources
        : resources.filter(resource => resource.category === filter);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'PDF': return 'fa-file-pdf';
            case 'Video': return 'fa-video';
            case 'GitHub': return 'fa-github';
            default: return 'fa-file';
        }
    };

    return (
        <main className="library-page">
            <section className="library-hero">
                <div className="container">
                    <motion.h1
                        className="page-title gradient-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Resource Library
                    </motion.h1>
                    <motion.p
                        className="page-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Access tutorials, projects, documentation, and research papers
                    </motion.p>
                </div>
            </section>

            <section className="library-section">
                <div className="container">
                    {/* Filter Buttons */}
                    <motion.div
                        className="library-filters"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {['all', 'tutorial', 'project', 'documentation', 'research'].map((category) => (
                            <button
                                key={category}
                                className={`filter-btn interactive ${filter === category ? 'active' : ''}`}
                                onClick={() => setFilter(category)}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </motion.div>

                    {/* Resources Grid */}
                    <div className="resources-grid">
                        {filteredResources.map((resource, index) => (
                            <motion.div
                                key={resource.id}
                                className="resource-card glass-card interactive"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="resource-header">
                                    <div className={`resource-icon ${resource.type.toLowerCase()}`}>
                                        <i className={`fas ${getTypeIcon(resource.type)}`}></i>
                                    </div>
                                    <div className="resource-category">{resource.category}</div>
                                </div>
                                <h3 className="resource-title">{resource.title}</h3>
                                <p className="resource-description">{resource.description}</p>
                                <div className="resource-footer">
                                    <div className="resource-meta">
                                        <span className="resource-author">
                                            <i className="fas fa-user"></i> {resource.author}
                                        </span>
                                        <span className="resource-date">
                                            <i className="far fa-calendar"></i> {new Date(resource.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <a href={resource.link} className="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
                                        <i className="fas fa-download"></i> Access
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filteredResources.length === 0 && !loading && (
                        <div className="no-resources">
                            <p>No resources found for this category.</p>
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

export default Library;
