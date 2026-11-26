import { useApiStatus } from './hooks/useApiStatus.js';

function StatusRow({ label, value, loading }) {
  const text = loading ? 'checking…' : value;
  return (
    <div className="status-row">
      <span>{label}</span>
      <strong className={`badge badge-${loading ? 'pending' : value}`}>{text}</strong>
    </div>
  );
}

export default function App() {
  const { loading, api, database, retry } = useApiStatus();

  return (
    <main className="page">
      <h1>Wassila</h1>
      <p className="subtitle">Development status page (temporary, replaced in Phase 4)</p>

      <section className="card" aria-live="polite">
        <StatusRow label="API" value={api} loading={loading} />
        <StatusRow label="Database" value={database} loading={loading} />
        <button type="button" onClick={retry} disabled={loading}>
          Check again
        </button>
      </section>
    </main>
  );
}