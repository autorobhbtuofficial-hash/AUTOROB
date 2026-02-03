import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaInstagram, FaTwitter, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container container">
                {/* Footer Top */}
                <div className="footer-top">
                    {/* About Section */}
                    <div className="footer-section">
                        <h3 className="footer-logo">
                            AUTO<span className="logo-accent">ROB</span>
                        </h3>
                        <p className="footer-description">
                            HBTU's Premier Robotics & Automation Club. Innovating the future through cutting-edge technology.
                        </p>
                        <div className="footer-social">
                            <a href="https://github.com/autorob-hbtu" target="_blank" rel="noopener noreferrer" className="social-link interactive">
                                <FaGithub />
                            </a>
                            <a href="https://linkedin.com/company/autorob-hbtu" target="_blank" rel="noopener noreferrer" className="social-link interactive">
                                <FaLinkedin />
                            </a>
                            <a href="https://instagram.com/autorob_hbtu" target="_blank" rel="noopener noreferrer" className="social-link interactive">
                                <FaInstagram />
                            </a>
                            <a href="https://twitter.com/autorob_hbtu" target="_blank" rel="noopener noreferrer" className="social-link interactive">
                                <FaTwitter />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-title">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/" className="footer-link">Home</Link></li>
                            <li><Link to="/about" className="footer-link">About</Link></li>
                            <li><Link to="/team" className="footer-link">Team</Link></li>
                            <li><Link to="/events" className="footer-link">Events</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="footer-section">
                        <h4 className="footer-title">Resources</h4>
                        <ul className="footer-links">
                            <li><Link to="/library" className="footer-link">Library</Link></li>
                            <li><Link to="/gallery" className="footer-link">Gallery</Link></li>
                            <li><Link to="/register" className="footer-link">Register</Link></li>
                            <li><Link to="/contact" className="footer-link">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-section">
                        <h4 className="footer-title">Contact Us</h4>
                        <ul className="footer-contact">
                            <li>
                                <FaEnvelope />
                                <a href="mailto:autorob@hbtu.ac.in" className="footer-link">
                                    autorob@hbtu.ac.in
                                </a>
                            </li>
                            <li>HBTU Kanpur, Uttar Pradesh</li>
                            <li>India - 208002</li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} AUTOROB HBTU. All rights reserved.
                    </p>
                    <div className="footer-bottom-links">
                        <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                        <span className="separator">•</span>
                        <Link to="/terms" className="footer-link">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
