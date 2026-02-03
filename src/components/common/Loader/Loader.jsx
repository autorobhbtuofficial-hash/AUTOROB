import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

const Loader = ({ onLoadComplete }) => {
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('INITIALIZING');

    const techFeatures = [
        'INITIALIZING',
        'LOADING SYSTEMS',
        'CALIBRATING SENSORS',
        'ACTIVATING PROTOCOLS',
        'READY TO LAUNCH'
    ];

    useEffect(() => {
        const duration = 3000; // 3 seconds total loading time
        const interval = 50; // Update every 50ms
        const steps = duration / interval;
        const increment = 100 / steps;

        let currentProgress = 0;
        const timer = setInterval(() => {
            currentProgress += increment;

            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(timer);
                setTimeout(() => {
                    if (onLoadComplete) onLoadComplete();
                }, 500);
            }

            setProgress(currentProgress);

            // Update loading text based on progress
            const textIndex = Math.floor((currentProgress / 100) * (techFeatures.length - 1));
            setLoadingText(techFeatures[textIndex]);
        }, interval);

        return () => clearInterval(timer);
    }, [onLoadComplete]);

    return (
        <motion.div
            className="loader-container"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="loader-content">
                {/* Animated Logo/Icon */}
                <motion.div
                    className="loader-icon"
                    animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        rotate: {
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                        },
                        scale: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        },
                    }}
                >
                    <div className="loader-hexagon">
                        <div className="hexagon-inner"></div>
                    </div>
                </motion.div>

                {/* Loading Text */}
                <motion.h2
                    className="loader-text"
                    key={loadingText}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {loadingText}
                </motion.h2>

                {/* Progress Bar */}
                <div className="loader-progress-container">
                    <motion.div
                        className="loader-progress-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </div>

                {/* Progress Percentage */}
                <motion.p className="loader-percentage">
                    {Math.floor(progress)}%
                </motion.p>

                {/* Tech Grid Background */}
                <div className="loader-grid"></div>
            </div>
        </motion.div>
    );
};

export default Loader;
