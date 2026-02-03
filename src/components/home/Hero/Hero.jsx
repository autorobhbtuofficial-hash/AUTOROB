import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            {/* Hero Content */}
            <div className="hero-content container">
                <motion.div
                    className="hero-text"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Welcome to <span className="gradient-text">AUTOROB</span>
                    </motion.h1>

                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        HBTU's Premier Robotics & Automation Club
                    </motion.p>

                    <motion.p
                        className="hero-description"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        Innovating the future through cutting-edge robotics and automation.
                        Join us in building tomorrow's technology today.
                    </motion.p>

                    <motion.div
                        className="hero-cta"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                    >
                        <Link to="/gallery" className="btn btn-primary interactive">
                            Explore Our Work
                        </Link>
                        <Link to="/events" className="btn btn-glass interactive">
                            Check Out Events
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    className="hero-stats"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                >
                    <div className="stat-card glass-card interactive">
                        <div className="stat-number gradient-text">50+</div>
                        <div className="stat-label">Projects</div>
                    </div>
                    <div className="stat-card glass-card interactive">
                        <div className="stat-number gradient-text">200+</div>
                        <div className="stat-label">Members</div>
                    </div>
                    <div className="stat-card glass-card interactive">
                        <div className="stat-number gradient-text">15+</div>
                        <div className="stat-label">Events</div>
                    </div>
                    <div className="stat-card glass-card interactive">
                        <div className="stat-number gradient-text">10+</div>
                        <div className="stat-label">Years</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
