import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllNews } from '../services/adminService';
import Footer from '../components/common/Footer/Footer';
import './News.css';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc'); // desc = Newest First

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const result = await getAllNews();
            if (result.success) {
                setNews(result.data);
            } else {
                console.error('Error fetching news:', result.error);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortedNews = [...news].sort((a, b) => {
        const dateA = new Date(a.publishDate);
        const dateB = new Date(b.publishDate);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return (
        <main className="news-page">
            <section className="page-hero">
                <div className="container">
                    <motion.h1
                        className="page-title gradient-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Latest News
                    </motion.h1>
                    <motion.p
                        className="page-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Updates and announcements from AUTOROB
                    </motion.p>
                </div>
            </section>

            <section className="news-content">
                <div className="container">
                    <div className="news-controls">
                        <span>Sort by:</span>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="bg-transparent border border-white/20 rounded p-2 text-white"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loader-spinner"></div>
                            <p>Loading news...</p>
                        </div>
                    ) : sortedNews.length === 0 ? (
                        <div className="no-data">
                            <p>No news articles found.</p>
                        </div>
                    ) : (
                        <div className="news-grid">
                            {sortedNews.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    className="news-card glass-card"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {item.imageUrl && (
                                        <div className="news-image">
                                            <img src={item.imageUrl} alt={item.title} />
                                        </div>
                                    )}
                                    <div className="news-body">
                                        <span className="news-date">
                                            {new Date(item.publishDate).toLocaleDateString()}
                                        </span>
                                        <h3 className="news-title">{item.title}</h3>
                                        <p className="news-excerpt">{item.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default News;
