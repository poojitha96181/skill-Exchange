import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import useFetch from '../hooks/useFetch.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import StatCard from '../components/StatCard.jsx';
import SkillBadge from '../components/SkillBadge.jsx';
import Avatar from '../components/Avatar.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { notifications } = useSocket();
  const { data, loading, error } = useFetch('/users/dashboard');

  if (loading) return <Loader />;
  if (error) return <Alert>{error}</Alert>;

  const { skillsOffered, skillsWanted, stats, recentActivity } = data;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="page-sub">Here is what is happening with your skill exchanges.</p>
        </div>
        <Link to="/students" className="btn btn-primary">Find Students</Link>
      </div>

      <div className="profile-summary card">
        <Avatar user={user} size={64} />
        <div className="profile-summary-info">
          <h3>{user.name}</h3>
          <p>
            {user.department || 'Department not set'}
            {user.year ? ` · Year ${user.year}` : ''}
          </p>
          <p className="muted">{user.bio || 'Add a bio to tell others about yourself.'}</p>
        </div>
        <Link to="/profile" className="btn btn-outline btn-sm">Edit Profile</Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Skills I teach" value={skillsOffered.length} icon="✦" accent="blue" />
        <StatCard label="Skills I want" value={skillsWanted.length} icon="◎" accent="purple" />
        <StatCard label="Pending received" value={stats.pendingReceived} icon="⇄" accent="blue" />
        <StatCard label="Active exchanges" value={stats.accepted} icon="●" accent="purple" />
        <StatCard label="Completed" value={stats.completed} icon="✓" accent="green" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>My Skills</h3>
            <Link to="/skills" className="link">Manage</Link>
          </div>
          <h4 className="mini-title">I can teach</h4>
          <div className="badge-wrap">
            {skillsOffered.length ? skillsOffered.map((s) => <SkillBadge key={s._id} skill={s} />) : <span className="muted">No skills offered yet.</span>}
          </div>
          <h4 className="mini-title">I want to learn</h4>
          <div className="badge-wrap">
            {skillsWanted.length ? skillsWanted.map((s) => <SkillBadge key={s._id} skill={s} />) : <span className="muted">No skills wanted yet.</span>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <Link to="/notifications" className="link">View all</Link>
          </div>
          {recentActivity.length === 0 && notifications.length === 0 ? (
            <EmptyState title="No activity yet" hint="Send your first exchange request to get started." />
          ) : (
            <ul className="activity-list">
              {(recentActivity.length ? recentActivity : notifications).map((n) => (
                <li key={n._id} className={n.read ? '' : 'unread'}>
                  <span>{n.text}</span>
                  <time>{new Date(n.createdAt).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Exchange Request Summary</h3>
          <Link to="/requests" className="link">Manage requests</Link>
        </div>
        <div className="summary-row">
          <div><strong>{stats.sent}</strong><span>Sent</span></div>
          <div><strong>{stats.received}</strong><span>Received</span></div>
          <div><strong>{stats.pending}</strong><span>Pending</span></div>
          <div><strong>{stats.accepted}</strong><span>Accepted</span></div>
          <div><strong>{stats.completed}</strong><span>Completed</span></div>
        </div>
      </div>
    </div>
  );
}