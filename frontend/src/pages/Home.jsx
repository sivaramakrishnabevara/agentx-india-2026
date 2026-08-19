import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Tracks from '../components/Tracks';
import WhyParticipate from '../components/WhyParticipate';
import Timeline from '../components/Timeline';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <Hero />
        <About />
        <Tracks />
        <WhyParticipate />
        <Timeline />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
