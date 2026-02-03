import React, { useEffect, useRef } from 'react';
import './LiquidHover.css';

const LiquidHover = () => {
    const canvasRef = useRef(null);
    const pointsRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Set canvas size
        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        resizeCanvas();

        // Liquid blob class
        class LiquidBlob {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
                this.radius = Math.random() * 30 + 20;
                this.life = 1;
                this.decay = Math.random() * 0.01 + 0.005;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.life -= this.decay;
            }

            draw(ctx) {
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius
                );

                gradient.addColorStop(0, `rgba(99, 102, 241, ${this.life * 0.6})`);
                gradient.addColorStop(0.5, `rgba(139, 92, 246, ${this.life * 0.4})`);
                gradient.addColorStop(1, `rgba(168, 85, 247, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Handle mouse move
        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };

            // Create new blob on mouse move
            if (pointsRef.current.length < 50) {
                pointsRef.current.push(new LiquidBlob(e.clientX, e.clientY));
            }
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and draw blobs
            pointsRef.current = pointsRef.current.filter(blob => {
                blob.update();
                blob.draw(ctx);
                return blob.life > 0;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        // Event listeners
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', resizeCanvas);

        // Start animation
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return <canvas ref={canvasRef} className="liquid-hover-canvas" />;
};

export default LiquidHover;
