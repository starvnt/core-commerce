import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/search/vendors', { params: { q, limit: 30 } })
      .then(({ data }) => { if (mounted) setResults(data.data || []); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [q]);

  return (
    <div>
      <PageHeader title={`Search results`} subtitle={q ? `for "${q}"` : 'Try the search bar above'} />

      {loading ? (
        <div className="spinner-page"><span className="loader" /></div>
      ) : results.length === 0 ? (
        <div className="card">
          <EmptyState icon="search" title="No matches" description="Try a broader term or browse categories." action={
            <Link to="/explore" className="btn"><Icon name="discover" size={14} /> Explore Vendors</Link>
          } />
        </div>
      ) : (
        <div className="grid grid-3">
          {results.map((v) => (
            <Link key={v.organizationId} to={`/vendors/${v.organizationId}`} className="vendor-card" style={{ textDecoration: 'none' }}>
              <div className="vendor-cover" />
              <div className="vendor-body">
                <div className="vendor-name">{v.name}</div>
                <div className="vendor-meta">{v.city || 'India'}</div>
                <div className="vendor-tags">{(v.capabilities || []).slice(0, 3).map((c) => <span key={c} className="pill">{c}</span>)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
