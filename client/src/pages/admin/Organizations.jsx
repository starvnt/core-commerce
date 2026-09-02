import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import StatusPill from '../../components/StatusPill';

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/identity/organizations').then(({ data }) => setOrgs(data.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Organizations" subtitle="Partners, vendors, venues, agencies" />
      {loading ? <div className="spinner-page"><span className="loader" /></div> : orgs.length === 0 ? (
        <div className="card"><div className="muted">No organizations registered yet.</div></div>
      ) : (
        <div className="grid grid-3">
          {orgs.map((o) => (
            <div key={o.organizationId} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>{o.name}</h3>
                  <div className="muted" style={{ fontSize: 12 }}>{o.address?.city || 'India'}</div>
                </div>
                <StatusPill status={o.status}>{o.status}</StatusPill>
              </div>
              <div className="vendor-tags mt-2">{(o.capabilities || []).map((c) => <span key={c} className="pill">{c}</span>)}</div>
              <div className="muted mt-3" style={{ fontSize: 11 }}>Slug: {o.slug}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
