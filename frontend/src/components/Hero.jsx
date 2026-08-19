import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Clock, Users, ShieldAlert, ArrowRight, Bot, Cpu, Zap, Activity } from 'lucide-react';
import { api } from '../services/api';

export default function Hero() {
  const [stats, setStats] = useState({
    paid_teams: 5,
    max_teams: 100,
    teams_registered_text: '5 / 100 Teams Registered',
    is_registration_open: true
  });

  useEffect(() => {
    api.getStats()
      .then(res => {
        if (res && typeof res === 'object' && !Array.isArray(res) && res.paid_teams !== undefined) {
          setStats(res);
        }
      })
      .catch(err => console.log('Stats load fallback', err));
  }, []);

  return (
    <section style={{
      position: 'relative',
      paddingTop: '160px',
      paddingBottom: '110px',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at top, #0f172a 0%, #06080e 100%)'
    }}>
      {/* Background Glowing Orbs */}
      <div className="glow-background" style={{ top: '-100px', left: '50%', transform: 'translateX(-50%)' }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto' }}>
          
          {/* Badge & Live Database Counter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <span className="badge-tag">
              <Sparkles size={14} /> National Hackathon 2026
            </span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: '700',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
              LIVE COUNTER: {stats.teams_registered_text}
            </div>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '16px',
            color: '#ffffff'
          }}>
            AGENT<span className="gradient-text">X</span> INDIA 2026
          </h1>

          {/* Tagline */}
          <div style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontWeight: 800,
            color: '#fbbf24',
            marginBottom: '16px',
            letterSpacing: '-0.01em'
          }}>
            Build. Automate. Impact.
          </div>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            maxWidth: '680px',
            margin: '0 auto 36px auto',
            lineHeight: 1.5
          }}>
            The <strong>24-Hour AI Agent Hackathon</strong> where two-member teams build autonomous, tool-using AI agents that solve real-world problems.
          </p>

          {/* Key Event Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '16px',
            maxWidth: '800px',
            margin: '0 auto 40px auto'
          }}>
            <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
              <Calendar size={22} color="#06b6d4" style={{ marginBottom: '6px' }} />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Date</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>30 AUGUST 2026</div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
              <Clock size={22} color="#3b82f6" style={{ marginBottom: '6px' }} />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Duration</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>24 HOURS</div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
              <Users size={22} color="#f59e0b" style={{ marginBottom: '6px' }} />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Team Format</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>2 MEMBERS / TEAM</div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
              <ShieldAlert size={22} color="#8b5cf6" style={{ marginBottom: '6px' }} />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Capacity Cap</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>100 MAX TEAMS</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 36px' }}>
              <Sparkles size={20} /> REGISTER NOW (₹199 / Team)
            </Link>
            <a href="#about" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
              EXPLORE HACKATHON <ArrowRight size={18} />
            </a>
          </div>
        </div>

        {/* Futuristic Agentic AI Visual Element */}
        <div style={{
          marginTop: '70px',
          padding: '30px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '24px',
          boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8)',
          position: 'relative'
        }}>
          <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#06b6d4', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>
            AUTONOMOUS AGENTIC WORKFLOW ARCHITECTURE
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '16px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: 700, marginBottom: '8px' }}>
                <Cpu size={20} /> 1. Problem Perception
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Agent ingests unstructured environment inputs, task prompts, and contextual constraints.</p>
            </div>

            <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '16px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fbbf24', fontWeight: 700, marginBottom: '8px' }}>
                <Zap size={20} /> 2. Planning & Tool Use
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Decomposes tasks into sub-goals, decides API calls, web search, database execution, or code sandbox.</p>
            </div>

            <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '16px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', fontWeight: 700, marginBottom: '8px' }}>
                <Activity size={20} /> 3. Real Action Execution
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Executes API payloads, verifies outcomes, self-corrects errors, and produces verified impact.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
