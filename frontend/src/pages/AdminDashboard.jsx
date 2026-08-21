import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { 
  Users, CreditCard, Award, DollarSign, Download, Filter, Search, 
  RefreshCw, LogOut, CheckCircle2, XCircle, AlertTriangle, Settings, 
  FileSpreadsheet, Shield, FileText, ChevronRight, Eye, Edit, Trash2,
  Clock, Check, X, Image, Upload, Copy, Mail
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('payments'); // payments | teams | certificates | settings | audit

  // Metrics
  const [metrics, setMetrics] = useState({
    total_teams: 0,
    confirmed_teams: 0,
    pending_payments: 0,
    verified_payments: 0,
    rejected_payments: 0,
    teams_remaining: 100,
    total_verified_revenue: 0,
    participants_count: 0,
    certificates_count: 0,
    max_teams: 100
  });

  // Team Management State
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);

  // Payments & Manual Verification State
  const [payments, setPayments] = useState([]);
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [screenshotModal, setScreenshotModal] = useState(null);

  // View Details Modal State
  const [viewDetailsData, setViewDetailsData] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');

  // Certificates State
  const [certificates, setCertificates] = useState([]);
  const [bulkGenProgress, setBulkGenProgress] = useState(null);

  // Event Settings State
  const [settingsForm, setSettingsForm] = useState({
    event_name: 'AGENTX INDIA 2026',
    tagline: 'Build. Automate. Impact.',
    event_date: '30 August 2026',
    max_teams: 100,
    fee_per_team: 199.0,
    upi_id: '9618164396-3@ybl',
    upi_display_name: 'agentx2026',
    payment_qr_image: null,
    official_email: 'sivaramakrishna54599@gmail.com',
    official_phone: '+91 98765 43210',
    refund_policy: 'Registration fee of ₹199 per team is non-refundable once paid.'
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  const loadMetrics = () => {
    api.getAdminMetrics()
      .then(res => setMetrics(res))
      .catch(err => {
        if (err.message.includes('401') || err.message.includes('credentials')) {
          api.adminLogout();
          navigate('/admin/login');
        }
      });
  };

  const loadTeams = () => {
    setLoading(true);
    api.getAdminTeams(searchQuery, statusFilter)
      .then(res => setTeams(res.teams || []))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  };

  const loadPayments = () => {
    api.getAdminPayments().then(res => setPayments(res)).catch(err => console.log(err));
  };

  const loadCertificates = () => {
    api.getAdminCertificates().then(res => setCertificates(res)).catch(err => console.log(err));
  };

  const loadSettings = () => {
    api.getEventInfo().then(res => setSettingsForm(res)).catch(err => console.log(err));
  };

  const loadAuditLogs = () => {
    api.getAuditLogs().then(res => setAuditLogs(res)).catch(err => console.log(err));
  };

  useEffect(() => {
    loadMetrics();
    loadPayments();
    loadTeams();
  }, []);

  useEffect(() => {
    if (activeTab === 'teams') loadTeams();
    if (activeTab === 'payments') loadPayments();
    if (activeTab === 'certificates') loadCertificates();
    if (activeTab === 'settings') loadSettings();
    if (activeTab === 'audit') loadAuditLogs();
  }, [activeTab, searchQuery, statusFilter]);

  const handleExportCSV = async () => {
    try {
      const blob = await api.exportTeamsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AGENTX_2026_Teams_Export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const handleVerifyPayment = async (paymentId, teamName, utr) => {
    if (!window.confirm(`Verify payment of ₹199 for team "${teamName}" (UTR: ${utr})?\nThis will set status to CONFIRMED and assign permanent Team ID (AX001..AX100).`)) {
      return;
    }

    try {
      const res = await api.adminVerifyPayment(paymentId);
      alert(`✅ Payment Verified Successfully!\nTeam ID Assigned: ${res.team_id}`);
      loadPayments();
      loadTeams();
      loadMetrics();
    } catch (err) {
      alert('Verification Failed: ' + err.message);
    }
  };

  const handleOpenRejectModal = (p) => {
    setRejectingPayment(p);
    setRejectionReason('');
  };

  const handleConfirmRejectPayment = async (e) => {
    e.preventDefault();
    if (!rejectingPayment) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      await api.adminRejectPayment(rejectingPayment.id, rejectionReason.trim());
      alert(`Payment for "${rejectingPayment.team_name}" marked as REJECTED.`);
      setRejectingPayment(null);
      loadPayments();
      loadTeams();
      loadMetrics();
    } catch (err) {
      alert('Rejection Failed: ' + err.message);
    }
  };

  const handleViewScreenshot = async (paymentId) => {
    try {
      const blob = await api.getPaymentScreenshotBlob(paymentId);
      const imageUrl = URL.createObjectURL(blob);
      setScreenshotModal(imageUrl);
    } catch (err) {
      alert('Failed to view screenshot: ' + err.message);
    }
  };

  const handleOpenViewDetails = async (registrationId) => {
    try {
      const data = await api.getTeamDetails(registrationId);
      setViewDetailsData(data);
      setCopyStatus('');
    } catch (err) {
      alert('Failed to fetch team details: ' + err.message);
    }
  };

  const handleCopyEmail = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(''), 2500);
  };

  const handleUpdateStatus = async (registrationId, newStatus) => {
    if (!window.confirm(`Change status of registration #${registrationId} to ${newStatus}?`)) return;
    try {
      await api.updateTeamStatus(registrationId, newStatus);
      loadTeams();
      loadMetrics();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  const handleGenerateBulkCerts = async () => {
    if (!window.confirm('Generate participation certificates for all CONFIRMED teams?')) return;
    setBulkGenProgress('Generating certificates...');
    try {
      const res = await api.generateBulkCertificates('PARTICIPATION');
      setBulkGenProgress(`Completed: ${res.message}`);
      loadCertificates();
      loadMetrics();
    } catch (err) {
      setBulkGenProgress('Error generating certificates.');
      alert('Bulk generation error: ' + err.message);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(settingsForm);
      alert('Event Settings updated successfully!');
      loadMetrics();
    } catch (err) {
      alert('Failed to update settings: ' + err.message);
    }
  };

  const handleQRImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('qr_file', file);
      const res = await api.uploadQRImage(formData);
      alert('Payment QR Code image uploaded successfully!');
      setSettingsForm(prev => ({ ...prev, payment_qr_image: res.qr_url }));
    } catch (err) {
      alert('QR upload failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    api.adminLogout();
    navigate('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#06080e' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '140px', paddingBottom: '100px', flexGrow: 1 }}>
        
        {/* Admin Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: '#f59e0b' }}>
              <Shield size={14} /> System Administrator
            </span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
              AGENTX INDIA 2026 <span className="gradient-text">Admin Dashboard</span>
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleExportCSV} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              <FileSpreadsheet size={16} color="#10b981" /> Export CSV
            </button>

            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem', color: '#f87171' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Analytics Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
          
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#38bdf8', marginBottom: '8px' }}>
              <Users size={22} /> <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TOTAL TEAMS</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff' }}>{metrics.total_teams}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{metrics.participants_count} Participants</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#10b981', marginBottom: '8px' }}>
              <CheckCircle2 size={22} /> <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CONFIRMED TEAMS</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399' }}>{metrics.confirmed_teams} / {metrics.max_teams}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{metrics.teams_remaining} Slots Remaining</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f59e0b', marginBottom: '8px' }}>
              <Clock size={22} /> <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PENDING VERIFICATION</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fbbf24' }}>{metrics.pending_payments}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Awaiting Admin Review</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#10b981', marginBottom: '8px' }}>
              <DollarSign size={22} /> <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>VERIFIED REVENUE</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>₹{metrics.total_verified_revenue}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{metrics.verified_payments} Verified @ ₹199</div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {[
            { id: 'payments', label: `UPI Payments (${metrics.pending_payments} Pending)`, icon: CreditCard },
            { id: 'teams', label: `Teams Management (${metrics.total_teams})`, icon: Users },
            { id: 'certificates', label: 'Certificates Engine', icon: Award },
            { id: 'settings', label: 'Event Settings', icon: Settings },
            { id: 'audit', label: 'Audit Logs', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn-secondary"
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                borderColor: activeTab === tab.id ? '#06b6d4' : 'transparent',
                background: activeTab === tab.id ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8'
              }}
            >
              <tab.icon size={16} color={activeTab === tab.id ? '#06b6d4' : '#94a3b8'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: UPI PAYMENTS MANUAL VERIFICATION */}
        {activeTab === 'payments' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                UPI Payments Verification Queue
              </h2>

              <button onClick={loadPayments} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <RefreshCw size={14} /> Refresh Queue
              </button>
            </div>

            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                No payment submissions recorded yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>Reg ID</th>
                      <th style={{ padding: '12px' }}>Team Name & ID</th>
                      <th style={{ padding: '12px' }}>Members</th>
                      <th style={{ padding: '12px' }}>UTR / Trans ID</th>
                      <th style={{ padding: '12px' }}>Amount</th>
                      <th style={{ padding: '12px' }}>Screenshot</th>
                      <th style={{ padding: '12px' }}>Submitted At</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #0f172a' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#cbd5e1' }}>#{p.registration_id}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 800, color: '#ffffff' }}>{p.team_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>{p.team_id || 'ID Pending'}</div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                          <div>1. {p.member1_name}</div>
                          <div>2. {p.member2_name}</div>
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 800, color: '#f59e0b' }}>
                          {p.utr}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 800, color: '#10b981' }}>
                          ₹{p.amount}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {p.has_screenshot ? (
                            <button onClick={() => handleViewScreenshot(p.id)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}>
                              <Image size={12} /> View Image
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                          {p.submitted_at ? new Date(p.submitted_at).toLocaleString() : 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className="badge-tag" style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            background: p.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.15)' : (p.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'),
                            color: p.status === 'VERIFIED' ? '#34d399' : (p.status === 'REJECTED' ? '#f87171' : '#fbbf24'),
                            borderColor: p.status === 'VERIFIED' ? '#10b981' : (p.status === 'REJECTED' ? '#ef4444' : '#f59e0b')
                          }}>
                            {p.status}
                          </span>
                          {p.rejection_reason && (
                            <div style={{ fontSize: '0.7rem', color: '#f87171', marginTop: '4px' }}>{p.rejection_reason}</div>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => handleOpenViewDetails(p.registration_id)}
                              className="btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                            >
                              <Eye size={14} /> Details
                            </button>
                            {p.status === 'PENDING' ? (
                              <>
                                <button 
                                  onClick={() => handleVerifyPayment(p.id, p.team_name, p.utr)}
                                  className="btn-primary" 
                                  style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#10b981', borderColor: '#10b981' }}
                                >
                                  <Check size={14} /> VERIFY
                                </button>
                                <button 
                                  onClick={() => handleOpenRejectModal(p)}
                                  className="btn-secondary" 
                                  style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.4)' }}
                                >
                                  <X size={14} /> REJECT
                                </button>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TEAMS MANAGEMENT */}
        {activeTab === 'teams' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', flexGrow: 1, maxWidth: '600px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by team name, ID, college..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>

                <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '180px' }}>
                  <option value="">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PAYMENT_VERIFICATION">VERIFICATION PENDING</option>
                  <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <th style={{ padding: '12px' }}>Team ID</th>
                    <th style={{ padding: '12px' }}>Team Name</th>
                    <th style={{ padding: '12px' }}>College / Location</th>
                    <th style={{ padding: '12px' }}>Track</th>
                    <th style={{ padding: '12px' }}>Members</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #0f172a' }}>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{t.team_id}</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#ffffff' }}>{t.team_name}</td>
                      <td style={{ padding: '12px', color: '#cbd5e1', fontSize: '0.85rem' }}>{t.college} ({t.city})</td>
                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.85rem' }}>{t.track_title}</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                        <div>1. {t.member1?.name}</div>
                        <div>2. {t.member2?.name}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className="badge-tag" style={{ fontSize: '0.75rem' }}>{t.status}</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button 
                            onClick={() => handleOpenViewDetails(t.id)}
                            className="btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                          >
                            <Eye size={14} /> View Details
                          </button>
                          <select 
                            className="form-select" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }}
                            value={t.status}
                            onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PAYMENT_VERIFICATION">VERIFICATION PENDING</option>
                            <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                Bulk Certificate Generator
              </h2>

              <button onClick={handleGenerateBulkCerts} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                <Award size={16} /> Bulk Generate Participation Certificates
              </button>
            </div>

            {bulkGenProgress && (
              <div style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#38bdf8', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px' }}>
                {bulkGenProgress}
              </div>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <th style={{ padding: '12px' }}>Certificate ID</th>
                    <th style={{ padding: '12px' }}>Participant Name</th>
                    <th style={{ padding: '12px' }}>Team Name & ID</th>
                    <th style={{ padding: '12px' }}>Type</th>
                    <th style={{ padding: '12px' }}>Generated Date</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #0f172a' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>{c.certificate_id}</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#ffffff' }}>{c.participant_name}</td>
                      <td style={{ padding: '12px', color: '#cbd5e1' }}>{c.team_name} ({c.team_id})</td>
                      <td style={{ padding: '12px' }}><span className="badge-tag" style={{ fontSize: '0.75rem' }}>{c.certificate_type}</span></td>
                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(c.generated_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EVENT SETTINGS */}
        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '700px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '24px' }}>
              Global Event & UPI Settings
            </h2>

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label">Event Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settingsForm.event_name || ''} 
                  onChange={e => setSettingsForm({ ...settingsForm, event_name: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Fee Per Team (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={settingsForm.fee_per_team || 199.0} 
                    onChange={e => setSettingsForm({ ...settingsForm, fee_per_team: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Teams Cap</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={settingsForm.max_teams || 100} 
                    onChange={e => setSettingsForm({ ...settingsForm, max_teams: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">UPI ID *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={settingsForm.upi_id || ''} 
                    onChange={e => setSettingsForm({ ...settingsForm, upi_id: e.target.value })}
                    placeholder="e.g. 9618164396-3@ybl"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">UPI Display Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={settingsForm.upi_display_name || ''} 
                    onChange={e => setSettingsForm({ ...settingsForm, upi_display_name: e.target.value })}
                    placeholder="e.g. agentx2026"
                  />
                </div>
              </div>

              {/* Upload Organizer QR Image */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Upload Custom Payment QR Image</label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleQRImageUpload}
                  className="form-input"
                />
                {settingsForm.payment_qr_image && (
                  <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '6px' }}>
                    Active custom QR image loaded
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary">Save Settings</button>
            </form>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '20px' }}>
              System Audit Logs
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>Log ID</th>
                    <th style={{ padding: '10px' }}>Admin</th>
                    <th style={{ padding: '10px' }}>Action</th>
                    <th style={{ padding: '10px' }}>Details</th>
                    <th style={{ padding: '10px' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #0f172a' }}>
                      <td style={{ padding: '10px', color: '#64748b' }}>#{log.id}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#ffffff' }}>{log.admin_username}</td>
                      <td style={{ padding: '10px' }}><span className="badge-tag" style={{ fontSize: '0.7rem' }}>{log.action}</span></td>
                      <td style={{ padding: '10px', color: '#cbd5e1' }}>{log.details}</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: REJECT PAYMENT WITH REASON */}
        {rejectingPayment && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171', marginBottom: '12px' }}>
                Reject Payment for Team "{rejectingPayment.team_name}"
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '20px' }}>
                Please specify the reason for rejecting this payment submission (e.g., UTR not found in bank statement, incorrect amount paid).
              </p>

              <form onSubmit={handleConfirmRejectPayment}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Rejection Reason *</label>
                  <textarea 
                    className="form-input" 
                    rows={3} 
                    placeholder="e.g. UTR 423891028341 not received in bank account statement."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setRejectingPayment(null)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SCREENSHOT PREVIEW */}
        {screenshotModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div className="glass-panel" style={{ maxWidth: '600px', padding: '24px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Payment Screenshot</h3>
                <button onClick={() => setScreenshotModal(null)} className="btn-secondary" style={{ padding: '4px 10px' }}>✕</button>
              </div>

              <img 
                src={screenshotModal} 
                alt="Payment Screenshot" 
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px', border: '1px solid #1e293b' }} 
              />
            </div>
          </div>
        )}

        {/* MODAL: VIEW DETAILS */}
        {viewDetailsData && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div className="glass-panel" style={{
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              position: 'relative'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
                <div>
                  <span className="badge-tag" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', borderColor: '#06b6d4', marginBottom: '6px' }}>
                    Registration #{viewDetailsData.id} Details
                  </span>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    {viewDetailsData.team_name}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                    Sequential Team ID: <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.95rem' }}>{viewDetailsData.team_id || 'N/A (Pending Verification)'}</strong>
                  </div>
                </div>
                <button onClick={() => setViewDetailsData(null)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>✕ Close</button>
              </div>

              {/* Copy Email Control Bar */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="#06b6d4" /> Email Copy Controls (Clipboard Only — Manual Contact)
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(viewDetailsData.member1?.email, 'm1')}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px', color: copyStatus === 'm1' ? '#34d399' : '#e2e8f0', borderColor: copyStatus === 'm1' ? '#10b981' : '#334155' }}
                  >
                    {copyStatus === 'm1' ? <Check size={14} /> : <Copy size={14} />} Copy Member 1 Email
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(viewDetailsData.member2?.email, 'm2')}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px', color: copyStatus === 'm2' ? '#34d399' : '#e2e8f0', borderColor: copyStatus === 'm2' ? '#10b981' : '#334155' }}
                  >
                    {copyStatus === 'm2' ? <Check size={14} /> : <Copy size={14} />} Copy Member 2 Email
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(`${viewDetailsData.member1?.email || ''}, ${viewDetailsData.member2?.email || ''}`, 'both')}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px', background: copyStatus === 'both' ? '#10b981' : 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                  >
                    {copyStatus === 'both' ? <Check size={14} /> : <Copy size={14} />} Copy Both Emails
                  </button>
                </div>
                {copyStatus && (
                  <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '8px', fontWeight: 600 }}>
                    ✓ Email address(es) copied to clipboard successfully!
                  </div>
                )}
              </div>

              {/* Information Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                
                {/* Team Information */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    TEAM INFORMATION
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                    <div><span style={{ color: '#94a3b8' }}>Team Name:</span> <strong style={{ color: '#ffffff' }}>{viewDetailsData.team_name}</strong></div>
                    <div><span style={{ color: '#94a3b8' }}>Team ID:</span> <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{viewDetailsData.team_id || 'N/A'}</strong></div>
                    <div><span style={{ color: '#94a3b8' }}>Track ID:</span> <strong style={{ color: '#ffffff' }}>#{viewDetailsData.track_id} — {viewDetailsData.track_title}</strong></div>
                    <div><span style={{ color: '#94a3b8' }}>College / Inst.:</span> <span style={{ color: '#e2e8f0' }}>{viewDetailsData.college}</span></div>
                    <div><span style={{ color: '#94a3b8' }}>Location:</span> <span style={{ color: '#e2e8f0' }}>{viewDetailsData.city}, {viewDetailsData.state}</span></div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Registration Status:</span>{' '}
                      <span className="badge-tag" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{viewDetailsData.status}</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Payment Status:</span>{' '}
                      <span className="badge-tag" style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        background: viewDetailsData.payment_status === 'VERIFIED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: viewDetailsData.payment_status === 'VERIFIED' ? '#34d399' : '#fbbf24'
                      }}>
                        {viewDetailsData.payment_status}
                      </span>
                    </div>
                    <div><span style={{ color: '#94a3b8' }}>Registration Date:</span> <span style={{ color: '#cbd5e1' }}>{viewDetailsData.created_at ? new Date(viewDetailsData.created_at).toLocaleString() : 'N/A'}</span></div>
                  </div>
                </div>

                {/* Payment Information */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    PAYMENT INFORMATION
                  </h4>
                  {viewDetailsData.payment ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                      <div><span style={{ color: '#94a3b8' }}>Payment ID:</span> <strong style={{ color: '#ffffff' }}>#{viewDetailsData.payment.id}</strong></div>
                      <div><span style={{ color: '#94a3b8' }}>UTR / Trans ID:</span> <strong style={{ color: '#f59e0b', fontFamily: 'monospace', fontSize: '0.95rem' }}>{viewDetailsData.payment.utr}</strong></div>
                      <div><span style={{ color: '#94a3b8' }}>Amount:</span> <strong style={{ color: '#10b981' }}>₹{viewDetailsData.payment.amount}</strong> ({viewDetailsData.payment.payment_method})</div>
                      <div>
                        <span style={{ color: '#94a3b8' }}>Payment Status:</span>{' '}
                        <span className="badge-tag" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{viewDetailsData.payment.status}</span>
                      </div>
                      <div><span style={{ color: '#94a3b8' }}>Payment Submitted Date:</span> <span style={{ color: '#cbd5e1' }}>{viewDetailsData.payment.submitted_at ? new Date(viewDetailsData.payment.submitted_at).toLocaleString() : 'N/A'}</span></div>
                      <div><span style={{ color: '#94a3b8' }}>Payment Verified Date:</span> <span style={{ color: '#cbd5e1' }}>{viewDetailsData.payment.verified_at ? new Date(viewDetailsData.payment.verified_at).toLocaleString() : 'Not Verified'}</span></div>
                      {viewDetailsData.payment.verified_by && (
                        <div><span style={{ color: '#94a3b8' }}>Verified By:</span> <span style={{ color: '#38bdf8' }}>{viewDetailsData.payment.verified_by}</span></div>
                      )}
                      {viewDetailsData.payment.has_screenshot && (
                        <div style={{ marginTop: '4px' }}>
                          <button onClick={() => handleViewScreenshot(viewDetailsData.payment.id)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}>
                            <Image size={12} /> View Screenshot
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No payment submission record found.</div>
                  )}
                </div>

              </div>

              {/* Members Information */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                
                {/* Member 1 */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    MEMBER 1 (Team Leader)
                  </h4>
                  {viewDetailsData.member1 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                      <div><span style={{ color: '#94a3b8' }}>Name:</span> <strong style={{ color: '#ffffff' }}>{viewDetailsData.member1.name}</strong></div>
                      <div><span style={{ color: '#94a3b8' }}>Email:</span> <strong style={{ color: '#38bdf8' }}>{viewDetailsData.member1.email}</strong></div>
                      <div><span style={{ color: '#94a3b8' }}>Phone number:</span> <span style={{ color: '#e2e8f0' }}>{viewDetailsData.member1.phone || 'N/A'}</span></div>
                      <div><span style={{ color: '#94a3b8' }}>College/institution:</span> <span style={{ color: '#e2e8f0' }}>{viewDetailsData.member1.college || 'N/A'}</span></div>
                      {viewDetailsData.member1.github && (
                        <div><span style={{ color: '#94a3b8' }}>GitHub:</span> <a href={viewDetailsData.member1.github} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>{viewDetailsData.member1.github}</a></div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#64748b' }}>Member 1 details unavailable</div>
                  )}
                </div>

                {/* Member 2 */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    MEMBER 2 (Teammate)
                  </h4>
                  {viewDetailsData.member2 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                      <div><span style={{ color: '#94a3b8' }}>Name:</span> <strong style={{ color: '#ffffff' }}>{viewDetailsData.member2.name}</strong></div>
                      <div><span style={{ color: '#94a3b8' }}>Email:</span> <strong style={{ color: '#38bdf8' }}>{viewDetailsData.member2.email}</strong></div>
                      <div><span style={{ color: '#94a3b8' }}>Phone number:</span> <span style={{ color: '#e2e8f0' }}>{viewDetailsData.member2.phone || 'N/A'}</span></div>
                      <div><span style={{ color: '#94a3b8' }}>College/institution:</span> <span style={{ color: '#e2e8f0' }}>{viewDetailsData.member2.college || 'N/A'}</span></div>
                      {viewDetailsData.member2.github && (
                        <div><span style={{ color: '#94a3b8' }}>GitHub:</span> <a href={viewDetailsData.member2.github} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>{viewDetailsData.member2.github}</a></div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#64748b' }}>Member 2 details unavailable</div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
