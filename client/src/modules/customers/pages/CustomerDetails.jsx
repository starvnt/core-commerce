import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { deleteCustomer, getCustomer } from '../customer.service';

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCustomer(id)
      .then((c) => mounted && setCustomer(c))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      window.location.href = '/customers';
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <main className="container"><p>Loading…</p></main>;
  if (error) return <main className="container"><div className="alert error">{error}</div></main>;
  if (!customer) return null;

  return (
    <main className="container">
      <div className="toolbar">
        <div>
          <h1>{customer.name}</h1>
          <p className="muted"><code>{customer.customerId}</code></p>
        </div>
        <div>
          <Link to="/customers" className="btn secondary">Back</Link>
          {' '}
          <button onClick={handleDelete} className="btn danger">Delete</button>
        </div>
      </div>

      <div className="card">
        <dl className="dl">
          <dt>Email</dt><dd>{customer.email}</dd>
          <dt>Phone</dt><dd>{customer.phone || '—'}</dd>
          <dt>Status</dt><dd><span className={`status ${customer.status}`}>{customer.status}</span></dd>
          <dt>Source</dt><dd>{customer.source}</dd>
          <dt>Created</dt><dd>{new Date(customer.createdAt).toLocaleString()}</dd>
          <dt>Updated</dt><dd>{new Date(customer.updatedAt).toLocaleString()}</dd>
        </dl>
      </div>

      <div className="card">
        <h2>Coming next</h2>
        <p className="muted">Notes, follow-ups, and activity timeline will live here in later milestones.</p>
      </div>
    </main>
  );
}
