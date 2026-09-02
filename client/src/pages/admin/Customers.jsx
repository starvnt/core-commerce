import React from 'react';
import AdminList from '../AdminList';
import { formatMoney, formatTimeAgo } from '../../services/format';
import StatusPill from '../../components/StatusPill';

export default function AdminCustomers() {
  return (
    <AdminList
      endpoint="/customers"
      title="Customers"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'city', label: 'City' },
        { key: 'eventType', label: 'Event' },
        { key: 'budgetMinor', label: 'Budget' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created', render: (r) => formatTimeAgo(r.createdAt) },
      ]}
      detailPath={(r) => `/admin/customers/${r.customerId}`}
    />
  );
}
