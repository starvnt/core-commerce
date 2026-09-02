import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../services/auth';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    eventType: 'Wedding',
    eventDate: '',
    venue: '',
    city: '',
    guestCount: 200,
    budgetMinor: 100000000, // 10L default
    currency: 'INR',
    phone: user?.phone || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm({ ...form, [k]: v }); }

  async function finish() {
    setBusy(true); setError('');
    try {
      await api.post('/customers', {
        userId: user.userId || user.id,
        name: user.name,
        email: user.email,
        phone: form.phone,
        eventType: form.eventType,
        eventDate: form.eventDate || null,
        venue: form.venue,
        city: form.city,
        guestCount: Number(form.guestCount) || 0,
        budgetMinor: Number(form.budgetMinor) || 0,
        currency: form.currency,
      });
      navigate('/customers/me', { replace: true });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <PageHeader
        title="Tell us about your event"
        subtitle="This helps us connect you with the right partners"
        crumbs={`Step ${step} of 3`}
      />

      <div className="progress mb-4"><div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }} /></div>

      {error && <div className="alert error">{error}</div>}

      {step === 1 && (
        <div className="card">
          <h3 className="card-title">What kind of event?</h3>
          <div className="grid grid-3">
            {['Wedding', 'Corporate', 'Birthday', 'Engagement', 'Concert', 'Other'].map((t) => (
              <button key={t} onClick={() => set('eventType', t)}
                style={{
                  padding: 18, borderRadius: 12, cursor: 'pointer',
                  background: form.eventType === t ? 'rgba(42,120,245,0.15)' : 'var(--bg-elev-2)',
                  border: `1px solid ${form.eventType === t ? 'var(--aura-500)' : 'var(--border)'}`,
                  color: 'var(--platinum-50)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                }}>{t}</button>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn lg" onClick={() => setStep(2)}>Continue <Icon name="arrow" size={14} /></button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h3 className="card-title">When and where?</h3>
          <div className="form-grid">
            <div className="form-row"><label>Event date</label><input type="date" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} /></div>
            <div className="form-row"><label>City</label><input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Mumbai" /></div>
            <div className="form-row"><label>Venue</label><input value={form.venue} onChange={(e) => set('venue', e.target.value)} placeholder="Grand Hyatt" /></div>
            <div className="form-row"><label>Estimated guests</label><input type="number" min={0} value={form.guestCount} onChange={(e) => set('guestCount', e.target.value)} /></div>
          </div>
          <div className="form-actions">
            <button className="btn secondary" onClick={() => setStep(1)}>Back</button>
            <button className="btn lg" onClick={() => setStep(3)}>Continue <Icon name="arrow" size={14} /></button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h3 className="card-title">Budget & contact</h3>
          <div className="form-grid">
            <div className="form-row">
              <label>Total budget (INR)</label>
              <input type="number" value={(form.budgetMinor || 0) / 100} onChange={(e) => set('budgetMinor', (Number(e.target.value) || 0) * 100)} />
              <span className="muted" style={{ fontSize: 11 }}>Minor units: {form.budgetMinor}</span>
            </div>
            <div className="form-row"><label>Phone</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
          </div>
          <div className="alert info">You'll be able to update this later in your workspace.</div>
          <div className="form-actions">
            <button className="btn secondary" onClick={() => setStep(2)}>Back</button>
            <button className="btn gold lg" disabled={busy} onClick={finish}>
              {busy ? <span className="loader" /> : <><Icon name="spark" size={14} /> Finish setup</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
