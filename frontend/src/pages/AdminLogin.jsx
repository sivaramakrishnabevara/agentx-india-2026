import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { Lock, User, Key, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin@agentx2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.adminLogin(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#06080e' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '150px', paddingBottom: '100px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          
          <div className="glass-panel" style={{ padding: '40px 32px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid #06b6d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <Lock size={28} color="#06b6d4" />
              </div>

              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
                Admin Portal Login
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                AGENTX INDIA 2026 Management System
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Admin Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '44px' }}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Username"
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Key size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  <input 
                    type="password" 
                    className="form-input" 
                    style={{ paddingLeft: '44px' }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', padding: '14px' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
              Default credentials prefilled for testing: <code style={{ color: '#06b6d4' }}>admin</code> / <code style={{ color: '#06b6d4' }}>admin@agentx2026</code>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
