import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, User, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const schema = z
  .object({
    name:            z.string().min(2, 'Name must be at least 2 characters'),
    email:           z.string().min(1, 'Email is required').email('Enter a valid email'),
    password:        z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

function getStrength(pw) {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

function StrengthLabel({ score }) {
  if (!score) return null;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'var(--error)', 'var(--warning)', 'var(--info)', 'var(--success)'];
  return (
    <span style={{ fontSize: 11, color: colors[score], marginTop: 2, display: 'block' }}>
      {labels[score]}
    </span>
  );
}

export default function SignUp() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPw,   setShowPw]   = useState(false);
  const [showCpw,  setShowCpw]  = useState(false);
  const [pwValue,  setPwValue]  = useState('');

  const strength = getStrength(pwValue);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created! Check your email to verify.');
      navigate('/verify-email/pending');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Registration failed. Please try again.';
      toast.error(msg);
    }
  }

  const barClass = (index) => {
    if (strength === 0) return '';
    if (strength === 1) return index < 1 ? 'weak'   : '';
    if (strength === 2) return index < 2 ? 'fair'   : '';
    if (strength === 3) return index < 3 ? 'strong' : '';
    return 'strong';
  };

  return (
    <main className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb-2" aria-hidden="true" />

      <div className="auth-card fade-in" style={{ maxWidth: 480 }} role="main">
        <div className="auth-logo">
          <div className="auth-logo-icon" aria-hidden="true">
            <Zap size={22} />
          </div>
          <span className="auth-logo-name">Dayflow</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join your team on Dayflow HRMS</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Name */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="signup-name">Full name</label>
            <div className="input-wrapper has-icon-left">
              <User className="input-icon-left" size={16} aria-hidden="true" />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                className={`form-control${errors.name ? ' error' : ''}`}
                {...register('name')}
              />
            </div>
            {errors.name && <span className="form-error" role="alert">{errors.name.message}</span>}
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="signup-email">Email address</label>
            <div className="input-wrapper has-icon-left">
              <Mail className="input-icon-left" size={16} aria-hidden="true" />
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={`form-control${errors.email ? ' error' : ''}`}
                {...register('email')}
              />
            </div>
            {errors.email && <span className="form-error" role="alert">{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 8 }}>
            <label className="form-label" htmlFor="signup-password">Password</label>
            <div className="input-wrapper has-icon-left has-icon-right">
              <Lock className="input-icon-left" size={16} aria-hidden="true" />
              <input
                id="signup-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={`form-control${errors.password ? ' error' : ''}`}
                {...register('password', { onChange: (e) => setPwValue(e.target.value) })}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength bars */}
            {pwValue && (
              <div>
                <div className="password-strength" aria-label="Password strength">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`strength-bar ${barClass(i)}`} />
                  ))}
                </div>
                <StrengthLabel score={strength} />
              </div>
            )}
            {errors.password && <span className="form-error" role="alert">{errors.password.message}</span>}
          </div>

          {/* Confirm password */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" htmlFor="signup-confirm-password">Confirm password</label>
            <div className="input-wrapper has-icon-left has-icon-right">
              <Lock className="input-icon-left" size={16} aria-hidden="true" />
              <input
                id="signup-confirm-password"
                type={showCpw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat your password"
                className={`form-control${errors.confirmPassword ? ' error' : ''}`}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowCpw((s) => !s)}
                aria-label={showCpw ? 'Hide password' : 'Show password'}
              >
                {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="form-error" role="alert">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/signin" className="auth-link">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
