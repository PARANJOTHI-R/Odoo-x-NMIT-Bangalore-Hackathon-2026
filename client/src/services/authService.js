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
 * Verify email address with token from link.
 * @param {string} token
 */
export async function verifyEmail(token) {
  const res = await api.get(`/api/auth/verify-email/${token}`);
  return res.data;
}
