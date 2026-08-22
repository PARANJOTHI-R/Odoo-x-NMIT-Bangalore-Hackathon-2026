import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook to consume the Dayflow AuthContext.
 * Must be used inside <AuthProvider>.
 *
 * @returns {{
 *   user: object|null,
 *   token: string|null,
 *   isAuthenticated: boolean,
 *   loading: boolean,
 *   initialising: boolean,
 *   login: (email: string, password: string) => Promise<{success: boolean, user: object}>,
 *   register: (name: string, email: string, password: string) => Promise<{success: boolean, data: object}>,
 *   logout: () => void,
 *   refreshUser: (updatedUser: object) => void,
 * }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
