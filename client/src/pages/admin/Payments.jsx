import React from 'react';
import AdminList from '../AdminList';
import { formatMoney, formatTimeAgo } from '../../services/format';

export default function AdminPayments() {
  return (
    <AdminList
      endpoint="/payments"
      title="Payments"
      columns={[
        { key: 'paymentId', label: 'ID' },
        { key: 'bookingId', label: 'Booking' },
        { key: 'amountMinor', label: 'Amount' },
        { key: 'status', label: 'Status' },
        { key: 'method', label: 'Method' },
        { key: 'createdAt', label: 'Created', render: (r) => formatTimeAgo(r.createdAt) },
      ]}
    />
  );
}
