import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { ShieldCheck, ShieldAlert, Search, Download, CheckCircle2, FileText, Image as ImageIcon, Calendar, Award } from 'lucide-react';

export default function VerifyCertificate() {
  const { certificateId: urlCertId } = useParams();
  const navigate = useNavigate();

  const [inputCertId, setInputCertId] = useState(urlCertId || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async (idToVerify) => {
    const targetId = idToVerify || inputCertId;
    if (!targetId.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await api.verifyCertificate(targetId.trim());
      setResult(res);
    } catch (err) {
      setResult({
        valid: false,
        message: err.message || "Failed to verify certificate. Please check the Certificate ID."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlCertId) {
      handleVerify(urlCertId);
    }
  }, [urlCertId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputCertId.trim()) {
      navigate(`/verify/${inputCertId.trim()}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#06080e' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '150px', paddingBottom: '100px', flexGrow: 1 }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span className="badge-tag"><ShieldCheck size={14} /> Official Verification Portal</span>
            <h1 className="section-title" style={{ fontSize: '2.5rem', marginTop: '10px' }}>
              Public Certificate <span className="gradient-text">Verification</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
              Verify the authenticity of digital certificates issued for AGENTX INDIA 2026.
            </p>
          </div>

          {/* Verification Search Box */}
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '36px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter Certificate ID (e.g. AX2026-AX001-0001)"
                value={inputCertId}
                onChange={e => setInputCertId(e.target.value)}
                style={{ flexGrow: 1, fontSize: '1.05rem', padding: '14px 20px' }}
                required 
              />
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ padding: '14px 28px', fontSize: '1rem' }}
                disabled={loading}
              >
                <Search size={18} /> {loading ? 'Verifying...' : 'VERIFY NOW'}
              </button>
            </form>
          </div>

          {/* RESULT DISPLAY */}
          {result && (
            <div>
              {result.valid ? (
                /* VALID CERTIFICATE CARD */
                <div className="glass-panel" style={{ padding: '40px', border: '1px solid rgba(16, 185, 129, 0.4)', position: 'relative' }}>
                  
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '2px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                  }}>
                    <CheckCircle2 size={36} color="#10b981" />
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid #10b981', padding: '6px 18px', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                      CERTIFICATE VALID ✓
                    </span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginTop: '16px' }}>
                      {result.participant_name}
                    </h2>
                    <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: '1.1rem' }}>
                      CERTIFICATE OF {result.certificate_type}
                    </div>
                  </div>

                  <div style={{ background: '#0b0f19', borderRadius: '16px', padding: '24px', marginBottom: '32px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.95rem' }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>EVENT</span>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>AGENTX INDIA 2026</div>
                      </div>

                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>TEAM NAME & ID</span>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{result.team_name} ({result.team_id})</div>
                      </div>

                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>CHALLENGE TRACK</span>
                        <div style={{ fontWeight: 700, color: '#38bdf8' }}>{result.track_title}</div>
                      </div>

                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>EVENT DATE</span>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{result.event_date}</div>
                      </div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>VERIFIED CERTIFICATE ID</span>
                        <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.1rem' }}>{result.certificate_id}</div>
                      </div>
                    </div>
                  </div>

                  {/* Download Options */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <a 
                      href={api.getCertificateDownloadUrl(result.certificate_id, 'pdf')} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-primary" 
                      style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                    >
                      <FileText size={18} /> Download Vector PDF
                    </a>

                    <a 
                      href={api.getCertificateDownloadUrl(result.certificate_id, 'png')} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary" 
                      style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                    >
                      <ImageIcon size={18} /> Download High-Res PNG
                    </a>
                  </div>

                </div>
              ) : (
                /* INVALID CERTIFICATE CARD */
                <div className="glass-panel" style={{ padding: '40px', border: '1px solid rgba(239, 68, 68, 0.4)', textAlign: 'center' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '2px solid #ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                  }}>
                    <ShieldAlert size={36} color="#ef4444" />
                  </div>

                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171', marginBottom: '12px' }}>
                    Certificate Not Found
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                    {result.message || "The Certificate ID entered does not match any verified certificates in our system. Please check for typos."}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
