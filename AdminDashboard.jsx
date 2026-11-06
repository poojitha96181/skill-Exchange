import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import StatCard from '../../components/StatCard.jsx';
import Avatar from '../../components/Avatar.jsx';

export default function AdminDashboard() {
  const { data, loading, error } = useFetch('/admin/stats');

  if (loading) return <Loader />;
  if (error) return <Alert>{error}</Alert>;

  const statusMap = Object.fromEntries(data.statusBreakdown.map((s) => [s._id, s.count]));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Admin Overview</h1>
          <p className="page-sub">Platform statistics and management shortcuts.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total students" value={data.totalStudents} icon="◉" accent="blue" />
        <StatCard label="Total skills" value={data.totalSkills} icon="✦" accent="purple" />
        <StatCard label="Exchange requests" value={data.totalRequests} icon="⇄" accent="blue" />
        <StatCard label="Messages sent" value={data.totalMessages} icon="✉" accent="purple" />
        <StatCard label="Open reports" value={data.openReports} icon="⚑" accent="red" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Request Status Breakdown</h3>
            <Link to="/admin/requests" className="link">Monitor all</Link>
          </div>
          <div className="summary-row">
            {['pending', 'accepted', 'rejected', 'completed', 'cancelled'].map((s) => (
              <div key={s}>
                <strong>{statusMap[s] || 0}</strong>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Newest Students</h3>
            <Link to="/admin/users" className="link">Manage students</Link>
          </div>
          {data.recentUsers.length === 0 ? (
            <p className="muted">No students registered yet.</p>
          ) : (
            <ul className="user-mini-list">
              {data.recentUsers.map((u) => (
                <li key={u._id}>
                  <Avatar user={u} size={36} />
                  <div>
                    <strong>{u.name}</strong>
                    <span className="muted small block">{u.email}</span>
                  </div>
                  <time className="muted small">{new Date(u.createdAt).toLocaleDateString()}</time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="admin-shortcuts">
        <Link to="/admin/users" className="card shortcut-card"><h3>Manage Students</h3><p>Suspend, activate or remove accounts.</p></Link>
        <Link to="/admin/skills" className="card shortcut-card"><h3>Manage Skills</h3><p>Review and remove inappropriate listings.</p></Link>
        <Link to="/admin/requests" className="card shortcut-card"><h3>Monitor Requests</h3><p>Track all exchange activity.</p></Link>
        <Link to="/admin/reports" className="card shortcut-card"><h3>Handle Reports</h3><p>Review reports filed by students.</p></Link>
      </div>
    </div>
  );
}