import React, { useEffect, useRef } from 'react';
import './SpaceBackground.css';

const SpaceBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let stars = [];
        let rotation = 0;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Star class for smooth 3D rotation
        class Star {
            constructor() {
                this.x = (Math.random() - 0.5) * 2000;
                this.y = (Math.random() - 0.5) * 2000;
                this.z = (Math.random() - 0.5) * 2000;
                this.size = Math.random() * 2 + 0.5;
            }

            rotate(angleX, angleY) {
                // Rotate around Y axis
                let cosY = Math.cos(angleY);
                let sinY = Math.sin(angleY);
                let x1 = this.x * cosY - this.z * sinY;
                let z1 = this.z * cosY + this.x * sinY;

                // Rotate around X axis
                let cosX = Math.cos(angleX);
                let sinX = Math.sin(angleX);
                let y1 = this.y * cosX - z1 * sinX;
                let z2 = z1 * cosX + this.y * sinX;

                return { x: x1, y: y1, z: z2 };
            }

            show(angleX, angleY) {
                const rotated = this.rotate(angleX, angleY);

                // Perspective projection
                const scale = 1000 / (1000 + rotated.z);
                const x2d = rotated.x * scale + canvas.width / 2;
                const y2d = rotated.y * scale + canvas.height / 2;

                // Only draw if in front of camera
                if (rotated.z > -1000) {
                    // Calculate brightness based on depth
                    const brightness = Math.max(0, Math.min(1, (rotated.z + 1000) / 2000));
                    const alpha = brightness * 0.8 + 0.2;

                    // Draw star
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(x2d, y2d, this.size * scale, 0, Math.PI * 2);
                    ctx.fill();

                    // Add glow for larger stars
                    if (this.size > 1.5) {
                        ctx.fillStyle = `rgba(150, 180, 255, ${alpha * 0.3})`;
                        ctx.beginPath();
                        ctx.arc(x2d, y2d, this.size * scale * 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }

        // Initialize stars
        const initStars = () => {
            stars = [];
            const starCount = 500;
            for (let i = 0; i < starCount; i++) {
                stars.push(new Star());
            }
        };

        initStars();

        // Animation loop
        const animate = () => {
            // Clear canvas with fade effect
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Slow rotation
            rotation += 0.0003; // Very slow rotation speed
            const angleX = rotation * 0.5;
            const angleY = rotation;

            // Draw all stars
            stars.forEach(star => {
                star.show(angleX, angleY);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="space-background" />;
};

export default SpaceBackground;
