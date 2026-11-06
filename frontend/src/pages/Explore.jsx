import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import Avatar from '../components/Avatar.jsx';
import SkillBadge from '../components/SkillBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Explore() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState('');
  const query = `/users?search=${encodeURIComponent(search)}&skill=${encodeURIComponent(skill)}&category=${category}`;
  const { data, loading, error } = useFetch(query);

  useEffect(() => {
    api.get('/skills/categories').then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  const students = data?.students || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Explore Students</h1>
          <p className="page-sub">Find students who teach what you want to learn.</p>
        </div>
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="Search by name or department…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input className="search-input" placeholder="Search by skill (e.g. Python)…" value={skill} onChange={(e) => setSkill(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <Loader /> : error ? <Alert>{error}</Alert> : students.length === 0 ? (
        <EmptyState title="No students found" hint="Try a different search or category." />
      ) : (
        <div className="cards-grid">
          {students.map((s) => (
            <div key={s._id} className="student-card card">
              <div className="student-card-top">
                <Avatar user={s} size={56} />
                <div>
                  <h3>{s.name}</h3>
                  <p className="muted small">
                    {s.department || 'Student'}{s.year ? ` · Year ${s.year}` : ''}
                  </p>
                </div>
              </div>
              <div className="student-card-skills">
                <h4 className="mini-title">Teaches</h4>
                <div className="badge-wrap">
                  {s.skillsOffered.slice(0, 4).map((k) => <SkillBadge key={k._id} skill={k} />)}
                  {s.skillsOffered.length === 0 && <span className="muted small">Nothing listed yet</span>}
                </div>
                <h4 className="mini-title">Wants to learn</h4>
                <div className="badge-wrap">
                  {s.skillsWanted.slice(0, 4).map((k) => <SkillBadge key={k._id} skill={k} />)}
                  {s.skillsWanted.length === 0 && <span className="muted small">Nothing listed yet</span>}
                </div>
              </div>
              <Link to={`/students/${s._id}`} className="btn btn-primary btn-sm btn-block">
                View Profile & Exchange
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}