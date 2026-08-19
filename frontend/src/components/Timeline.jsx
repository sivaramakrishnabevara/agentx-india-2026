import React from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

export default function Timeline() {
  const steps = [
    { phase: "Phase 01", title: "Registration Opens", desc: "Online registrations open for 2-member teams across India. ₹199 per team." },
    { phase: "Phase 02", title: "Team Registration", desc: "Teams submit member details, select a challenge track, and pay ₹199 via UPI QR Code." },
    { phase: "Phase 03", title: "Registration Closes", desc: "Registration closes automatically when 100 paid teams cap is reached." },
    { phase: "Phase 04", title: "Hackathon Kickoff & Keynote", desc: "Live event opening, problem statement briefing, and 24-hour timer starts." },
    { phase: "Phase 05", title: "Development Phase", desc: "24 hours of intensive AI Agent building, coding, testing, and function calling integration." },
    { phase: "Phase 06", title: "Mentor Checkpoint Sessions", desc: "Expert AI mentors conduct 1-on-1 feedback sessions with teams during building." },
    { phase: "Phase 07", title: "Project Submission", desc: "Teams upload GitHub repository link, demo video, and agent workflow architecture." },
    { phase: "Phase 08", title: "Live Demonstrations & Judging", desc: "Top teams present live AI agent execution demos to jury panel." },
    { phase: "Phase 09", title: "Winners Announcement", desc: "Declaration of Grand Winner, Runner-Up, and Track Winners." },
    { phase: "Phase 10", title: "Certificate Generation", desc: "Issuance of official QR-verified digital certificates of participation and merit." }
  ];

  return (
    <section id="timeline" className="section-padding" style={{ background: '#06080e', position: 'relative' }}>
      <div className="container">
        
        <div className="section-header">
          <span className="badge-tag">Event Schedule</span>
          <h2 className="section-title">24-Hour Event <span className="gradient-text">Timeline</span></h2>
          <p className="section-subtitle">
            From registration to live agent demonstrations and certificate distribution.
          </p>
        </div>

        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative' }}>
          {/* Central Line */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '28px',
            width: '2px',
            background: 'linear-gradient(to bottom, #06b6d4, #3b82f6, #f59e0b)'
          }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {steps.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1 }}>
                
                {/* Node Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#0b0f19',
                  border: '2px solid #06b6d4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                  boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
                }}>
                  {idx + 1}
                </div>

                {/* Content Box */}
                <div className="glass-panel" style={{ flexGrow: 1, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {step.phase}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> 30 AUG 2026
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
                    {step.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
                    {step.desc}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
