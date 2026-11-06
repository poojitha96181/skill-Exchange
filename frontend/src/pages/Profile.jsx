import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api, { errMsg } from '../services/api.js';
import Alert from '../components/Alert.jsx';
import Avatar from '../components/Avatar.jsx';

const departments = [
  'Computer Science', 'Information Technology', 'Electronics', 'Mechanical',
  'Civil', 'Business Administration', 'Design', 'Mathematics', 'Physics', 'Other',
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    department: user.department || '',
    year: user.year || '',
    bio: user.bio || '',
    interests: (user.interests || []).join(', '),
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.name.trim().length < 2) return setError('Name must be at least 2 characters');
    setBusy(true);
    try {
      const { data } = await api.put('/users/profile', form);
      setUser(data.user);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const handlePicture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('picture', file);
      const { data } = await api.put('/users/profile/picture', fd);
      setUser(data.user);
      setSuccess('Profile picture updated');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p className="page-sub">This is what other students see when they visit you.</p>
        </div>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      <div className="grid-2">
        <div className="card profile-card">
          <Avatar user={user} size={110} />
          <h3>{user.name}</h3>
          <p className="muted">{user.email}</p>
          <p>{user.department || 'Department not set'}{user.year ? ` · Year ${user.year}` : ''}</p>
          <label className="btn btn-outline btn-sm upload-label">
            {uploading ? 'Uploading…' : 'Change Picture'}
            <input type="file" accept="image/*" hidden onChange={handlePicture} disabled={uploading} />
          </label>
          <p className="muted small">JPG, PNG, GIF or WebP · max 2 MB</p>
        </div>

        <div className="card">
          <h3>Edit Details</h3>
          <form onSubmit={handleSave}>
            <label className="field">
              <span>Full name</span>
              <input value={form.name} onChange={set('name')} />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Department</span>
                <select value={form.department} onChange={set('department')}>
                  <option value="">Select…</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Year</span>
                <select value={form.year} onChange={set('year')}>
                  <option value="">Select…</option>
                  {['1', '2', '3', '4', '5'].map((y) => <option key={y} value={y}>Year {y}</option>)}
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span>Bio</span>
              <textarea rows={3} maxLength={500} value={form.bio} onChange={set('bio')} placeholder="Tell others about yourself…" />
            </label>
            <label className="field">
              <span>Interests (comma separated)</span>
              <input value={form.interests} onChange={set('interests')} placeholder="Chess, Robotics, Photography" />
            </label>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}