import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero/Hero';
import Footer from '../components/common/Footer/Footer';
import { getAllTeamMembers, getAllEvents, getAllGalleryImages } from '../services/adminService';
import './Home.css';

const Home = () => {
    const [teamData, setTeamData] = useState({ finalYear: [], featured: [] });
    const [events, setEvents] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Team
                const teamResult = await getAllTeamMembers();
                if (teamResult.success) {
                    const allMembers = teamResult.data.filter(m => m.isActive !== false);
                    const finalYear = allMembers.filter(m => m.year === 'Final Year').sort((a, b) => (a.order || 999) - (b.order || 999));

                    // Get featured members (not in final year) or just top roles
                    // If isFeatured flag exists, use it. Else pick top roles like President, VP, etc from non-final year
                    let featured = allMembers.filter(m => m.year !== 'Final Year' && (m.isFeatured || ['President', 'Vice President', 'General Secretary', 'Technical Head'].includes(m.role)));

                    // Fallback if no featured logic: just take 4 random non-final year
                    if (featured.length === 0) {
                        featured = allMembers.filter(m => m.year !== 'Final Year');
                    }

                    setTeamData({
                        finalYear,
                        featured: featured.slice(0, 4) // Limit to 4
                    });
                }

                // Fetch Events
                const eventsResult = await getAllEvents();
                if (eventsResult.success) {
                    // Sort by date (upcoming/newest) and take 3
                    const sortedEvents = eventsResult.data
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 3);
                    setEvents(sortedEvents);
                }

                // Fetch Gallery
                const galleryResult = await getAllGalleryImages();
                if (galleryResult.success) {
                    setGallery(galleryResult.data.slice(0, 6)); // Limit 6 images
                }

            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <main className="home-page">
            <Hero />

            {/* About Section */}
            <section className="home-section about-preview">
                <div className="container">
                    <motion.div
                        className="section-content glass-card"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <div className="text-content">
                            <h2 className="section-title gradient-text">About AUTOROB</h2>
                            <p>
                                AUTOROB is the official robotics club of HBTU Kanpur. We are a community of innovators,
                                builders, and tech enthusiasts dedicated to exploring the frontiers of robotics and automation.
                                Our mission is to foster technical skills and creativity through hands-on projects and competitions.
                            </p>
                            <Link to="/about" className="btn btn-primary interactive">
                                Read More <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                        <div className="image-content">
                            <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800" alt="About Autorob" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Team Section */}
            <section className="home-section team-preview">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="section-title gradient-text">Meet Our Team</h2>
                        <p className="section-subtitle">The minds behind the machines</p>
                    </motion.div>

                    {/* Final Year Grid */}
                    {teamData.finalYear.length > 0 && (
                        <div className="team-group">
                            <h3 className="group-title">Final Year</h3>
                            <div className="team-grid">
                                {teamData.finalYear.map((member, i) => (
                                    <motion.div
                                        key={member.id}
                                        className="team-card-mini glass-card interactive"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="member-avatar">
                                            <img src={member.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} alt={member.name} />
                                        </div>
                                        <div className="member-info">
                                            <h4>{member.name}</h4>
                                            <span>{member.role}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Featured Members (4 members) */}
                    {teamData.featured.length > 0 && (
                        <div className="team-group">
                            <h3 className="group-title">Key Members</h3>
                            <div className="team-grid">
                                {teamData.featured.map((member, i) => (
                                    <motion.div
                                        key={member.id}
                                        className="team-card-mini glass-card interactive"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="member-avatar">
                                            <img src={member.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} alt={member.name} />
                                        </div>
                                        <div className="member-info">
                                            <h4>{member.name}</h4>
                                            <span>{member.role}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="center-btn">
                        <Link to="/team" className="btn btn-glass interactive">
                            View Full Team <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section className="home-section events-preview">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="section-title gradient-text">Upcoming Events</h2>
                        <Link to="/events" className="btn-link">View All <i className="fas fa-arrow-right"></i></Link>
                    </motion.div>

                    <div className="events-grid-home">
                        {events.length > 0 ? (
                            events.map((event, i) => (
                                <motion.div
                                    key={event.id}
                                    className="event-card-home glass-card interactive"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="event-date-badge">
                                        <span className="day">{new Date(event.date).getDate()}</span>
                                        <span className="month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                    </div>
                                    <div className="event-info">
                                        <h3>{event.title}</h3>
                                        <p>{event.category}</p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <p className="no-data">No upcoming events at the moment.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="home-section gallery-preview">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="section-title gradient-text">Gallery</h2>
                        <Link to="/gallery" className="btn-link">See More <i className="fas fa-arrow-right"></i></Link>
                    </motion.div>

                    <div className="gallery-grid-home">
                        {gallery.map((img, i) => (
                            <motion.div
                                key={img.id}
                                className="gallery-item-home interactive"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <img src={img.url} alt={img.title || 'Gallery Image'} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Library & Inventory Section */}
            <section className="home-section library-preview">
                <div className="container">
                    <motion.div
                        className="cta-card glass-card"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <div className="cta-content">
                            <h2 className="gradient-text">Library & Inventory</h2>
                            <p>Explore our vast collection of components, tools, and resources available for members.</p>
                            <Link to="/library" className="btn btn-primary interactive">
                                Browse Inventory <i className="fas fa-box-open"></i>
                            </Link>
                        </div>
                        <div className="cta-icon">
                            <i className="fas fa-microchip"></i>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default Home;
