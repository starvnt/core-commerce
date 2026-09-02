import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { formatMoney } from '../services/format';
import { useAuth } from '../services/auth';
import StatusPill from '../components/StatusPill';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offerings');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [a, b, c, d] = await Promise.allSettled([
          api.get(`/identity/organizations/${id}`),
          api.get(`/offerings/organization/${id}`),
          api.get(`/reviews`, { params: { organizationId: id } }),
          api.get(`/reviews/summary/${id}`),
        ]);
        if (!mounted) return;
        if (a.status === 'fulfilled') setOrg(a.value.data.data);
        if (b.status === 'fulfilled') setOfferings(b.value.data.data || []);
        if (c.status === 'fulfilled') setReviews(c.value.data.data || []);
        if (d.status === 'fulfilled') setSummary(d.value.data.data);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="spinner-page"><span className="loader" /></div>;
  if (!org) return <div className="alert error">Vendor not found.</div>;

  async function startInquiry() {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await api.post('/inquiries', {
        organizationId: id,
        customerId: user.userId || user.id,
        subject: `Inquiry about ${org.name}`,
        body: `Hi! I'm interested in your services. Could you share availability and pricing?`,
      });
      navigate(`/inquiries/${data.data.inquiryId}`);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title={org.name}
        subtitle={org.description || `${(org.capabilities || []).join(' · ')} · ${org.address?.city || 'India'}`}
        crumbs={<><Link to="/explore">Explore</Link> · {org.name}</>}
        actions={
          <button className="btn gold" onClick={startInquiry}>
            <Icon name="send" size={14} /> Send Inquiry
          </button>
        }
      />

      <div className="grid grid-4 mb-3">
        <div className="stat-card">
          <span className="stat-label">Location</span>
          <span className="stat-value" style={{ fontSize: 18 }}>{org.address?.city || 'India'}</span>
          <Icon name="globe" size={20} className="stat-icon" />
        </div>
        <div className="stat-card">
          <span className="stat-label">Capabilities</span>
          <span className="stat-value" style={{ fontSize: 18 }}>{(org.capabilities || []).length}</span>
          <Icon name="star" size={20} className="stat-icon" />
        </div>
        <div className="stat-card">
          <span className="stat-label">Offerings</span>
          <span className="stat-value">{offerings.length}</span>
          <Icon name="gift" size={20} className="stat-icon" />
        </div>
        <div className="stat-card">
          <span className="stat-label">Rating</span>
          <span className="stat-value gold-text">{summary?.average || '—'}<small style={{ fontSize: 12, color: 'var(--text-dim)' }}>  /5</small></span>
          <Icon name="star" size={20} className="stat-icon" />
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'offerings' ? 'active' : ''}`} onClick={() => setActiveTab('offerings')}>Offerings</div>
        <div className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews ({reviews.length})</div>
        <div className={`tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About</div>
      </div>

      {activeTab === 'offerings' && (
        <div className="grid grid-2">
          {offerings.length === 0 ? (
            <div className="card"><EmptyState icon="gift" title="No offerings yet" /></div>
          ) : offerings.map((o) => (
            <div key={o.offeringId} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>{o.title}</h3>
                  <div className="muted" style={{ fontSize: 12 }}>{o.category} · {o.pricingModel}</div>
                </div>
                <StatusPill status={o.isActive ? 'ACTIVE' : 'DRAFT'}>{o.isActive ? 'Active' : 'Draft'}</StatusPill>
              </div>
              <p className="muted mt-2">{o.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                <div>
                  <div className="dim" style={{ fontSize: 11 }}>Starting at</div>
                  <div className="gold-text" style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>
                    {formatMoney(o.startingPriceMinor, o.currency)}
                  </div>
                </div>
                <button className="btn" onClick={startInquiry}><Icon name="send" size={14} /> Inquire</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="grid grid-2">
          {reviews.length === 0 ? (
            <div className="card"><EmptyState icon="star" title="No reviews yet" /></div>
          ) : reviews.map((r) => (
            <div key={r.reviewId} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 4, color: 'var(--gold-300)' }}>
                  {Array.from({ length: r.rating }).map((_, i) => <Icon key={i} name="star" size={14} />)}
                </div>
                <span className="dim" style={{ fontSize: 11 }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.title && <h3 style={{ marginTop: 8 }}>{r.title}</h3>}
              <p className="muted">{r.body || 'No description provided.'}</p>
              <div className="dim" style={{ fontSize: 11, marginTop: 8 }}>— {r.authorName || 'Anonymous'}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="card">
          <h3>About {org.name}</h3>
          <p className="muted">{org.description || 'No description provided.'}</p>
          <div className="dl mt-3">
            <dt>Capabilities</dt>
            <dd>{(org.capabilities || []).join(', ') || '—'}</dd>
            <dt>Address</dt>
            <dd>{[org.address?.line1, org.address?.city, org.address?.state, org.address?.pincode].filter(Boolean).join(', ') || '—'}</dd>
            <dt>Status</dt>
            <dd><StatusPill status={org.status}>{org.status}</StatusPill></dd>
          </div>
        </div>
      )}
    </div>
  );
}

// Local fallback empty state — avoids extra import
function EmptyState({ icon, title }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name={icon} size={28} /></div>
      <div style={{ fontWeight: 600 }}>{title}</div>
    </div>
  );
}
