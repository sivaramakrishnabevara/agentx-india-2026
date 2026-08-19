import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, FileText, RefreshCw, Mail } from 'lucide-react';

export default function PolicyPages() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#06080e' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '150px', paddingBottom: '100px', flexGrow: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {path === '/terms' && (
            <div className="glass-panel" style={{ padding: '40px' }}>
              <span className="badge-tag"><FileText size={14} /> Terms of Service</span>
              <h1 className="section-title" style={{ fontSize: '2.25rem', marginTop: '10px' }}>
                Terms & <span className="gradient-text">Conditions</span>
              </h1>
              
              <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                <p>Welcome to <strong>AGENTX INDIA 2026</strong>. By registering a team or participating in the 24-Hour AI Agent Hackathon, you agree to comply with the following terms:</p>
                
                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginTop: '10px' }}>1. Team Eligibility & Composition</h3>
                <p>Each team must consist of exactly <strong>2 members</strong>. Single participant or 3+ member registrations are not permitted. Both members must be currently enrolled students or recent graduates.</p>

                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginTop: '10px' }}>2. Code of Conduct & Intellectual Property</h3>
                <p>All work submitted during the 24-hour hackathon must be original code created during the event duration. Participants retain full ownership of their intellectual property, projects, and AI models.</p>

                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginTop: '10px' }}>3. Maximum Capacity Cap</h3>
                <p>Participation is capped at 100 paid teams (200 participants). Registrations automatically lock when 100 verified paid teams are reached.</p>
              </div>
            </div>
          )}

          {path === '/privacy' && (
            <div className="glass-panel" style={{ padding: '40px' }}>
              <span className="badge-tag"><Shield size={14} /> Data Protection</span>
              <h1 className="section-title" style={{ fontSize: '2.25rem', marginTop: '10px' }}>
                Privacy <span className="gradient-text">Policy</span>
              </h1>

              <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                <p>Your privacy is important to us. This Privacy Policy details how AGENTX INDIA 2026 collects, stores, and protects participant information.</p>

                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginTop: '10px' }}>1. Information We Collect</h3>
                <p>We collect participant names, email addresses, phone numbers, college affiliations, and GitHub/LinkedIn profile links strictly for event administration, verification, and certificate generation.</p>

                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginTop: '10px' }}>2. Payment Security</h3>
                <p>All payments are handled securely through <strong>Razorpay Standard Checkout</strong>. AGENTX INDIA does not store credit/debit card numbers, UPI PINs, or banking credentials on our servers.</p>

                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginTop: '10px' }}>3. Data Sharing</h3>
                <p>We do not sell or rent participant personal data to third parties.</p>
              </div>
            </div>
          )}

          {path === '/refund-policy' && (
            <div className="glass-panel" style={{ padding: '40px' }}>
              <span className="badge-tag"><RefreshCw size={14} /> Refund Terms</span>
              <h1 className="section-title" style={{ fontSize: '2.25rem', marginTop: '10px' }}>
                Refund & <span className="gradient-text">Cancellation Policy</span>
              </h1>

              <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                <p>Please read our refund policy carefully before completing your team registration payment of ₹199.</p>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', padding: '16px 20px', borderRadius: '0 12px 12px 0' }}>
                  <strong style={{ color: '#fbbf24' }}>Registration Fee Policy:</strong> ₹199 per team (2 members) is non-refundable once payment is manually verified by the organizer.
                </div>

                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginTop: '10px' }}>1. Event Cancellation</h3>
                <p>In the unlikely event that AGENTX INDIA 2026 is officially cancelled by organizers, 100% of the ₹199 fee will be refunded back to the original source bank account within 7-10 business days.</p>

                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginTop: '10px' }}>2. Duplicate Payments</h3>
                <p>If a team experiences duplicate charges during UPI payment, the extra payment will be refunded upon verification of the UTR bank statements.</p>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
