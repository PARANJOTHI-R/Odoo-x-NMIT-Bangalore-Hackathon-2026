import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function SignIn() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const from = location.state?.from?.pathname || null;

  async function onSubmit(data) {
    try {
      const result = await login(data.email, data.password);
      toast.success(`Welcome back${result.user?.name ? `, ${result.user.name.split(' ')[0]}` : ''}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (result.user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Invalid email or password. Please try again.';
      toast.error(msg);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb-2" aria-hidden="true" />

      <div className="auth-card fade-in" role="main">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" aria-hidden="true">
            <Zap size={22} />
          </div>
          <span className="auth-logo-name">Dayflow</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your HRMS account</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="signin-email">Email address</label>
            <div className="input-wrapper has-icon-left">
              <Mail className="input-icon-left" size={16} aria-hidden="true" />
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={`form-control${errors.email ? ' error' : ''}`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <span className="form-error" role="alert">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" htmlFor="signin-password">Password</label>
            <div className="input-wrapper has-icon-left has-icon-right">
              <Lock className="input-icon-left" size={16} aria-hidden="true" />
              <input
                id="signin-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                className={`form-control${errors.password ? ' error' : ''}`}
                {...register('password')}
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
            {errors.password && (
              <span className="form-error" role="alert">{errors.password.message}</span>
            )}
          </div>

          <button
            id="signin-submit-btn"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="auth-link">Create one</Link>
        </p>
      </div>
    </main>
  );
}
