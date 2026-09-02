import React from 'react';
import AdminList from '../AdminList';
import { formatTimeAgo } from '../../services/format';

export default function AdminInquiries() {
  return (
    <AdminList
      endpoint="/inquiries"
      title="Inquiries"
      columns={[
        { key: 'subject', label: 'Subject' },
        { key: 'customerId', label: 'Customer' },
        { key: 'organizationId', label: 'Vendor' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created', render: (r) => formatTimeAgo(r.createdAt) },
      ]}
      detailPath={(r) => `/admin/inquiries/${r.inquiryId}`}
    />
  );
}
