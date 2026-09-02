import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../services/auth';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { initialsOf } from '../services/format';

export default function Profile() {
  const { user, refresh, logout } = useAuth();
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/identity/me').then(({ data }) => setMe(data.data)).catch(() => {});
  }, []);

  async function save() {
    setBusy(true); setMsg('');
    try {
      await api.put('/identity/me', { name: me.name, phone: me.phone, avatar: me.avatar });
      await refresh();
      setMsg('Saved.');
    } catch (e) { setMsg(e.message); } finally { setBusy(false); }
  }

  if (!user) return null;
  if (!me) return <div className="spinner-page"><span className="loader" /></div>;

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader title="Settings" subtitle="Manage your profile and preferences" />

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--aura-500), var(--gold-500))', display: 'grid', placeItems: 'center', color: 'white', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600 }}>{initialsOf(me.name)}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>{me.name}</div>
            <div className="muted">{me.email}</div>
            <div className="dim" style={{ fontSize: 11 }}>{me.role}</div>
          </div>
        </div>

        {msg && <div className={`alert ${msg === 'Saved.' ? 'success' : 'error'}`}>{msg}</div>}

        <div className="form-grid">
          <div className="form-row"><label>Name</label><input value={me.name || ''} onChange={(e) => setMe({ ...me, name: e.target.value })} /></div>
          <div className="form-row"><label>Phone</label><input value={me.phone || ''} onChange={(e) => setMe({ ...me, phone: e.target.value })} /></div>
          <div className="form-row"><label>Email</label><input value={me.email || ''} disabled /></div>
          <div className="form-row"><label>Role</label><input value={me.role || ''} disabled /></div>
        </div>
        <div className="form-actions">
          <button className="btn" disabled={busy} onClick={save}><Icon name="check" size={14} /> Save changes</button>
          <button className="btn danger" onClick={logout}><Icon name="logout" size={14} /> Sign out</button>
        </div>
      </div>
    </div>
  );
}
