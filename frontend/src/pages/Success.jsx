import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle2, Download, Home, ShieldCheck, Mail, Sparkles } from 'lucide-react';

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();

  const teamData = location.state?.teamData;

  useEffect(() => {
    if (!teamData) {
      navigate('/register');
      return;
    }

    // Fire confetti celebration on page mount
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [teamData, navigate]);

  if (!teamData) {
    return null;
  }

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#06080e' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '150px', paddingBottom: '100px', flexGrow: 1 }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          
          <div className="glass-panel" style={{ padding: '48px 36px', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
            
            {/* Success Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
            }}>
              <CheckCircle2 size={48} color="#10b981" />
            </div>

            <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: '#10b981' }}>
              🎉 Registration & Payment Verified
            </span>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', margin: '16px 0 8px 0' }}>
              REGISTRATION SUCCESSFUL
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '32px' }}>
              AGENTX INDIA 2026 • 24-Hour AI Agent Hackathon
            </p>

            {/* Team ID Badge */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
              border: '1px solid #06b6d4',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '32px'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                OFFICIAL ASSIGNED TEAM ID
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.05em' }}>
                {teamData.team_id}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Keep this Team ID for event check-in & project submission.
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', padding: '24px', textAlign: 'left', marginBottom: '32px', border: '1px solid #1e293b' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                Registration Summary
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.95rem' }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Team Name:</span>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>{teamData.team_name}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8' }}>Registration Fee:</span>
                  <div style={{ fontWeight: 800, color: '#10b981' }}>₹199 — VERIFIED ✓</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8' }}>UTR / Payment Ref:</span>
                  <div style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.85rem' }}>{teamData.utr || teamData.payment_id || 'VERIFIED'}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8' }}>Event Date:</span>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>30 August 2026</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', padding: '16px', marginBottom: '32px', fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color="#3b82f6" />
              <span>Your registration & payment verification has been confirmed! Save your receipt below.</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button onClick={handlePrintReceipt} className="btn-primary">
                <Download size={18} /> Print / Save Confirmation Receipt
              </button>
              <Link to="/" className="btn-secondary">
                <Home size={18} /> Return to Home
              </Link>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
