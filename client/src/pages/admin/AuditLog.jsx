import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatusPill from '../../components/StatusPill';
import Icon from '../../components/Icon';
import { formatTimeAgo } from '../../services/format';

export default function AdminAuditLog() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState('');
  const [org, setOrg] = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (entity) params.entityType = entity;
      if (org) params.organizationId = org;
      const { data } = await api.get('/audit', { params });
      setItems(data.data || []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Every sensitive change is recorded here for accountability" />
      <div className="toolbar">
        <input placeholder="Entity type (CUSTOMER, BOOKING, …)" value={entity} onChange={(e) => setEntity(e.target.value)} />
        <input placeholder="Organization ID" value={org} onChange={(e) => setOrg(e.target.value)} />
        <button className="btn" onClick={load}><Icon name="search" size={14} /> Filter</button>
      </div>

      {loading ? <div className="spinner-page"><span className="loader" /></div> : items.length === 0 ? (
        <div className="card"><div className="muted">No audit entries match your filter.</div></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Entity</th><th>Action</th><th>Previous</th><th>New</th><th>By</th><th>When</th></tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.auditId}>
                  <td><StatusPill status="">{a.entityType}</StatusPill> <span className="mono dim">{a.entityId}</span></td>
                  <td>{a.action}</td>
                  <td className="muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.previousValue || '—'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.newValue || '—'}</td>
                  <td className="mono">{a.changedBy || 'system'}</td>
                  <td className="muted">{formatTimeAgo(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
