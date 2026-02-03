import React from 'react';
import Hero from '../components/home/Hero/Hero';
import Footer from '../components/common/Footer/Footer';

const Home = () => {
    return (
        <main className="home-page">
            <Hero />

            {/* Placeholder sections - will be built next */}
            <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="container">
                    <h2 className="gradient-text" style={{ textAlign: 'center', fontSize: '3rem' }}>
                        More sections coming soon...
                    </h2>
                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>
                        About • Team • Events • Gallery
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
};

export default Home;
