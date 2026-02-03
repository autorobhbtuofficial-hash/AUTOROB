import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VideoIntro.css';

const VideoIntro = ({ onVideoEnd }) => {
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;

        if (video) {
            // Preload video
            video.load();

            const handleCanPlay = () => {
                setVideoLoaded(true);
                // Auto-play when loaded
                video.play().catch(err => {
                    console.log('Autoplay prevented:', err);
                    // Fallback: play on user interaction
                });
            };

            const handleEnded = () => {
                setVideoEnded(true);
                setTimeout(() => {
                    if (onVideoEnd) onVideoEnd();
                }, 1000); // Delay before transitioning
            };

            video.addEventListener('canplaythrough', handleCanPlay);
            video.addEventListener('ended', handleEnded);

            return () => {
                video.removeEventListener('canplaythrough', handleCanPlay);
                video.removeEventListener('ended', handleEnded);
            };
        }
    }, [onVideoEnd]);

    return (
        <AnimatePresence>
            {!videoEnded && (
                <motion.div
                    className="video-intro-container"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        scale: 1.1,
                        filter: 'blur(20px)'
                    }}
                    transition={{
                        duration: 1,
                        ease: [0.43, 0.13, 0.23, 0.96]
                    }}
                >
                    {/* Liquid Transition Overlay */}
                    <motion.div
                        className="liquid-overlay"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={videoEnded ? {
                            scale: 3,
                            opacity: 1
                        } : {}}
                        transition={{
                            duration: 1.5,
                            ease: [0.43, 0.13, 0.23, 0.96]
                        }}
                    />

                    {/* Video Element */}
                    <motion.video
                        ref={videoRef}
                        className="intro-video"
                        muted
                        playsInline
                        initial={{ opacity: 0 }}
                        animate={{ opacity: videoLoaded ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <source src="/videos/FRAME1.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </motion.video>

                    {/* Skip Button */}
                    {videoLoaded && !videoEnded && (
                        <motion.button
                            className="skip-button"
                            onClick={() => {
                                setVideoEnded(true);
                                if (onVideoEnd) onVideoEnd();
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2, duration: 0.5 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            SKIP INTRO
                        </motion.button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VideoIntro;
