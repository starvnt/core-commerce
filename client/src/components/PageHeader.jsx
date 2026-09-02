import React from 'react';

export default function PageHeader({ title, subtitle, crumbs, actions }) {
  return (
    <div>
      {crumbs && <div className="crumbs">{crumbs}</div>}
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </div>
  );
}
