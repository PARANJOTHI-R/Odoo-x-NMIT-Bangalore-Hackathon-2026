import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyEmailOtp, sendVerifyOtp } from '../../services/authService';

export default function VerifyEmail() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function handleVerify(e) {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyEmailOtp(otp);
      if (data.success === false) {
          throw new Error(data.message || 'Invalid OTP');
      }
      setSuccess(true);
      toast.success('Email verified successfully!');
    } catch (err) {
      toast.error(err.message || err?.response?.data?.message || 'Verification failed. Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const data = await sendVerifyOtp();
      if (data.success === false) {
          throw new Error(data.message || 'Failed to resend OTP');
      }
      toast.success('A new OTP has been sent to your email.');
    } catch (err) {
      toast.error(err.message || err?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setResending(false);
    }
  }

  if (success) {
    return (
      <main className="auth-page">
        <div className="auth-bg-orb auth-bg-orb-1" aria-hidden="true" />
        <div className="auth-bg-orb auth-bg-orb-2" aria-hidden="true" />

        <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
          <div className="auth-logo" style={{ justifyContent: 'center', marginBottom: 24 }}>
            <div className="auth-logo-icon" aria-hidden="true">
              <Zap size={22} />
            </div>
            <span className="auth-logo-name">Dayflow</span>
          </div>

          <CheckCircle size={52} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
          <h1 className="auth-title">Email Verified!</h1>
          <p className="auth-subtitle" style={{ marginBottom: 24 }}>Your account is now verified.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ width: '100%' }}>
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb-2" aria-hidden="true" />

      <div className="auth-card fade-in">
        <div className="auth-logo" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <div className="auth-logo-icon" aria-hidden="true">
            <Zap size={22} />
          </div>
          <span className="auth-logo-name">Dayflow</span>
        </div>

        <h1 className="auth-title" style={{ textAlign: 'center' }}>Verify Your Email</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: 24 }}>
          Please enter the 6-digit OTP sent to your email.
        </p>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label" htmlFor="otp-input">Verification OTP</label>
            <input
              id="otp-input"
              type="text"
              className="form-control"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              autoComplete="one-time-code"
              style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem', fontWeight: 600 }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }} disabled={loading || otp.length < 6}>
            {loading ? <><Loader size={16} className="spinner" /> Verifying...</> : 'Verify Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 14 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Didn't receive the code? </span>
          <button
            onClick={handleResend}
            disabled={resending}
            style={{ background: 'none', border: 'none', color: 'var(--brand-500)', fontWeight: 500, cursor: 'pointer', padding: 0 }}
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
    </main>
  );
}
