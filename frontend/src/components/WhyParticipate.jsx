import React from 'react';
import { Award, FileText, Cpu, Briefcase, Rocket, Users } from 'lucide-react';

export default function WhyParticipate() {
  const benefits = [
    {
      icon: <Award size={32} color="#f59e0b" />,
      title: "🏆 Prizes & Recognition",
      description: "Compete for top cash prizes, winner trophies, track winner awards, and special recognition certificates."
    },
    {
      icon: <FileText size={32} color="#06b6d4" />,
      title: "📜 QR-Verified Certificates",
      description: "Every verified participant gets an official digital certificate featuring a unique public QR code for instant resume/portfolio validation."
    },
    {
      icon: <Cpu size={32} color="#3b82f6" />,
      title: "🤖 Agentic AI Experience",
      description: "Gain hands-on experience building state-of-the-art autonomous AI agents with function calling, vector search, and API execution."
    },
    {
      icon: <Briefcase size={32} color="#8b5cf6" />,
      title: "💼 Portfolio Project",
      description: "Build a production-ready AI project in 24 hours that impresses recruiters, tech leads, and venture investors."
    },
    {
      icon: <Rocket size={32} color="#10b981" />,
      title: "🚀 Real-World Impact",
      description: "Solve practical challenges in Education, Cybersecurity, Sustainability, Productivity, and Smart Campuses."
    },
    {
      icon: <Users size={32} color="#ec4899" />,
      title: "🌐 Peer Networking",
      description: "Connect with 200 passionate student developers, AI researchers, industry mentors, and ecosystem leaders across India."
    }
  ];

  return (
    <section id="why-participate" className="section-padding" style={{ background: '#0b0f19', position: 'relative' }}>
      <div className="container">
        
        <div className="section-header">
          <span className="badge-tag">Why Participate</span>
          <h2 className="section-title">Elevate Your Career with <span className="gradient-text">AGENTX INDIA</span></h2>
          <p className="section-subtitle">
            More than just a competition — it's your launchpad into the world of autonomous AI engineering.
          </p>
        </div>

        <div className="grid-3">
          {benefits.map((b, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {b.icon}
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
                {b.title}
              </h3>

              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {b.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
