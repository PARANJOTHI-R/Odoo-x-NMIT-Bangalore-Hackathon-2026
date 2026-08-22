import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, UserCircle, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';

const PAGE_TITLES = {
  '/dashboard':          'Dashboard',
  '/admin/dashboard':    'Admin Dashboard',
  '/attendance':         'Attendance',
  '/admin/attendance':   'Attendance Overview',
  '/leave':              'Leave Management',
  '/admin/leave':        'Leave Approvals',
  '/payroll':            'Payroll',
  '/admin/payroll':      'Payroll Management',
  '/profile':            'My Profile',
  '/admin/employees':    'Employee Management',
};

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] || 'Dayflow';

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    logout();
    navigate('/signin', { replace: true });
  }

  return (
    <header className="navbar" role="banner">
      {/* Mobile hamburger */}
      <button
        id="sidebar-toggle-btn"
        className="navbar-menu-btn"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
        type="button"
      >
        <Menu size={20} />
      </button>

      <span className="navbar-title">{title}</span>

      <div className="navbar-spacer" />

      <div className="navbar-actions">
        <NotificationBell />

        {/* User menu */}
        <div className="user-menu" ref={menuRef}>
          <button
            id="user-menu-btn"
            className="navbar-avatar"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="User menu"
            aria-expanded={menuOpen}
            type="button"
          >
            {initials(user?.name || user?.email || 'U')}
          </button>

          {menuOpen && (
            <div className="user-menu-dropdown" role="menu">
              <div className="user-menu-header">
                <div className="user-menu-name">{user?.name || 'User'}</div>
                <div className="user-menu-email">{user?.email}</div>
              </div>

              <button
                className="user-menu-item"
                role="menuitem"
                onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                type="button"
              >
                <UserCircle size={15} />
                My Profile
              </button>

              <button
                className="user-menu-item"
                role="menuitem"
                onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                type="button"
              >
                <Settings size={15} />
                Settings
              </button>

              <hr className="user-menu-divider" />

              <button
                className="user-menu-item danger"
                role="menuitem"
                onClick={handleLogout}
                type="button"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
