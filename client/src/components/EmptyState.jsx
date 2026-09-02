import React from 'react';
import Icon from './Icon';

export default function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={28} />
      </div>
      <div style={{ fontWeight: 600, color: 'var(--platinum-100)', marginBottom: 4 }}>{title}</div>
      {description && <div style={{ fontSize: 13 }}>{description}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
