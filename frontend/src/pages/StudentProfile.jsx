import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api, { errMsg } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import Avatar from '../components/Avatar.jsx';
import SkillBadge from '../components/SkillBadge.jsx';
import Modal from '../components/Modal.jsx';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(`/users/${id}`);
  const mySkills = useFetch('/skills?mine=true&type=offer');

  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [form, setForm] = useState({ offeredSkill: '', wantedSkill: '', message: '' });
  const [reportReason, setReportReason] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <Loader />;
  if (error) return <Alert>{error}</Alert>;

  const { student, skillsOffered, skillsWanted } = data;
  const myOffers = mySkills.data?.skills || [];

  const startChat = async () => {
    try {
      const { data: res } = await api.post('/conversations', { participantId: student._id });
      navigate('/messages', { state: { conversationId: res.conversation._id } });
    } catch (err) {
      alert(errMsg(err));
    }
  };

  const sendRequest = async (e) => {
    e.preventDefault();
    if (!form.offeredSkill) return setFormError('Choose a skill you will teach');
    if (!form.wantedSkill) return setFormError('Choose a skill you want to learn');
    setBusy(true);
    setFormError('');
    try {
      await api.post('/requests', { receiver: student._id, ...form });
      setExchangeOpen(false);
      setSuccess('Exchange request sent!');
      setForm({ offeredSkill: '', wantedSkill: '', message: '' });
    } catch (err) {
      setFormError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const sendReport = async (e) => {
    e.preventDefault();
    if (reportReason.trim().length < 5) return setFormError('Please describe the issue (min 5 characters)');
    setBusy(true);
    setFormError('');
    try {
      await api.post('/reports', { reportedUser: student._id, reason: reportReason });
      setReportOpen(false);
      setReportReason('');
      setSuccess('Report submitted to the admin team.');
    } catch (err) {
      setFormError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <Link to="/students" className="link back-link">← Back to Explore</Link>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      <div className="card profile-hero">
        <Avatar user={student} size={96} />
        <div className="profile-hero-info">
          <h1>{student.name}</h1>
          <p className="muted">{student.department || 'Student'}{student.year ? ` · Year ${student.year}` : ''}</p>
          <p>{student.bio || 'This student has not written a bio yet.'}</p>
          {student.interests?.length > 0 && (
            <div className="badge-wrap">
              {student.interests.map((i) => <span key={i} className="pill pill-gray">{i}</span>)}
            </div>
          )}
        </div>
        <div className="profile-hero-actions">
          <button className="btn btn-primary" onClick={() => { setFormError(''); setExchangeOpen(true); }}>
            Send Exchange Request
          </button>
          <button className="btn btn-outline" onClick={startChat}>Message</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFormError(''); setReportOpen(true); }}>
            Report user
          </button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Skills {student.name.split(' ')[0]} can teach</h3>
          {skillsOffered.length === 0 ? <p className="muted">No skills listed.</p> : (
            <ul className="skill-list">
              {skillsOffered.map((s) => (
                <li key={s._id}>
                  <div>
                    <SkillBadge skill={s} />
                    <span className="muted small"> {s.category}</span>
                    {s.description && <p className="small">{s.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h3>Skills {student.name.split(' ')[0]} wants to learn</h3>
          {skillsWanted.length === 0 ? <p className="muted">No skills listed.</p> : (
            <ul className="skill-list">
              {skillsWanted.map((s) => (
                <li key={s._id}>
                  <div>
                    <SkillBadge skill={s} />
                    <span className="muted small"> {s.category}</span>
                    {s.description && <p className="small">{s.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {exchangeOpen && (
        <Modal title={`Exchange with ${student.name}`} onClose={() => setExchangeOpen(false)}>
          <Alert onClose={() => setFormError('')}>{formError}</Alert>
          {myOffers.length === 0 ? (
            <div>
              <p>You have not listed any skills to teach yet. Add one first.</p>
              <Link to="/skills" className="btn btn-primary">Add a skill</Link>
            </div>
          ) : skillsOffered.length === 0 ? (
            <p>{student.name} has not listed any skills to teach yet.</p>
          ) : (
            <form onSubmit={sendRequest}>
              <label className="field">
                <span>I will teach (my offered skill)</span>
                <select value={form.offeredSkill} onChange={(e) => setForm({ ...form, offeredSkill: e.target.value })}>
                  <option value="">Select…</option>
                  {myOffers.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.level})</option>)}
                </select>
              </label>
              <label className="field">
                <span>I want to learn (their offered skill)</span>
                <select value={form.wantedSkill} onChange={(e) => setForm({ ...form, wantedSkill: e.target.value })}>
                  <option value="">Select…</option>
                  {skillsOffered.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.level})</option>)}
                </select>
              </label>
              <label className="field">
                <span>Message (optional)</span>
                <textarea rows={3} maxLength={400} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Introduce yourself and propose a schedule…" />
              </label>
              <button className="btn btn-primary btn-block" disabled={busy}>
                {busy ? 'Sending…' : 'Send Request'}
              </button>
            </form>
          )}
        </Modal>
      )}

      {reportOpen && (
        <Modal title={`Report ${student.name}`} onClose={() => setReportOpen(false)}>
          <Alert onClose={() => setFormError('')}>{formError}</Alert>
          <form onSubmit={sendReport}>
            <label className="field">
              <span>Reason</span>
              <textarea rows={4} maxLength={500} value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe the problem…" />
            </label>
            <button className="btn btn-danger btn-block" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit Report'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}