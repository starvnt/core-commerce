import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['VENUE', 'PHOTOGRAPHY', 'CATERING', 'DECOR', 'MUSIC', 'ORGANIZER', 'VENDOR', 'ARTIST', 'AGENCY'];

export default function Explore() {
  const [vendors, setVendors] = useState([]);
  const [cats, setCats] = useState([]);
  const [city, setCity] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (city) params.city = city;
      if (q) params.q = q;
      if (category) params.category = category;
      const { data } = await api.get('/search/vendors', { params });
      setVendors(data.data || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [category]);

  useEffect(() => {
    api.get('/search/categories').then(({ data }) => setCats(data.data || [])).catch(() => {});
  }, []);

  function onSearch(e) {
    e.preventDefault();
    load();
  }

  return (
    <div>
      <PageHeader
        title="Explore Vendors"
        subtitle="Find the perfect partners for your event"
      />

      <form onSubmit={onSearch} className="card" style={{ padding: 18 }}>
        <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr auto' }}>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label>Search</label>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Photography, venue, catering…" />
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label>City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai, Delhi…" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn" type="submit"><Icon name="search" size={14} /> Search</button>
          </div>
        </div>
      </form>

      <div className="category-pills mt-3 mb-3">
        <button className={`cat-pill ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={`cat-pill ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
        {cats.length > 0 && cats.filter((c) => !CATEGORIES.includes(c.category)).map((c) => (
          <button key={c.category} className={`cat-pill ${category === c.category ? 'active' : ''}`} onClick={() => setCategory(c.category)}>
            {c.category} <span className="muted">({c.count})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-page"><span className="loader" /></div>
      ) : vendors.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="discover"
            title="No vendors found"
            description="Try a different category, city, or search term."
          />
        </div>
      ) : (
        <div className="grid grid-3">
          {vendors.map((v) => (
            <Link key={v.organizationId} to={`/vendors/${v.organizationId}`} className="vendor-card" style={{ textDecoration: 'none' }}>
              <div className="vendor-cover" />
              <div className="vendor-body">
                <div className="vendor-name">{v.name}</div>
                <div className="vendor-meta">
                  <Icon name="globe" size={12} /> {v.city || 'India'}{v.rating ? ` · ★ ${v.rating}` : ''}
                </div>
                <div className="vendor-tags">
                  {(v.capabilities || []).slice(0, 3).map((c) => <span key={c} className="pill">{c}</span>)}
                </div>
                {v.offerings?.length > 0 && (
                  <div className="vendor-price">From ₹{Math.round((v.offerings[0].startingPriceMinor || 0) / 100).toLocaleString()}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
