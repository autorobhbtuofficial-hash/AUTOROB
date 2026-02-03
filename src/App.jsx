import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Loader from './components/common/Loader/Loader';
import VideoIntro from './components/common/VideoIntro/VideoIntro';
import LiquidHover from './components/common/LiquidHover/LiquidHover';
import Navbar from './components/common/Navbar/Navbar';
import SpaceBackground from './components/common/SpaceBackground/SpaceBackground';
import SocialSidebar from './components/common/SocialSidebar/SocialSidebar';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Team from './pages/Team';
import Events from './pages/Events';
import Library from './pages/Library';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Styles
import './styles/globals.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowVideo(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleLoadComplete = () => {
    setIsLoading(false);
    setShowVideo(true);
  };

  const handleVideoEnd = () => {
    setShowVideo(false);
    setAppReady(true);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Liquid Hover Effect */}
          {appReady && <LiquidHover />}

          {/* Space Background with Stars */}
          {appReady && <SpaceBackground />}

          {/* Social Media Sidebar */}
          {appReady && <SocialSidebar />}

          {/* Loading Screen */}
          <AnimatePresence>
            {isLoading && <Loader onLoadComplete={handleLoadComplete} />}
          </AnimatePresence>

          {/* Video Intro */}
          <AnimatePresence>
            {showVideo && !isLoading && <VideoIntro onVideoEnd={handleVideoEnd} />}
          </AnimatePresence>

          {/* Main Application */}
          {appReady && (
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/team" element={<Team />} />
                <Route path="/events" element={<Events />} />
                <Route path="/library" element={<Library />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </>
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
