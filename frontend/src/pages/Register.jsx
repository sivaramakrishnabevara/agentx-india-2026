import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaymentPage from './PaymentPage';
import { api, formatApiError } from '../services/api';
import { Users, Shield, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Lock, CreditCard, AlertCircle } from 'lucide-react';

const TRACK_OPTIONS = [
  { value: "agentic_ai", label: "Agentic AI & Autonomous Agents" },
  { value: "ai_education", label: "AI for Education" },
  { value: "ai_healthcare", label: "AI for Healthcare" },
  { value: "ai_finance", label: "AI for Finance" },
  { value: "ai_cybersecurity", label: "AI for Cybersecurity" },
  { value: "smart_automation", label: "AI for Smart Automation" }
];

const TRACK_ID_MAP = {
  agentic_ai: 1,
  ai_education: 2,
  ai_healthcare: 3,
  ai_finance: 4,
  ai_cybersecurity: 5,
  smart_automation: 6
};

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramTrack = searchParams.get('track') || '';

  const initialTrackCode = (() => {
    if (!paramTrack) return '';
    const found = TRACK_OPTIONS.find(t => t.value === paramTrack.toLowerCase());
    if (found) return found.value;
    const numMap = {
      '1': 'agentic_ai',
      '2': 'ai_education',
      '3': 'ai_healthcare',
      '4': 'ai_finance',
      '5': 'ai_cybersecurity',
      '6': 'smart_automation'
    };
    return numMap[paramTrack] || '';
  })();

  // Step state: 1 (Team Details) -> 2 (Member Details) -> 3 (Review) -> 4 (Payment & UTR Submission)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [trackOptions, setTrackOptions] = useState(TRACK_OPTIONS);
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);
  const [createdRegistration, setCreatedRegistration] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    team_name: '',
    college: '',
    city: '',
    state: '',
    challenge_track: initialTrackCode,
    member1: {
      full_name: '',
      email: '',
      phone: '',
      college: '',
      github: '',
      linkedin: '',
      portfolio: '',
      skills: ''
    },
    member2: {
      full_name: '',
      email: '',
      phone: '',
      college: '',
      github: '',
      linkedin: '',
      portfolio: '',
      skills: ''
    }
  });

  useEffect(() => {
    // Load tracks & check registration stats
    api.getTracks()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          const formatted = res.map(t => ({
            value: t.code || t.value || (t.id === 1 ? 'agentic_ai' : t.id === 2 ? 'ai_education' : t.id === 3 ? 'ai_healthcare' : t.id === 4 ? 'ai_finance' : t.id === 5 ? 'ai_cybersecurity' : 'smart_automation'),
            label: t.title || t.name || t.value
          }));
          setTrackOptions(formatted);
        }
      })
      .catch(err => console.log('Tracks load error', err));

    api.getStats()
      .then(res => {
        if (res && res.is_registration_open === false) {
          setIsRegistrationClosed(true);
        }
      })
      .catch(err => console.log('Stats check error', err));
  }, []);

  const getTrackLabel = (trackVal) => {
    if (!trackVal) return 'Not Selected';
    const match = trackOptions.find(t => t.value === trackVal);
    if (match) return match.label;
    const fallbackMatch = TRACK_OPTIONS.find(t => t.value === trackVal);
    return fallbackMatch ? fallbackMatch.label : trackVal;
  };

  const handleMemberChange = (memberKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      [memberKey]: {
        ...prev[memberKey],
        [field]: value
      }
    }));
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.team_name.trim()) return "Team name is required.";
    if (!formData.college.trim()) return "College/University name is required.";
    if (!formData.city.trim()) return "City is required.";
    if (!formData.state.trim()) return "State is required.";
    if (!formData.challenge_track || !formData.challenge_track.trim()) return "Please select a challenge track.";
    return null;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const { member1, member2 } = formData;
    if (!member1.full_name.trim() || !member1.email.trim() || !member1.phone.trim() || !member1.college.trim()) {
      return "All required fields for Member 1 must be completed.";
    }
    if (!member2.full_name.trim() || !member2.email.trim() || !member2.phone.trim() || !member2.college.trim()) {
      return "All required fields for Member 2 must be completed.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(member1.email.trim())) {
      return "Member 1 has an invalid email address format.";
    }
    if (!emailRegex.test(member2.email.trim())) {
      return "Member 2 has an invalid email address format.";
    }
    if (member1.phone.trim().length < 10) {
      return "Member 1 phone number must be at least 10 digits.";
    }
    if (member2.phone.trim().length < 10) {
      return "Member 2 phone number must be at least 10 digits.";
    }
    if (member1.email.trim().toLowerCase() === member2.email.trim().toLowerCase()) {
      return "Member 1 and Member 2 must have distinct email addresses.";
    }
    if (member1.phone.trim() === member2.phone.trim()) {
      return "Member 1 and Member 2 must have distinct phone numbers.";
    }
    return null;
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (step === 1) {
      const err = validateStep1();
      if (err) return setErrorMessage(err);
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) return setErrorMessage(err);
      setStep(3);
    }
  };

  // Submit Registration & Move to Payment Page
  const handleProceedToPayment = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      if (createdRegistration && createdRegistration.id) {
        setStep(4);
        setLoading(false);
        return;
      }

      const cleanMember = (m) => ({
        full_name: m.full_name.trim(),
        email: m.email.trim().toLowerCase(),
        phone: m.phone.trim(),
        college: m.college.trim(),
        github: m.github?.trim() || null,
        linkedin: m.linkedin?.trim() || null,
        portfolio: m.portfolio?.trim() || null,
        skills: m.skills?.trim() || null,
      });

      const payload = {
        team_name: formData.team_name.trim(),
        college: formData.college.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        challenge_track: formData.challenge_track,
        track_id: TRACK_ID_MAP[formData.challenge_track] || 1,
        member1: cleanMember(formData.member1),
        member2: cleanMember(formData.member2)
      };

      // Submit Registration to Backend
      const regResponse = await api.createRegistration(payload);
      setCreatedRegistration(regResponse);
      setStep(4);
    } catch (err) {
      const formattedErr = formatApiError(err);
      setErrorMessage(formattedErr);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  if (isRegistrationClosed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#06080e' }}>
        <Navbar />
        <main className="container" style={{ paddingTop: '160px', paddingBottom: '100px', flexGrow: 1, textAlign: 'center' }}>
          <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '48px' }}>
            <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
              REGISTRATION CLOSED
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '24px', lineHeight: 1.6 }}>
              All <strong>100 confirmed teams</strong> (200 participants) have been successfully registered for AGENTX INDIA 2026.
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Return to Homepage
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Step 4: Render Payment Page component directly
  if (step === 4 && createdRegistration) {
    return (
      <PaymentPage 
        registrationData={createdRegistration} 
        onBackToReview={() => setStep(3)} 
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#06080e' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '140px', paddingBottom: '100px', flexGrow: 1 }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span className="badge-tag"><Users size={14} /> Team Registration</span>
            <h1 className="section-title" style={{ fontSize: '2.5rem', marginTop: '10px' }}>
              Register Your <span className="gradient-text">2-Member Team</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
              AGENTX INDIA 2026 • Registration Fee: <strong>₹199 per team — 2 members</strong>
            </p>
          </div>

          {/* 5-Step Progress Indicator Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '16px 24px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)'
          }}>
            {[
              { num: 1, label: "Team Details" },
              { num: 2, label: "Members" },
              { num: 3, label: "Review" },
              { num: 4, label: "Payment ₹199" },
              { num: 5, label: "Confirmation" }
            ].map((s) => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: step === s.num ? '#06b6d4' : (step > s.num ? '#10b981' : '#1e293b'),
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: step === s.num ? '0 0 12px #06b6d4' : 'none'
                }}>
                  {step > s.num ? <CheckCircle2 size={18} /> : s.num}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: step >= s.num ? '#ffffff' : '#64748b' }} className="desktop-nav">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '14px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={20} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* STEP 1: TEAM DETAILS */}
          {step === 1 && (
            <div className="glass-panel" style={{ padding: '36px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users color="#06b6d4" /> Step 1: Team & Track Information
              </h2>

              <div className="form-group">
                <label className="form-label">Team Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. AgenticKnights" 
                  value={formData.team_name}
                  onChange={e => setFormData({ ...formData, team_name: e.target.value })}
                  required 
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">College / University Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. IIT Bombay / BITS Pilani" 
                    value={formData.college}
                    onChange={e => setFormData({ ...formData, college: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Challenge Track *</label>
                  <select 
                    className="form-select"
                    value={formData.challenge_track}
                    onChange={e => setFormData({ ...formData, challenge_track: e.target.value })}
                  >
                    <option value="">Select a challenge track</option>
                    {trackOptions.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Mumbai" 
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Maharashtra" 
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={handleNextStep} className="btn-primary">
                  Continue to Member Details <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MEMBER 1 & MEMBER 2 DETAILS */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Member 1 Box */}
              <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} /> Member 1 (Team Leader)
                </h3>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="First & Last Name"
                      value={formData.member1.full_name}
                      onChange={e => handleMemberChange('member1', 'full_name', e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="member1@example.com"
                      value={formData.member1.email}
                      onChange={e => handleMemberChange('member1', 'email', e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="+91 9876543210"
                      value={formData.member1.phone}
                      onChange={e => handleMemberChange('member1', 'phone', e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">College / Institute *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="College Name"
                      value={formData.member1.college}
                      onChange={e => handleMemberChange('member1', 'college', e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">GitHub Profile URL</label>
                    <input 
                      type="url" 
                      className="form-input" 
                      placeholder="https://github.com/username"
                      value={formData.member1.github}
                      onChange={e => handleMemberChange('member1', 'github', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">LinkedIn Profile URL</label>
                    <input 
                      type="url" 
                      className="form-input" 
                      placeholder="https://linkedin.com/in/username"
                      value={formData.member1.linkedin}
                      onChange={e => handleMemberChange('member1', 'linkedin', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Member 2 Box */}
              <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} /> Member 2
                </h3>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="First & Last Name"
                      value={formData.member2.full_name}
                      onChange={e => handleMemberChange('member2', 'full_name', e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="member2@example.com"
                      value={formData.member2.email}
                      onChange={e => handleMemberChange('member2', 'email', e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="+91 9876543211"
                      value={formData.member2.phone}
                      onChange={e => handleMemberChange('member2', 'phone', e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">College / Institute *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="College Name"
                      value={formData.member2.college}
                      onChange={e => handleMemberChange('member2', 'college', e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">GitHub Profile URL</label>
                    <input 
                      type="url" 
                      className="form-input" 
                      placeholder="https://github.com/username"
                      value={formData.member2.github}
                      onChange={e => handleMemberChange('member2', 'github', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">LinkedIn Profile URL</label>
                    <input 
                      type="url" 
                      className="form-input" 
                      placeholder="https://linkedin.com/in/username"
                      value={formData.member2.linkedin}
                      onChange={e => handleMemberChange('member2', 'linkedin', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  <ArrowLeft size={18} /> Back to Team Details
                </button>
                <button type="button" onClick={handleNextStep} className="btn-primary">
                  Review & Proceed to Payment <ArrowRight size={18} />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: REVIEW DETAILS & PAYMENT SUMMARY */}
          {step === 3 && (
            <div className="glass-panel" style={{ padding: '36px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '24px' }}>
                Step 3: Review Registration & Fee Summary
              </h2>

              <div style={{ background: '#0b0f19', borderRadius: '14px', padding: '24px', marginBottom: '24px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>TEAM NAME</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{formData.team_name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>COLLEGE</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{formData.college} ({formData.city}, {formData.state})</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>CHALLENGE TRACK</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>{getTrackLabel(formData.challenge_track)}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>MEMBER 1</div>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{formData.member1.full_name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{formData.member1.email} • {formData.member1.phone}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>MEMBER 2</div>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{formData.member2.full_name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{formData.member2.email} • {formData.member2.phone}</div>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown Box */}
              <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '14px', padding: '24px', marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard color="#06b6d4" /> Registration Fee Breakdown
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '1rem', color: '#cbd5e1' }}>
                  <span>Team Registration Fee (Exactly 2 Members)</span>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>₹199.00</span>
                </div>

                <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.15)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Total Payable via UPI QR</span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>₹199 per team</span>
                </div>
              </div>

              {/* Security info */}
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <Lock size={16} color="#10b981" /> Verified via UPI QR + UTR Manual Organizer Verification.
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={() => setStep(2)} className="btn-secondary" disabled={loading}>
                  <ArrowLeft size={18} /> Edit Members
                </button>

                <button 
                  type="button" 
                  onClick={handleProceedToPayment} 
                  className="btn-primary" 
                  style={{ fontSize: '1.1rem', padding: '16px 36px' }}
                  disabled={loading}
                >
                  {loading ? 'Creating Registration...' : 'PROCEED TO UPI PAYMENT (₹199)'} <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
