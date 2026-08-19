import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Share2, Linkedin, Github, Disc as Discord } from 'lucide-react';
import ShareModal from './ShareModal';

export default function Contact() {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <section id="contact" className="section-padding" style={{ background: '#06080e', position: 'relative' }}>
      <div className="container">
        
        <div className="section-header">
          <span className="badge-tag">Contact Us</span>
          <h2 className="section-title">Get in Touch with <span className="gradient-text">Organizers</span></h2>
          <p className="section-subtitle">
            Have questions about registration, challenge tracks, or sponsorship? Reach out to our organizing team.
          </p>
        </div>

        <div className="grid-2">
          
          {/* Contact Details Card */}
          <div className="glass-panel" style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '24px' }}>
              Official Contact Info
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail color="#06b6d4" size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Official Support Email</div>
                  <a href="mailto:sivaramakrishna54599@gmail.com" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', textDecoration: 'none' }}>
                    sivaramakrishna54599@gmail.com
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone color="#3b82f6" size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Organizer Helpline</div>
                  <a href="tel:+919876543210" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', textDecoration: 'none' }}>
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin color="#f59e0b" size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Location & Host</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                    AGENTX INDIA Organizing Committee, National AI Initiative
                  </div>
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              Connect on Social Platforms
            </h4>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShareModalOpen(true)}
                className="btn-secondary" 
                style={{ padding: '10px 18px', fontSize: '0.85rem' }}
              >
                <Share2 size={16} /> Share Event
              </button>
              
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                <Linkedin size={16} color="#0077b5" /> LinkedIn
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                <Github size={16} /> GitHub
              </a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                <Discord size={16} color="#5865F2" /> Discord
              </a>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="glass-panel" style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '20px' }}>
              Send Us a Message
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully! Our team will get back to you shortly.'); }}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input type="text" className="form-input" placeholder="Full Name" required />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="you@example.com" required />
              </div>

              <div className="form-group">
                <label className="form-label">Message / Query</label>
                <textarea className="form-textarea" rows="4" placeholder="How can we help your team?" required></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                <Send size={18} /> Send Inquiry Message
              </button>
            </form>
          </div>

        </div>

      </div>

      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} />
    </section>
  );
}
