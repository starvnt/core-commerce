import React from 'react';
import AdminList from '../AdminList';
import { formatMoney, formatTimeAgo } from '../../services/format';

export default function AdminQuotes() {
  return (
    <AdminList
      endpoint="/quotes"
      title="Quotes"
      columns={[
        { key: 'subject', label: 'Subject' },
        { key: 'customerId', label: 'Customer' },
        { key: 'organizationId', label: 'Vendor' },
        { key: 'totalMinor', label: 'Total' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created', render: (r) => formatTimeAgo(r.createdAt) },
      ]}
      detailPath={(r) => `/admin/quotes/${r.quoteId}`}
    />
  );
}
