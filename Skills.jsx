import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const emptyForm = { name: '', category: '', type: 'offer', level: 'Beginner', description: '' };

export default function Skills() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const query = `/skills?mine=true&search=${encodeURIComponent(search)}&category=${filterCategory}&type=${filterType}`;
  const { data, loading, error, refetch } = useFetch(query);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/skills/categories').then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (skill) => {
    setEditing(skill);
    setForm({
      name: skill.name,
      category: skill.category,
      type: skill.type,
      level: skill.level,
      description: skill.description || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Skill name is required');
    if (!form.category) return setFormError('Please choose a category');
    setBusy(true);
    setFormError('');
    try {
      if (editing) await api.put(`/skills/${editing._id}`, form);
      else await api.post('/skills', form);
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (skill) => {
    if (!window.confirm(`Delete "${skill.name}"?`)) return;
    try {
      await api.delete(`/skills/${skill._id}`);
      refetch();
    } catch (err) {
      alert(errMsg(err));
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const skills = data?.skills || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Skills</h1>
          <p className="page-sub">List what you can teach and what you want to learn.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Skill</button>
      </div>

      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Search my skills…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Teach & Learn</option>
          <option value="offer">I teach</option>
          <option value="want">I want to learn</option>
        </select>
      </div>

      {loading ? <Loader /> : error ? <Alert>{error}</Alert> : skills.length === 0 ? (
        <EmptyState title="No skills found" hint="Add your first skill so other students can find you." />
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Skill</th><th>Category</th><th>Type</th><th>Level</th><th>Description</th><th></th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s._id}>
                  <td className="td-strong">{s.name}</td>
                  <td>{s.category}</td>
                  <td><span className={`pill ${s.type === 'offer' ? 'pill-blue' : 'pill-purple'}`}>{s.type === 'offer' ? 'Teach' : 'Learn'}</span></td>
                  <td>{s.level}</td>
                  <td className="td-desc">{s.description || '—'}</td>
                  <td className="td-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Edit Skill' : 'Add Skill'} onClose={() => setModalOpen(false)}>
          <Alert onClose={() => setFormError('')}>{formError}</Alert>
          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>Skill name</span>
              <input value={form.name} onChange={set('name')} placeholder="e.g. React, Guitar, Spanish" />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Category</span>
                <select value={form.category} onChange={set('category')}>
                  <option value="">Select…</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="field">
                <span>I want to…</span>
                <select value={form.type} onChange={set('type')}>
                  <option value="offer">Teach this skill</option>
                  <option value="want">Learn this skill</option>
                </select>
              </label>
            </div>
            {form.type === 'offer' && (
              <label className="field">
                <span>My level</span>
                <select value={form.level} onChange={set('level')}>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
            )}
            <label className="field">
              <span>Description (optional)</span>
              <textarea rows={3} maxLength={400} value={form.description} onChange={set('description')} />
            </label>
            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Skill'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}