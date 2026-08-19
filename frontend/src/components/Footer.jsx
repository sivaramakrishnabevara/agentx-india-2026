import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Shield, Lock, FileText, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#04060a',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      paddingTop: '60px',
      paddingBottom: '30px',
      fontSize: '0.9rem',
      color: '#94a3b8'
    }}>
      <div className="container">
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: '#ffffff' }}>
                AGENT<span style={{ color: '#06b6d4' }}>X</span> INDIA
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '16px' }}>
              AGENTX INDIA 2026 is India's premier 24-Hour AI Agent Hackathon for two-member student teams building autonomous AI solutions.
            </p>

            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Built with cutting-edge AI Agentic Workflows.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><a href="#about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Hackathon</a></li>
              <li><a href="#tracks" style={{ color: '#94a3b8', textDecoration: 'none' }}>Challenge Tracks</a></li>
              <li><a href="#timeline" style={{ color: '#94a3b8', textDecoration: 'none' }}>Event Schedule</a></li>
              <li><a href="#faq" style={{ color: '#94a3b8', textDecoration: 'none' }}>FAQs</a></li>
              <li><Link to="/register" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>Team Registration (₹199)</Link></li>
            </ul>
          </div>

          {/* Verification & Legal */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>Legal & Verification</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/verify" style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> Certificate Verification</Link></li>
              <li><Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms & Conditions</Link></li>
              <li><Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link></li>
              <li><Link to="/refund-policy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Refund & Cancellation</Link></li>
              <li><Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contact Us</Link></li>
            </ul>
          </div>

          {/* Admin Access */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>Platform Management</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
              Authorized administrators can access event management tools below.
            </p>
            <Link to="/admin/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Lock size={14} /> Admin Portal
            </Link>
          </div>

        </div>

        {/* Bottom Line */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem' }}>
          <div>
            © 2026 AGENTX INDIA. All rights reserved. Registered National AI Event.
          </div>
          <div>
            Razorpay Verified Payment Gateway | 24-Hour AI Agent Hackathon
          </div>
        </div>

      </div>
    </footer>
  );
}
