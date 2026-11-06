import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../services/api.js';
import Alert from '../components/Alert.jsx';

const departments = [
  'Computer Science', 'Information Technology', 'Electronics', 'Mechanical',
  'Civil', 'Business Administration', 'Design', 'Mathematics', 'Physics', 'Other',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', department: '', year: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (form.name.trim().length < 2) return 'Please enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email address';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirm) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setError('');
    setBusy(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        department: form.department,
        year: form.year,
      });
      setSuccess('Account created! Redirecting to your dashboard…');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark">SE</span>
          <span className="brand-text">SkillExchange</span>
        </Link>
        <h1>Create your account</h1>
        <p className="auth-sub">Join the student skill exchange community</p>
        <Alert onClose={() => setError('')}>{error}</Alert>
        <Alert type="success">{success}</Alert>
        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Full name</span>
            <input value={form.name} onChange={set('name')} placeholder="Jane Student" />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@college.edu" autoComplete="email" />
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
            <span>Password</span>
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
          </label>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}