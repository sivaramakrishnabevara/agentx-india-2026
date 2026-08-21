const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim();
  if (import.meta.env.DEV) return 'http://127.0.0.1:8000';
  return '';
};

const API_BASE_URL = getApiBaseUrl();

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('agentx_admin_token');
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
  } catch (netErr) {
    throw new Error('Unable to connect to the server. Please make sure the backend is running.');
  }

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType && (contentType.includes('text/csv') || contentType.includes('application/pdf') || contentType.includes('image/png') || contentType.includes('image/jpeg') || contentType.includes('image/webp'))) {
    return response.blob();
  } else {
    data = await response.text();
    if (typeof data === 'string' && data.trim().toLowerCase().startsWith('<!doctype')) {
      throw new Error('API endpoint returned HTML page instead of JSON response');
    }
  }

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: API Request Failed`;
    if (data && data.detail) {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMsg = data.detail
          .map(err => {
            if (typeof err === 'string') return err;
            if (err && typeof err === 'object') {
              const field = Array.isArray(err.loc) ? err.loc.filter(l => l !== 'body' && l !== 'query').join(' -> ') : '';
              const msg = err.msg || JSON.stringify(err);
              return field ? `${field}: ${msg}` : msg;
            }
            return String(err);
          })
          .join('; ');
      } else if (typeof data.detail === 'object') {
        errorMsg = data.detail.msg || data.detail.message || JSON.stringify(data.detail);
      }
    } else if (typeof data === 'string' && data.trim()) {
      errorMsg = data;
    } else if (data && (data.message || data.error)) {
      errorMsg = data.message || data.error;
    }
    throw new Error(errorMsg);
  }

  return data;
}

export function formatApiError(err) {
  if (!err) return "An unexpected error occurred. Please try again.";
  
  const msgStr = typeof err === "string" ? err : (err.message || "");
  if (msgStr === "Failed to fetch" || msgStr.includes("NetworkError") || msgStr.includes("Failed to fetch") || msgStr.includes("Unable to connect")) {
    return "Unable to connect to the server. Please make sure the backend is running.";
  }

  if (typeof err === "string") return err;

  if (err.detail) {
    if (typeof err.detail === "string") return err.detail;
    if (Array.isArray(err.detail)) {
      return err.detail
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            const loc = Array.isArray(item.loc)
              ? item.loc.filter((l) => l !== "body" && l !== "query").join(" -> ")
              : "";
            const msg = item.msg || item.message || JSON.stringify(item);
            return loc ? `${loc}: ${msg}` : msg;
          }
          return String(item);
        })
        .join("; ");
    }
    if (typeof err.detail === "object") {
      return err.detail.msg || err.detail.message || JSON.stringify(err.detail);
    }
  }

  if (err.message && typeof err.message === "string" && err.message !== "[object Object]") {
    return err.message;
  }

  if (err.error && typeof err.error === "string") return err.error;
  if (err.statusText && typeof err.statusText === "string") return `HTTP ${err.status}: ${err.statusText}`;

  try {
    const jsonStr = JSON.stringify(err);
    if (jsonStr && jsonStr !== "{}" && jsonStr !== "[]") return jsonStr;
  } catch (e) {
    // fallback
  }

  const strRes = String(err);
  if (strRes && strRes !== "[object Object]") {
    return strRes;
  }

  return "An unexpected API error occurred. Please try again.";
}

export const api = {
  // Base URL exporter
  getApiBaseUrl: () => API_BASE_URL,

  // Public APIs
  getEventInfo: () => request('/api/public/event-info'),
  getTracks: () => request('/api/public/tracks'),
  getStats: () => request('/api/public/stats'),
  getFAQ: () => request('/api/public/faq'),

  // Registration & Payment APIs
  createRegistration: (data) => request('/api/registration/create', { method: 'POST', body: JSON.stringify(data) }),
  getRegistration: (id) => request(`/api/registration/${id}`),
  
  // UPI / UTR Payment APIs
  submitPaymentUTR: (formData) => request('/api/payments/submit-utr', { method: 'POST', body: formData }),
  getPaymentStatus: (registrationId) => request(`/api/payments/status/${registrationId}`),

  // Certificate Verification & Downloads
  verifyCertificate: (certificateId) => request(`/api/certificates/verify/${certificateId}`),
  getCertificateDownloadUrl: (certificateId, format = 'pdf') => `${API_BASE_URL}/api/certificates/download/${certificateId}/${format}`,

  // Admin APIs
  adminLogin: async (username, password) => {
    const res = await request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.access_token) {
      localStorage.setItem('agentx_admin_token', res.access_token);
      localStorage.setItem('agentx_admin_username', res.username);
    }
    return res;
  },
  adminLogout: () => {
    localStorage.removeItem('agentx_admin_token');
    localStorage.removeItem('agentx_admin_username');
  },
  getAdminMetrics: () => request('/api/admin/metrics'),
  getAdminTeams: (query = '', status = '', trackId = '', page = 1) => 
    request(`/api/admin/teams?query=${encodeURIComponent(query)}&status_filter=${status}&track_id=${trackId}&page=${page}`),
  getTeamDetails: (registrationId) => request(`/api/admin/teams/${registrationId}`),
  exportTeamsCSV: () => request('/api/admin/teams/export-csv'),
  updateTeamStatus: (registrationId, newStatus, trackId) => 
    request(`/api/admin/teams/${registrationId}/status?new_status=${newStatus}${trackId ? `&track_id=${trackId}` : ''}`, { method: 'PUT' }),
  
  // Admin Payment Verification & Rejection
  getAdminPayments: () => request('/api/admin/payments'),
  adminVerifyPayment: (paymentId, adminNote = '') => 
    request(`/api/admin/payments/${paymentId}/verify`, { method: 'POST', body: JSON.stringify({ payment_id: paymentId, admin_note: adminNote }) }),
  adminRejectPayment: (paymentId, rejectionReason, adminNote = '') => 
    request(`/api/admin/payments/${paymentId}/reject`, { method: 'POST', body: JSON.stringify({ payment_id: paymentId, rejection_reason: rejectionReason, admin_note: adminNote }) }),
  getPaymentScreenshotBlob: (paymentId) => request(`/api/admin/payments/${paymentId}/screenshot`),

  generateBulkCertificates: (certificateType = 'PARTICIPATION') => 
    request(`/api/admin/certificates/generate-bulk?certificate_type=${certificateType}`, { method: 'POST' }),
  getAdminCertificates: () => request('/api/admin/certificates/list'),
  updateSettings: (settingsData) => request('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settingsData) }),
  uploadQRImage: (formData) => request('/api/admin/settings/qr-upload', { method: 'POST', body: formData }),
  getAuditLogs: () => request('/api/admin/audit-logs')
};
