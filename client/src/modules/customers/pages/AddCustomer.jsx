import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomer } from '../customer.service';

const initial = {
  name: '',
  email: '',
  phone: '',
  status: 'new',
  source: 'website',
};

export default function AddCustomer() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const created = await createCustomer(form);
      navigate(`/customers/${encodeURIComponent(created.customerId)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container">
      <h1>Add Customer</h1>
      <p className="muted">Submitting this form saves a new customer to MongoDB.</p>

      {error && <div className="alert error">{error}</div>}

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Jane Doe"
          />
        </div>

        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="jane@example.com"
          />
        </div>

        <div className="form-row">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 90000 00000"
          />
        </div>

        <div className="form-row">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            <option value="new">new</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="archived">archived</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="source">Source</label>
          <select id="source" name="source" value={form.source} onChange={handleChange}>
            <option value="website">website</option>
            <option value="referral">referral</option>
            <option value="walk_in">walk_in</option>
            <option value="social">social</option>
            <option value="other">other</option>
          </select>
        </div>

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Customer'}
        </button>
      </form>
    </main>
  );
}
