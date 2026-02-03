import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import Footer from '../components/common/Footer/Footer';
import './Team.css';

const Team = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'team'));
            const members = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTeamMembers(members);
        } catch (error) {
            console.error('Error fetching team members:', error);
            // Use demo data if Firebase fails
            setTeamMembers(demoTeamData);
        } finally {
            setLoading(false);
        }
    };

    const demoTeamData = [
        {
            id: '1',
            name: 'Aryan Sharma',
            role: 'President',
            position: 'Lead',
            image: 'https://ui-avatars.com/api/?name=Aryan+Sharma&size=400&background=6366f1&color=fff',
            bio: 'Leading AUTOROB with passion for robotics and automation',
            linkedin: 'https://linkedin.com',
            github: 'https://github.com',
            email: 'aryan@autorob.com'
        },
        {
            id: '2',
            name: 'Priya Verma',
            role: 'Vice President',
            position: 'Lead',
            image: 'https://ui-avatars.com/api/?name=Priya+Verma&size=400&background=8b5cf6&color=fff',
            bio: 'Passionate about AI and machine learning integration',
            linkedin: 'https://linkedin.com',
            github: 'https://github.com',
            email: 'priya@autorob.com'
        },
        {
            id: '3',
            name: 'Rahul Kumar',
            role: 'Technical Head',
            position: 'Core',
            image: 'https://ui-avatars.com/api/?name=Rahul+Kumar&size=400&background=ec4899&color=fff',
            bio: 'Expert in embedded systems and IoT',
            linkedin: 'https://linkedin.com',
            github: 'https://github.com',
            email: 'rahul@autorob.com'
        },
        {
            id: '4',
            name: 'Sneha Patel',
            role: 'Design Head',
            position: 'Core',
            image: 'https://ui-avatars.com/api/?name=Sneha+Patel&size=400&background=f59e0b&color=fff',
            bio: 'Creating stunning designs for robotics projects',
            linkedin: 'https://linkedin.com',
            github: 'https://github.com',
            email: 'sneha@autorob.com'
        },
        {
            id: '5',
            name: 'Amit Singh',
            role: 'Event Coordinator',
            position: 'Core',
            image: 'https://ui-avatars.com/api/?name=Amit+Singh&size=400&background=10b981&color=fff',
            bio: 'Organizing amazing robotics events and workshops',
            linkedin: 'https://linkedin.com',
            github: 'https://github.com',
            email: 'amit@autorob.com'
        },
        {
            id: '6',
            name: 'Neha Gupta',
            role: 'PR Head',
            position: 'Core',
            image: 'https://ui-avatars.com/api/?name=Neha+Gupta&size=400&background=3b82f6&color=fff',
            bio: 'Building connections and spreading awareness',
            linkedin: 'https://linkedin.com',
            github: 'https://github.com',
            email: 'neha@autorob.com'
        }
    ];

    const positions = ['Lead', 'Core', 'Member'];

    return (
        <main className="team-page">
            <section className="team-hero">
                <div className="container">
                    <motion.h1
                        className="page-title gradient-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Our Team
                    </motion.h1>
                    <motion.p
                        className="page-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Meet the brilliant minds driving innovation at AUTOROB
                    </motion.p>
                </div>
            </section>

            {positions.map((position, posIndex) => {
                const positionMembers = teamMembers.filter(m => m.position === position);
                if (positionMembers.length === 0) return null;

                return (
                    <section key={position} className="team-section">
                        <div className="container">
                            <motion.h2
                                className="section-title gradient-text"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                {position} Team
                            </motion.h2>

                            <div className="team-grid">
                                {positionMembers.map((member, index) => (
                                    <motion.div
                                        key={member.id}
                                        className="team-card glass-card interactive"
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ y: -10 }}
                                    >
                                        <div className="team-card-image">
                                            <img src={member.image} alt={member.name} />
                                        </div>
                                        <div className="team-card-content">
                                            <h3 className="team-card-name">{member.name}</h3>
                                            <p className="team-card-role gradient-text">{member.role}</p>
                                            <p className="team-card-bio">{member.bio}</p>
                                            <div className="team-card-socials">
                                                {member.linkedin && (
                                                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="social-link interactive">
                                                        <i className="fab fa-linkedin"></i>
                                                    </a>
                                                )}
                                                {member.github && (
                                                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="social-link interactive">
                                                        <i className="fab fa-github"></i>
                                                    </a>
                                                )}
                                                {member.email && (
                                                    <a href={`mailto:${member.email}`} className="social-link interactive">
                                                        <i className="fas fa-envelope"></i>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                );
            })}

            {loading && (
                <div className="loading-container">
                    <div className="loader-spinner"></div>
                </div>
            )}

            <Footer />
        </main>
    );
};

export default Team;
