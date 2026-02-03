import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/common/Footer/Footer';
import './About.css';

const About = () => {
    return (
        <main className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="container">
                    <motion.h1
                        className="page-title gradient-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        About AUTOROB
                    </motion.h1>
                    <motion.p
                        className="page-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Pioneering Innovation in Robotics & Automation
                    </motion.p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="about-section">
                <div className="container">
                    <div className="about-grid">
                        <motion.div
                            className="about-card glass-card"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="gradient-text">Our Mission</h2>
                            <p>
                                To foster innovation and excellence in robotics and automation by providing students with hands-on experience,
                                cutting-edge knowledge, and a collaborative environment to transform ideas into reality.
                            </p>
                        </motion.div>

                        <motion.div
                            className="about-card glass-card"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="gradient-text">Our Vision</h2>
                            <p>
                                To be the leading robotics and automation club in India, inspiring the next generation of engineers
                                and innovators to push the boundaries of technology and create solutions for tomorrow's challenges.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Journey Section */}
            <section className="about-section">
                <div className="container">
                    <motion.h2
                        className="section-title gradient-text"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Our Journey
                    </motion.h2>

                    <div className="timeline">
                        {[
                            { year: '2014', title: 'Foundation', desc: 'AUTOROB was established at HBTU with a vision to revolutionize robotics education' },
                            { year: '2016', title: 'First Competition', desc: 'Won our first national robotics competition, marking our presence' },
                            { year: '2018', title: 'Expansion', desc: 'Expanded to 100+ active members and launched multiple technical workshops' },
                            { year: '2020', title: 'Innovation Lab', desc: 'Established our dedicated robotics and automation laboratory' },
                            { year: '2024', title: 'Present Day', desc: 'Leading club with 200+ members, 50+ projects, and national recognition' },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                className="timeline-item glass-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <div className="timeline-year gradient-text">{item.year}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-section">
                <div className="container">
                    <motion.h2
                        className="section-title gradient-text"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Our Core Values
                    </motion.h2>

                    <div className="values-grid">
                        {[
                            { title: 'Innovation', desc: 'Constantly pushing boundaries and exploring new technologies', icon: '💡' },
                            { title: 'Collaboration', desc: 'Working together to achieve extraordinary results', icon: '🤝' },
                            { title: 'Excellence', desc: 'Striving for the highest standards in everything we do', icon: '⭐' },
                            { title: 'Learning', desc: 'Continuous growth through hands-on experience and mentorship', icon: '📚' },
                        ].map((value, index) => (
                            <motion.div
                                key={index}
                                className="value-card glass-card interactive"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                            >
                                <div className="value-icon">{value.icon}</div>
                                <h3 className="gradient-text">{value.title}</h3>
                                <p>{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default About;
