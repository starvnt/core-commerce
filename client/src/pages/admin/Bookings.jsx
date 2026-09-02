import React from 'react';
import AdminList from '../AdminList';
import { formatMoney, formatTimeAgo } from '../../services/format';

export default function AdminBookings() {
  return (
    <AdminList
      endpoint="/bookings"
      title="Bookings"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'customerId', label: 'Customer' },
        { key: 'totalMinor', label: 'Total' },
        { key: 'paidMinor', label: 'Paid' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created', render: (r) => formatTimeAgo(r.createdAt) },
      ]}
      detailPath={(r) => `/admin/bookings/${r.bookingId}`}
    />
  );
}
