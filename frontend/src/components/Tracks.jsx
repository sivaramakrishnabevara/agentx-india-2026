import React, { useState, useEffect } from 'react';
import { Bot, BookOpen, Activity, DollarSign, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Tracks() {
  const [tracks, setTracks] = useState([
    {
      id: 1,
      code: "agentic_ai",
      title: "Agentic AI & Autonomous Agents",
      subtitle: "Autonomous Workflows & Multi-Agent Systems",
      description: "Build autonomous AI agents and multi-agent workflows that plan, reason, execute tasks, and collaborate to solve complex problems.",
      icon: "bot",
      bulletPoints: ["Multi-Agent Planning & Collaboration", "Autonomous Task Execution", "Tool-Using Reasoning Agents", "Self-Correction Workflows"]
    },
    {
      id: 2,
      code: "ai_education",
      title: "AI for Education",
      subtitle: "Personalized Learning & Academic Assistance",
      description: "Build AI agents for personalized learning, AI tutoring, study planning, skill-gap analysis, and automated academic assistance.",
      icon: "book-open",
      bulletPoints: ["Personalized AI Tutoring", "Automated Study Scheduling", "Skill-Gap Analysis Agents", "Interactive Course Assistants"]
    },
    {
      id: 3,
      code: "ai_healthcare",
      title: "AI for Healthcare",
      subtitle: "Medical Diagnostics & Health Assistants",
      description: "Build AI agents for health monitoring, diagnostic assistance, medical research synthesis, and patient care workflows.",
      icon: "activity",
      bulletPoints: ["Health Metric Analysis", "Diagnostic Recommendation Agents", "Medical Paper Synthesis", "Patient Follow-up Automation"]
    },
    {
      id: 4,
      code: "ai_finance",
      title: "AI for Finance",
      subtitle: "Fintech, Trading & Fraud Detection",
      description: "Build AI agents for automated financial analysis, fraud detection, smart budgeting, trading insights, and risk assessment.",
      icon: "dollar-sign",
      bulletPoints: ["Automated Financial Analysis", "Real-Time Fraud Detection", "Smart Budgeting Agents", "Risk Assessment Insights"]
    },
    {
      id: 5,
      code: "ai_cybersecurity",
      title: "AI for Cybersecurity",
      subtitle: "Threat Analysis & Security Automation",
      description: "Build agents for phishing detection, threat awareness, vulnerability scanning, automated security analysis, and defense.",
      icon: "shield-check",
      bulletPoints: ["Phishing & Spam Detectors", "Automated Vulnerability Scanners", "Scam Defense Assistants", "Threat Intelligence Aggregators"]
    },
    {
      id: 6,
      code: "smart_automation",
      title: "AI for Smart Automation",
      subtitle: "Industrial, Enterprise & Process Automation",
      description: "Build AI agents for workflow automation, smart campus/city resource management, inventory control, and enterprise operations.",
      icon: "cpu",
      bulletPoints: ["Enterprise Process Automation", "Smart Resource Management", "Inventory Control Agents", "Campus & Office Infrastructure"]
    }
  ]);

  useEffect(() => {
    api.getTracks()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setTracks(res.map((t) => ({
            ...t,
            bulletPoints: t.description ? t.description.split(', ') : []
          })));
        }
      })
      .catch(err => console.log('Tracks fallback', err));
  }, []);

  const getTrackIcon = (iconName) => {
    switch (iconName) {
      case 'bot': return <Bot size={28} color="#06b6d4" />;
      case 'book-open': return <BookOpen size={28} color="#3b82f6" />;
      case 'activity': return <Activity size={28} color="#ef4444" />;
      case 'dollar-sign': return <DollarSign size={28} color="#10b981" />;
      case 'shield-check': return <ShieldCheck size={28} color="#f59e0b" />;
      case 'cpu': return <Cpu size={28} color="#8b5cf6" />;
      default: return <Bot size={28} color="#06b6d4" />;
    }
  };

  return (
    <section id="tracks" className="section-padding" style={{ background: '#06080e', position: 'relative' }}>
      <div className="container">
        
        <div className="section-header">
          <span className="badge-tag">Challenge Tracks</span>
          <h2 className="section-title">6 Impact Areas for <span className="gradient-text">Agent Innovation</span></h2>
          <p className="section-subtitle">
            Choose a challenge track that matches your team's interest. Every team of 2 will build and deploy a dedicated AI Agent solution.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          {tracks.map((track) => (
            <div key={track.id || track.code} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-highlight)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  {getTrackIcon(track.icon)}
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                  {track.title}
                </h3>

                {track.subtitle && (
                  <div style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 600, marginBottom: '14px' }}>
                    {track.subtitle}
                  </div>
                )}

                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
                  {track.description}
                </p>

                {track.bulletPoints && track.bulletPoints.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {track.bulletPoints.map((pt, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4' }}></span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Link 
                to={`/register?track=${track.code || track.value || track.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  color: '#38bdf8',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
              >
                Register For This Track <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
