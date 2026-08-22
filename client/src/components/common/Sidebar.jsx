import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  UserCircle,
  Zap,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const EMPLOYEE_LINKS = [
  { to: '/dashboard',   label: 'Dashboard',  Icon: LayoutDashboard },
  { to: '/attendance',  label: 'Attendance', Icon: CalendarCheck   },
  { to: '/leave',       label: 'Leave',      Icon: CalendarDays    },
  { to: '/payroll',     label: 'Payroll',    Icon: CreditCard       },
  { to: '/profile',     label: 'Profile',    Icon: UserCircle       },
];

const ADMIN_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard',       Icon: LayoutDashboard },
  { to: '/admin/employees', label: 'Employees',       Icon: Users           },
  { to: '/admin/attendance',label: 'Attendance',      Icon: CalendarCheck   },
  { to: '/admin/leave',     label: 'Leave Management',Icon: CalendarDays    },
  { to: '/admin/payroll',   label: 'Payroll',         Icon: CreditCard      },
  { to: '/profile',         label: 'Profile',         Icon: UserCircle      },
];

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const links   = isAdmin ? ADMIN_LINKS : EMPLOYEE_LINKS;

  function handleLogout() {
    logout();
    navigate('/signin', { replace: true });
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${open ? ' visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" aria-hidden="true">
            <Zap size={20} />
          </div>
          <div>
            <div className="sidebar-logo-text">Dayflow</div>
            <div className="sidebar-logo-sub">HRMS</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {isAdmin && (
            <div className="sidebar-section-label">Admin Panel</div>
          )}

          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
              onClick={onClose}
              aria-label={label}
            >
              <Icon className="sidebar-link-icon" size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          {isAdmin && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                marginBottom: 8,
                fontSize: 11,
                color: 'var(--brand-400)',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              <ShieldCheck size={13} />
              Admin
            </div>
          )}
          <div className="sidebar-user">
            <div className="sidebar-avatar" aria-hidden="true">
              {initials(user?.name || user?.email || 'U')}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-role">{user?.role || 'Employee'}</div>
            </div>
            <button
              className="sidebar-link-icon"
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', padding: 4, color: 'var(--text-sidebar)', cursor: 'pointer' }}
              title="Logout"
              type="button"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
