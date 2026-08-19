import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UPIQRCode from '../components/UPIQRCode';
import { api } from '../services/api';
import { CreditCard, Copy, Check, ExternalLink, Upload, AlertCircle, Clock, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

export default function PaymentPage({ registrationData = null, onBackToReview = null }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve registration from props or location state
  const registration = registrationData || location.state?.registration;

  const [eventSettings, setEventSettings] = useState({
    upi_id: '9618164396-3@ybl',
    upi_display_name: 'agentx2026',
    payment_qr_image: null,
    fee_per_team: 199.0
  });

  const [utr, setUtr] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    // Fetch event settings for UPI ID and QR
    api.getEventInfo()
      .then(res => {
        if (res) {
          setEventSettings({
            upi_id: res.upi_id || '9618164396-3@ybl',
            upi_display_name: res.upi_display_name || 'agentx2026',
            payment_qr_image: res.payment_qr_image || null,
            fee_per_team: res.fee_per_team || 199.0
          });
        }
      })
      .catch(err => console.log('Event settings load error', err));

    // If registration exists, check current status
    if (registration && registration.id) {
      api.getPaymentStatus(registration.id)
        .then(res => {
          if (res && res.payment && res.payment.status === 'PENDING') {
            setSubmissionResult({
              status: 'PENDING VERIFICATION',
              utr: res.payment.utr,
              message: 'Your payment has been submitted and is waiting for organizer verification.'
            });
          } else if (res && res.registration_status === 'CONFIRMED') {
            navigate('/success', { state: { teamData: res } });
          }
        })
        .catch(err => console.log('Status fetch error', err));
    }
  }, [registration, navigate]);

  if (!registration) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#06080e' }}>
        <Navbar />
        <main className="container" style={{ paddingTop: '160px', paddingBottom: '100px', flexGrow: 1, textAlign: 'center' }}>
          <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '48px' }}>
            <AlertCircle size={56} color="#f59e0b" style={{ marginBottom: '16px' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
              No Active Registration Found
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '24px' }}>
              Please complete your team details first before accessing the payment page.
            </p>
            <button onClick={() => navigate('/register')} className="btn-primary">
              Go to Team Registration
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(eventSettings.upi_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowed.includes(file.type.toLowerCase())) {
        setError('Allowed file types: PNG, JPG, JPEG, WEBP.');
        setScreenshotFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be under 5 MB.');
        setScreenshotFile(null);
        return;
      }
      setError('');
      setScreenshotFile(file);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!utr.trim() || utr.trim().length < 4) {
      setError('Please enter a valid UTR / Transaction ID (at least 4 characters).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('registration_id', registration.id);
      payload.append('utr', utr.trim());
      if (screenshotFile) {
        payload.append('screenshot', screenshotFile);
      }

      const res = await api.submitPaymentUTR(payload);
      if (res.success) {
        setSubmissionResult({
          status: 'PENDING VERIFICATION',
          utr: utr.trim(),
          message: res.message || 'Your payment has been submitted and is waiting for organizer verification.'
        });
      } else {
        setError(res.message || 'Failed to submit payment UTR.');
      }
    } catch (err) {
      setError(err.message || 'Payment submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(eventSettings.upi_id)}&pn=${encodeURIComponent(eventSettings.upi_display_name)}&am=199&cu=INR`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#06080e' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '140px', paddingBottom: '100px', flexGrow: 1 }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="badge-tag">
              <CreditCard size={14} /> Team Registration Payment
            </span>
            <h1 className="section-title" style={{ fontSize: '2.5rem', marginTop: '10px' }}>
              AGENTX INDIA <span className="gradient-text">2026</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
              Pay ₹199 via UPI QR & Submit your UTR / Transaction ID
            </p>
          </div>

          {/* Registration Details Overview Box */}
          <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Team Name</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>{registration.team_name}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Team Members</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>
                  2 Members (Exactly)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Payment Method</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f59e0b' }}>
                  UPI QR / Deep Link
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Registration Fee</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>
                  ₹199
                </div>
              </div>
            </div>
          </div>

          {/* Submission Result Box (If already submitted & pending verification) */}
          {submissionResult ? (
            <div className="glass-panel" style={{ padding: '40px 32px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '2px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                boxShadow: '0 0 25px rgba(245, 158, 11, 0.3)'
              }}>
                <Clock size={40} color="#fbbf24" />
              </div>

              <span className="badge-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: '#f59e0b' }}>
                STATUS: {submissionResult.status}
              </span>

              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '16px 0 10px 0' }}>
                Payment Under Manual Verification
              </h2>

              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                {submissionResult.message}
              </p>

              <div style={{
                background: '#0b0f19',
                borderRadius: '14px',
                padding: '20px',
                maxWidth: '500px',
                margin: '0 auto 32px auto',
                border: '1px solid #1e293b',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#94a3b8' }}>Submitted UTR / Transaction ID:</span>
                  <span style={{ fontWeight: 800, color: '#38bdf8' }}>{submissionResult.utr}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#94a3b8' }}>Amount Submitted:</span>
                  <span style={{ fontWeight: 800, color: '#10b981' }}>₹199</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#94a3b8' }}>Verification Method:</span>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>Organizer Manual Bank Check</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button onClick={() => window.location.reload()} className="btn-secondary">
                  Refresh Status
                </button>
                <button onClick={() => navigate('/')} className="btn-primary">
                  Return to Home
                </button>
              </div>
            </div>
          ) : (
            /* PAYMENT & UTR SUBMISSION FLOW */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
              
              {/* Left Column: Official UPI QR Code & Instructions */}
              <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '20px', textAlign: 'center' }}>
                  Scan UPI QR Code to Pay ₹199
                </h3>

                {/* QR Code */}
                <UPIQRCode 
                  upiId={eventSettings.upi_id}
                  displayName={eventSettings.upi_display_name}
                  amount={199}
                  customQrUrl={eventSettings.payment_qr_image}
                />

                {/* UPI ID Display & Copy Button */}
                <div style={{ width: '100%', marginTop: '24px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                    ORGANIZER UPI ID
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#0b0f19',
                    border: '1px solid #1e293b',
                    padding: '12px 16px',
                    borderRadius: '12px'
                  }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8', fontSize: '0.95rem' }}>
                      {eventSettings.upi_id}
                    </span>
                    <button 
                      type="button" 
                      onClick={handleCopyUpi} 
                      className="btn-secondary" 
                      style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '6px' }}
                    >
                      {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'COPY UPI ID'}
                    </button>
                  </div>
                </div>

                {/* Deep Link Payment Button */}
                <a
                  href={upiDeepLink}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    justifyContent: 'center',
                    padding: '12px',
                    fontSize: '0.9rem',
                    borderColor: 'rgba(6, 182, 212, 0.4)',
                    color: '#38bdf8'
                  }}
                >
                  <ExternalLink size={16} /> PAY ₹199 USING UPI APP
                </a>

                <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
                  Note: Opening UPI app does not automatically confirm registration. You must return and submit your UTR below.
                </div>
              </div>

              {/* Right Column: UTR Submission Form */}
              <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                  Payment Verification
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '24px' }}>
                  After completing the <strong>₹199</strong> payment, enter your <strong>UTR / Transaction ID</strong> below. Your payment will be manually verified by the organizer.
                </p>

                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmitPayment}>
                  
                  {/* UTR Input Field */}
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label">
                      UTR / Transaction ID *
                    </label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. 423891028341"
                      value={utr}
                      onChange={e => setUtr(e.target.value)}
                      required
                    />
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                      Check your UPI app (GPay, PhonePe, Paytm) payment receipt for the 12-digit UTR/Ref No.
                    </div>
                  </div>

                  {/* Optional Screenshot File Upload */}
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">
                      Payment Screenshot (Optional)
                    </label>
                    <div style={{
                      border: '2px dashed #1e293b',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                      background: '#0b0f19',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileChange}
                        id="screenshot-file-input"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="screenshot-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Upload size={24} color="#06b6d4" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: screenshotFile ? '#34d399' : '#cbd5e1' }}>
                          {screenshotFile ? `Selected: ${screenshotFile.name}` : 'Click to Upload Payment Screenshot'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Allowed: PNG, JPG, JPEG, WEBP (Max 5 MB)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Anti-Fraud Notice */}
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Lock size={16} color="#10b981" />
                    <span>Organizer will manually cross-verify UTR against bank account statement before confirming.</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    {onBackToReview && (
                      <button type="button" onClick={onBackToReview} className="btn-secondary">
                        <ArrowLeft size={16} /> Back
                      </button>
                    )}

                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ flexGrow: 1, padding: '14px 24px', fontSize: '0.95rem' }}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'SUBMIT PAYMENT FOR VERIFICATION'}
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
