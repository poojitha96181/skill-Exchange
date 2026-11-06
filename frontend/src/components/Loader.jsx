export default function Loader({ full = false }) {
  return (
    <div className={full ? 'loader-full' : 'loader'}>
      <div className="spinner" />
      <span>Loading…</span>
    </div>
  );
}