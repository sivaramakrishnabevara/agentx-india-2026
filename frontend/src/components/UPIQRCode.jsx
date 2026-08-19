import React from 'react';
import { QrCode } from 'lucide-react';

export default function UPIQRCode({ upiId = "9618164396-3@ybl", displayName = "agentx2026", amount = 199, customQrUrl = null }) {
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(displayName)}&am=${amount}&cu=INR`;
  const qrImageUrl = customQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiDeepLink)}&margin=10`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px',
      background: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      maxWidth: '280px',
      margin: '0 auto'
    }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: 800,
        color: '#0f172a',
        fontSize: '0.9rem',
        marginBottom: '16px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }}>
        <QrCode size={20} color="#06b6d4" /> Scan & Pay ₹{amount}
      </div>

      {/* QR Code Frame */}
      <div style={{
        padding: '12px',
        background: '#ffffff',
        border: '3px solid #06b6d4',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '14px'
      }}>
        <img 
          src={qrImageUrl} 
          alt={`UPI Payment QR Code for ₹${amount}`}
          style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '8px' }}
        />
      </div>

      {/* Accepted UPI Apps Badge */}
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#475569',
        textAlign: 'center'
      }}>
        Accepts BHIM, GPay, PhonePe, Paytm & Bank UPI Apps
      </div>
    </div>
  );
}
