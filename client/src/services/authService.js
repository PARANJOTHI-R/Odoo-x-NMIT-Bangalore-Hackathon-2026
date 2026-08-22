import api from './api';

/**
 * Sign up a new user.
 * @param {{ name: string, email: string, password: string }} data
 */
export async function signup(data) {
  const res = await api.post('/api/auth/signup', data);
  return res.data;
}

/**
 * Sign in with email and password.
 * @param {{ email: string, password: string }} data
 * @returns {{ token: string, user: object }}
 */
export async function signin(data) {
  const res = await api.post('/api/auth/signin', data);
  return res.data;
}

/**
 * Request a new verification OTP.
 */
export async function sendVerifyOtp() {
  const res = await api.post('/api/auth/send-verify-otp');
  return res.data;
}

/**
 * Verify email address with OTP.
 * @param {string} otp
 */
export async function verifyEmailOtp(otp) {
  const res = await api.post('/api/auth/verify-account', { otp });
  return res.data;
}
