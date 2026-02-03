import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { FaInstagram, FaLinkedin, FaYoutube, FaFacebook, FaDiscord, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import './SocialSidebar.css';

const SocialSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Auto-open on home page, auto-close on other pages
    useEffect(() => {
        if (location.pathname === '/') {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [location.pathname]);

    const socialLinks = [
        {
            icon: <FaInstagram />,
            url: 'https://instagram.com/autorob_hbtu',
            label: 'Instagram',
            color: '#E4405F'
        },
        {
            icon: <FaLinkedin />,
            url: 'https://linkedin.com/company/autorob-hbtu',
            label: 'LinkedIn',
            color: '#0077B5'
        },
        {
            icon: <FaYoutube />,
            url: 'https://youtube.com/@autorob_hbtu',
            label: 'YouTube',
            color: '#FF0000'
        },
        {
            icon: <FaXTwitter />,
            url: 'https://twitter.com/autorob_hbtu',
            label: 'Twitter',
            color: '#000000'
        },
        {
            icon: <FaFacebook />,
            url: 'https://facebook.com/autorob.hbtu',
            label: 'Facebook',
            color: '#1877F2'
        },
        {
            icon: <FaDiscord />,
            url: 'https://discord.gg/autorob',
            label: 'Discord',
            color: '#5865F2'
        },
        {
            icon: <FaWhatsapp />,
            url: 'https://wa.me/919876543210',
            label: 'WhatsApp',
            color: '#25D366'
        },
    ];

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                className="social-toggle interactive"
                onClick={() => setIsOpen(!isOpen)}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <i className={`fas fa-${isOpen ? 'times' : 'share-alt'}`}></i>
            </motion.button>

            {/* Social Links Container */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="social-sidebar"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        {socialLinks.map((social, index) => (
                            <motion.a
                                key={social.label}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-sidebar-link interactive"
                                aria-label={social.label}
                                style={{ '--hover-color': social.color }}
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ scale: 1.15, x: -5 }}
                            >
                                {social.icon}
                            </motion.a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SocialSidebar;
