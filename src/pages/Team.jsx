import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllTeamMembers } from '../services/adminService';
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
            const result = await getAllTeamMembers();
            if (result.success) {
                // Filter only active members
                const activeMembers = result.data.filter(m => m.isActive !== false);
                setTeamMembers(activeMembers);
            } else {
                console.error('Error fetching team members:', result.error);
                setTeamMembers([]);
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
            setTeamMembers([]);
        } finally {
            setLoading(false);
        }
    };

    // Define year order and role hierarchy
    const yearOrder = ['Final Year', '3rd Year', '2nd Year', '1st Year'];

    const roleHierarchy = {
        'President': 1,
        'Vice President': 2,
        'General Secretary': 3,
        'Technical Head': 4,
        'Creative Head': 5,
        'Event Head': 6,
        'PR Head': 7,
        'Treasurer': 8,
        'Member': 99
    };

    // Group members by year
    // Group members by year
    const standardGroups = yearOrder.map(year => {
        const yearMembers = teamMembers
            .filter(m => m.year === year)
            .sort((a, b) => {
                const roleA = roleHierarchy[a.role] || 50;
                const roleB = roleHierarchy[b.role] || 50;
                if (roleA !== roleB) return roleA - roleB;
                return (a.order || 999) - (b.order || 999);
            });

        return { year, members: yearMembers };
    }).filter(group => group.members.length > 0);

    // Handle custom years (e.g. Alumni, Former Members)
    const otherMembers = teamMembers.filter(m => !yearOrder.includes(m.year));
    const otherYears = [...new Set(otherMembers.map(m => m.year))];

    const otherGroups = otherYears.map(year => {
        const yearMembers = otherMembers
            .filter(m => m.year === year)
            .sort((a, b) => (a.order || 999) - (b.order || 999));

        return { year, members: yearMembers };
    });

    const groupedByYear = [...standardGroups, ...otherGroups];

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

            {loading ? (
                <div className="loading-container">
                    <div className="loader-spinner"></div>
                    <p>Loading team members...</p>
                </div>
            ) : groupedByYear.length === 0 ? (
                <div className="no-members-container">
                    <i className="fas fa-users" style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }}></i>
                    <p>No team members found. Add members from the admin panel!</p>
                </div>
            ) : (
                groupedByYear.map((group, groupIndex) => (
                    <section key={group.year} className="team-section">
                        <div className="container">
                            <motion.h2
                                className="section-title gradient-text"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: groupIndex * 0.1 }}
                            >
                                {group.year} Team
                            </motion.h2>

                            <div className="team-grid">
                                {group.members.map((member, index) => (
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
                                            <img
                                                src={member.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=400&background=6366f1&color=fff`}
                                                alt={member.name}
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=400&background=6366f1&color=fff`;
                                                }}
                                            />
                                        </div>
                                        <div className="team-card-content">
                                            <h3 className="team-card-name">{member.name}</h3>
                                            <p className="team-card-role gradient-text">{member.role}</p>
                                            <p className="team-card-department">{member.department}</p>
                                            {member.bio && <p className="team-card-bio">{member.bio}</p>}
                                            <div className="team-card-socials">
                                                {member.socialLinks?.linkedin && (
                                                    <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link interactive">
                                                        <i className="fab fa-linkedin"></i>
                                                    </a>
                                                )}
                                                {member.socialLinks?.github && (
                                                    <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link interactive">
                                                        <i className="fab fa-github"></i>
                                                    </a>
                                                )}
                                                {member.socialLinks?.instagram && (
                                                    <a href={member.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link interactive">
                                                        <i className="fab fa-instagram"></i>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                ))
            )}

            <Footer />
        </main>
    );
};

export default Team;
