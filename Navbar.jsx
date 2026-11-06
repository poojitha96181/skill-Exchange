import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Avatar from './Avatar.jsx';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          ☰
        </button>
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="brand">
          <span className="brand-mark">SE</span>
          <span className="brand-text">SkillExchange</span>
        </Link>
      </div>
      <div className="navbar-right">
        {user?.role !== 'admin' && (
          <Link to="/notifications" className="notif-btn" aria-label="Notifications">
            ◈{unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
          </Link>
        )}
        <Link to={user?.role === 'admin' ? '/admin' : '/profile'} className="navbar-user">
          <Avatar user={user} size={34} />
          <span className="navbar-username">{user?.name?.split(' ')[0]}</span>
        </Link>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}