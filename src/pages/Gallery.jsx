import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import Footer from '../components/common/Footer/Footer';
import './Gallery.css';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'gallery'));
            const imagesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setImages(imagesData);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            setImages(demoGalleryData);
        } finally {
            setLoading(false);
        }
    };

    const demoGalleryData = [
        {
            id: '1',
            title: 'RoboWars 2023 Finals',
            category: 'events',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
            description: 'Intense battle during RoboWars finals'
        },
        {
            id: '2',
            title: 'Line Following Robot',
            category: 'projects',
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
            description: 'Autonomous line-following robot in action'
        },
        {
            id: '3',
            title: 'Workshop Session',
            category: 'workshops',
            image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
            description: 'Students learning robotics fundamentals'
        },
        {
            id: '4',
            title: 'Quadcopter Drone',
            category: 'projects',
            image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
            description: 'Custom-built autonomous drone'
        },
        {
            id: '5',
            title: 'Team Photo 2024',
            category: 'team',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
            description: 'AUTOROB team members'
        },
        {
            id: '6',
            title: 'AI Workshop',
            category: 'workshops',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
            description: 'Machine learning workshop for robotics'
        },
        {
            id: '7',
            title: 'Robotic Arm',
            category: 'projects',
            image: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800',
            description: '6-DOF robotic arm project'
        },
        {
            id: '8',
            title: 'Tech Fest 2023',
            category: 'events',
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            description: 'Annual technical festival showcase'
        },
        {
            id: '9',
            title: 'IoT Automation',
            category: 'projects',
            image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800',
            description: 'Smart home automation system'
        }
    ];

    const filteredImages = filter === 'all'
        ? images
        : images.filter(img => img.category === filter);

    return (
        <main className="gallery-page">
            <section className="gallery-hero">
                <div className="container">
                    <motion.h1
                        className="page-title gradient-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Gallery
                    </motion.h1>
                    <motion.p
                        className="page-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Explore our journey through projects, events, and achievements
                    </motion.p>
                </div>
            </section>

            <section className="gallery-section">
                <div className="container">
                    {/* Filter Buttons */}
                    <motion.div
                        className="gallery-filters"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {['all', 'projects', 'events', 'workshops', 'team'].map((category) => (
                            <button
                                key={category}
                                className={`filter-btn interactive ${filter === category ? 'active' : ''}`}
                                onClick={() => setFilter(category)}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </motion.div>

                    {/* Gallery Grid */}
                    <div className="gallery-grid">
                        {filteredImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                className="gallery-item interactive"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                whileHover={{ y: -10 }}
                                onClick={() => setSelectedImage(image)}
                            >
                                <div className="gallery-image">
                                    <img src={image.image} alt={image.title} />
                                    <div className="gallery-overlay">
                                        <h3>{image.title}</h3>
                                        <p>{image.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filteredImages.length === 0 && !loading && (
                        <div className="no-images">
                            <p>No images found for this category.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox */}
            {selectedImage && (
                <motion.div
                    className="lightbox"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
                            <i className="fas fa-times"></i>
                        </button>
                        <img src={selectedImage.image} alt={selectedImage.title} />
                        <div className="lightbox-info">
                            <h3>{selectedImage.title}</h3>
                            <p>{selectedImage.description}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {loading && (
                <div className="loading-container">
                    <div className="loader-spinner"></div>
                </div>
            )}

            <Footer />
        </main>
    );
};

export default Gallery;
