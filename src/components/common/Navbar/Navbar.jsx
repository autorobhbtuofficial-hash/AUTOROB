import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Nav links - same for everyone, NO Dashboard here
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Team', path: '/team' },
        { name: 'Events', path: '/events' },
        { name: 'Library', path: '/library' },
        { name: 'Gallery', path: '/gallery' },
        { name: 'Contact', path: '/contact' },
    ];

    // CTA button changes based on auth status
    const ctaButton = currentUser
        ? { text: 'Dashboard', path: '/dashboard', icon: 'fa-gauge' }
        : { text: 'Register', path: '/register', icon: 'fa-user-plus' };

    return (
        <motion.nav
            className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="navbar-container container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <motion.span
                        className="logo-text"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        AUTO<span className="logo-accent">ROB</span>
                    </motion.span>
                </Link>

                {/* Desktop Navigation */}
                <ul className="navbar-menu">
                    {navLinks.map((link, index) => (
                        <motion.li
                            key={link.name}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                            <Link to={link.path} className="nav-link interactive">
                                {link.name}
                            </Link>
                        </motion.li>
                    ))}
                </ul>

                {/* CTA Button */}
                <motion.div
                    className="navbar-cta"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <Link to={ctaButton.path} className="btn btn-primary interactive">
                        {ctaButton.text}
                    </Link>
                </motion.div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle interactive"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ul className="mobile-menu-list">
                            {navLinks.map((link, index) => (
                                <motion.li
                                    key={link.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Link to={link.path} className="mobile-nav-link">
                                        {link.name}
                                    </Link>
                                </motion.li>
                            ))}
                            <motion.li
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: navLinks.length * 0.05 }}
                            >
                                <Link
                                    to={ctaButton.path}
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '1rem' }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {ctaButton.text}
                                </Link>
                            </motion.li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
