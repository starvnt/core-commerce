import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCustomers } from '../customer.service';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    listCustomers()
      .then((res) => {
        if (!mounted) return;
        setCustomers(res.items || []);
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="container">
      <div className="toolbar">
        <div>
          <h1>Customers</h1>
          <p className="muted">All customers stored in MongoDB.</p>
        </div>
        <Link to="/customers/add" className="btn">+ Add Customer</Link>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card">
        {loading ? (
          <p>Loading…</p>
        ) : customers.length === 0 ? (
          <p className="muted">No customers yet. Add one to test the end-to-end flow.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Source</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id || c.customerId}>
                  <td><code>{c.customerId}</code></td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || '—'}</td>
                  <td><span className={`status ${c.status}`}>{c.status}</span></td>
                  <td>{c.source}</td>
                  <td><Link to={`/customers/${encodeURIComponent(c.customerId)}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
