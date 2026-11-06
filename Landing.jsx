import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const categories = [
  { name: 'Programming', desc: 'Python, Java, C++ and more' },
  { name: 'Web Development', desc: 'React, Node.js, full-stack builds' },
  { name: 'Data Science', desc: 'ML, statistics, visualization' },
  { name: 'Design', desc: 'UI/UX, Figma, graphic design' },
  { name: 'Languages', desc: 'English, Spanish, French, more' },
  { name: 'Music', desc: 'Guitar, piano, production' },
  { name: 'Academics', desc: 'Math, physics, exam prep' },
  { name: 'Business', desc: 'Marketing, finance, pitching' },
];

const steps = [
  { n: '01', title: 'Create your profile', desc: 'Register as a student and list the skills you can teach and the ones you want to learn.' },
  { n: '02', title: 'Find a match', desc: 'Explore students by skill and category, then send a skill exchange request.' },
  { n: '03', title: 'Exchange & chat', desc: 'Once accepted, chat in real time, teach each other and mark the exchange complete.' },
];

export default function Landing() {
  const { user } = useAuth();
  const appLink = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/register';

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand">
          <span className="brand-mark">SE</span>
          <span className="brand-text">SkillExchange</span>
        </div>
        <nav className="landing-nav-links">
          <a href="#about">About</a>
          <a href="#how">How It Works</a>
          <a href="#categories">Categories</a>
        </nav>
        <div className="landing-nav-actions">
          {user ? (
            <Link to={appLink} className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">By students, for students</span>
          <h1>
            Trade what you know for <span className="gradient-text">what you want to learn</span>
          </h1>
          <p>
            The Student Skill Exchange Platform connects students who want to teach with students
            who want to learn. No fees — just skills for skills.
          </p>
          <div className="hero-actions">
            <Link to={appLink} className="btn btn-primary btn-lg">Get Started Free</Link>
            <a href="#how" className="btn btn-ghost btn-lg">See How It Works</a>
          </div>
          <div className="hero-stats">
            <div><strong>10+</strong><span>Skill categories</span></div>
            <div><strong>Real-time</strong><span>Chat & notifications</span></div>
            <div><strong>100%</strong><span>Student driven</span></div>
          </div>
        </div>
        <div className="hero-card">
          <div className="exchange-card">
            <div className="exchange-side">
              <div className="exchange-avatar ex-blue">A</div>
              <strong>Asha</strong>
              <span className="skill-badge badge-offer">Teaches React</span>
              <span className="skill-badge badge-want">Wants Guitar</span>
            </div>
            <div className="exchange-arrows">⇄</div>
            <div className="exchange-side">
              <div className="exchange-avatar ex-purple">R</div>
              <strong>Ravi</strong>
              <span className="skill-badge badge-offer">Teaches Guitar</span>
              <span className="skill-badge badge-want">Wants React</span>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section">
        <h2>About Us</h2>
        <p className="section-lead">
          We believe every student has something valuable to teach. SkillExchange makes peer-to-peer
          learning simple: build a profile, list your skills, and match with classmates across
          departments and years. Learn a new language, pick up coding, or master an instrument —
          by helping someone else do the same.
        </p>
      </section>

      <section id="how" className="section section-alt">
        <h2>How It Works</h2>
        <div className="steps-grid">
          {steps.map((s) => (
            <div key={s.n} className="step-card">
              <span className="step-number">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="categories" className="section">
        <h2>Skill Categories</h2>
        <div className="categories-grid">
          {categories.map((c) => (
            <div key={c.name} className="category-card">
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2>Ready to exchange your first skill?</h2>
        <Link to={appLink} className="btn btn-white btn-lg">Join the Platform</Link>
      </section>

      <footer className="landing-footer">
        <span>SkillExchange — Student Skill Exchange Platform</span>
        <span>Built with the MERN stack</span>
      </footer>
    </div>
  );
}