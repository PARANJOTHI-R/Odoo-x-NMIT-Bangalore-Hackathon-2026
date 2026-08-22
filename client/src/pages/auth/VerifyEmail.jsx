import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Zap, Mail } from 'lucide-react';
import { verifyEmail } from '../../services/authService';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status,  setStatus]  = useState('loading'); // loading | success | error | pending
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 'pending' is a placeholder route when user just signed up
    if (!token || token === 'pending') {
      setStatus('pending');
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err?.response?.data?.message ||
          'This link is invalid or has expired. Please request a new verification email.'
        );
      });
  }, [token]);

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

        {status === 'loading' && (
          <>
            <Loader
              size={52}
              style={{ color: 'var(--brand-400)', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}
            />
            <h1 className="auth-title">Verifying your email…</h1>
            <p className="auth-subtitle">Please wait while we confirm your address.</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(97,114,243,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Mail size={32} style={{ color: 'var(--brand-400)' }} />
            </div>
            <h1 className="auth-title">Check your inbox</h1>
            <p className="auth-subtitle" style={{ marginBottom: 24 }}>
              We sent a verification link to your email address. Click it to activate your account.
            </p>
            <Link to="/signin" className="btn btn-primary" id="verify-go-signin-btn">
              Go to Sign In
            </Link>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle
              size={52}
              style={{ color: 'var(--success)', margin: '0 auto 16px' }}
            />
            <h1 className="auth-title">Email Verified!</h1>
            <p className="auth-subtitle" style={{ marginBottom: 24 }}>{message}</p>
            <Link to="/signin" className="btn btn-primary" id="verify-success-signin-btn">
              Sign In to your account
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle
              size={52}
              style={{ color: 'var(--error)', margin: '0 auto 16px' }}
            />
            <h1 className="auth-title">Verification Failed</h1>
            <p className="auth-subtitle" style={{ marginBottom: 24 }}>{message}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-secondary" id="verify-retry-btn">
                Register again
              </Link>
              <Link to="/signin" className="btn btn-primary" id="verify-error-signin-btn">
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
