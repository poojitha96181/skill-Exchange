import { Link, NavLink } from 'react-router-dom';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

const studentLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/profile', label: 'My Profile', icon: '◉' },
  { to: '/skills', label: 'My Skills', icon: '✦' },
  { to: '/students', label: 'Explore Students', icon: '◎' },
  { to: '/requests', label: 'Exchange Requests', icon: '⇄' },
  { to: '/messages', label: 'Messages', icon: '✉' },
  { to: '/notifications', label: 'Notifications', icon: '◈' },
];

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: '▦', end: true },
  { to: '/admin/users', label: 'Students', icon: '◉' },
  { to: '/admin/skills', label: 'Skills', icon: '✦' },
  { to: '/admin/requests', label: 'Requests', icon: '⇄' },
  { to: '/admin/reports', label: 'Reports', icon: '⚑' },
];

export default function Sidebar({ admin = false, open, onClose }) {
  const { unreadCount } = useSocket();
  const { user } = useAuth();
  const links = admin ? adminLinks : studentLinks;

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-profile">
          <Avatar user={user} size={52} />
          <div>
            <div className="sidebar-name">{user?.name}</div>
            <div className="sidebar-role">{admin ? 'Administrator' : user?.department || 'Student'}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-icon">{l.icon}</span>
              <span>{l.label}</span>
              {!admin && l.to === '/notifications' && unreadCount > 0 && (
                <span className="badge-count">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
        {!admin && (
          <Link to="/students" className="sidebar-cta" onClick={onClose}>
            Find a skill partner
          </Link>
        )}
      </aside>
    </>
  );
}