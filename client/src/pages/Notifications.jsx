import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import EmptyState from '../components/EmptyState';
import { formatTimeAgo } from '../services/format';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/notifications'); setItems(data.data || []); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function markAll() { await api.post('/notifications/mark-all-read'); load(); }
  async function markRead(id) { await api.patch(`/notifications/${id}/read`); load(); }

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        title="Notifications"
        subtitle="Stay on top of every event update"
        actions={<button className="btn secondary" onClick={markAll}><Icon name="check" size={14} /> Mark all read</button>}
      />

      {loading ? <div className="spinner-page"><span className="loader" /></div>
        : items.length === 0 ? <div className="card"><EmptyState icon="bell" title="No notifications yet" /></div>
        : (
          <div className="card" style={{ padding: 0 }}>
            {items.map((n, i) => (
              <div key={n.notificationId} style={{
                padding: '14px 18px',
                borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                background: n.read ? 'transparent' : 'rgba(42,120,245,0.04)',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: n.read ? 'rgba(255,255,255,0.04)' : 'rgba(42,120,245,0.15)', display: 'grid', placeItems: 'center', color: n.read ? 'var(--text-dim)' : 'var(--aura-300)' }}>
                  <Icon name="bell" size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--platinum-100)' }}>{n.title}</div>
                  {n.body && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{n.body}</div>}
                  <div className="dim" style={{ fontSize: 11, marginTop: 4 }}>{formatTimeAgo(n.createdAt)}</div>
                </div>
                {!n.read && <button className="btn sm ghost" onClick={() => markRead(n.notificationId)}><Icon name="check" size={12} /></button>}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
