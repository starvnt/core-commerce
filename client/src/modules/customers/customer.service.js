import api from '../../services/api';

export async function listCustomers() {
  const { data } = await api.get('/customers');
  return data;
}

export async function getCustomer(id) {
  const { data } = await api.get(`/customers/${encodeURIComponent(id)}`);
  return data.data;
}

export async function createCustomer(payload) {
  const { data } = await api.post('/customers', payload);
  return data.data;
}

export async function updateCustomer(id, payload) {
  const { data } = await api.put(`/customers/${encodeURIComponent(id)}`, payload);
  return data.data;
}

export async function deleteCustomer(id) {
  const { data } = await api.delete(`/customers/${encodeURIComponent(id)}`);
  return data.data;
}
