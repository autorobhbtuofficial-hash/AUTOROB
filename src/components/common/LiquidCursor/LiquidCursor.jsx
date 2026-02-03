import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import './LiquidCursor.css';

const LiquidCursor = () => {
    const cursorRef = useRef(null);
    const cursorInnerRef = useRef(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const cursorPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const cursor = cursorRef.current;
        const cursorInner = cursorInnerRef.current;

        // Track mouse position
        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        // Smooth cursor follow animation
        const animateCursor = () => {
            // Smooth interpolation
            cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.15;
            cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.15;

            if (cursor && cursorInner) {
                gsap.set(cursor, {
                    x: cursorPos.current.x,
                    y: cursorPos.current.y,
                });

                gsap.set(cursorInner, {
                    x: mousePos.current.x,
                    y: mousePos.current.y,
                });
            }

            requestAnimationFrame(animateCursor);
        };

        // Handle hover effects
        const handleMouseEnter = () => {
            gsap.to(cursor, {
                scale: 1.5,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(cursor, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        // Add event listeners
        window.addEventListener('mousemove', handleMouseMove);

        // Add hover listeners to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .interactive');
        interactiveElements.forEach((el) => {
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);
        });

        // Start animation loop
        animateCursor();

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            interactiveElements.forEach((el) => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, []);

    return (
        <>
            <div ref={cursorRef} className="liquid-cursor" />
            <div ref={cursorInnerRef} className="liquid-cursor-inner" />
        </>
    );
};

export default LiquidCursor;
