export default function StatCard({ label, value, icon, accent = 'blue' }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}