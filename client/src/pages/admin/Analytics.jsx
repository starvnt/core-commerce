import { useEffect, useState } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/analytics/overview'),
      api.get('/analytics/intent-distribution'),
    ]).then(([a, b]) => {
      const out = {};
      if (a.status === 'fulfilled') out.overview = a.value.data?.data;
      if (b.status === 'fulfilled') out.intent = b.value.data?.data;
      setSummary(out);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="spinner-page"><span className="loader" /></div>;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Customer journey & intent scoring" />

      <div className="grid grid-4 mb-3">
        <div className="stat-card"><span className="stat-label">Visitors</span><span className="stat-value">{summary?.overview?.visitors ?? 0}</span><Icon name="globe" size={20} className="stat-icon" /></div>
        <div className="stat-card"><span className="stat-label">Sessions</span><span className="stat-value">{summary?.overview?.sessions ?? 0}</span><Icon name="bolt" size={20} className="stat-icon" /></div>
        <div className="stat-card"><span className="stat-label">Leads</span><span className="stat-value">{summary?.overview?.leads ?? 0}</span><Icon name="users" size={20} className="stat-icon" /></div>
        <div className="stat-card"><span className="stat-label">Customers</span><span className="stat-value">{summary?.overview?.customers ?? 0}</span><Icon name="check" size={20} className="stat-icon" /></div>
      </div>

      <div className="card">
        <h3 className="card-title">Intent distribution</h3>
        {summary?.intent ? (
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {Object.entries(summary.intent).map(([k, v]) => (
              <div key={k} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 10, minWidth: 120 }}>
                <div className="muted" style={{ fontSize: 11 }}>{k}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        ) : <div className="muted">No analytics events recorded yet.</div>}
      </div>
    </div>
  );
}
