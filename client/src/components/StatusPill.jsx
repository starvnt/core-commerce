import React from 'react';
import { statusClass } from '../services/format';

export default function StatusPill({ status, children }) {
  return <span className={`pill ${statusClass(status)}`}>{children || status}</span>;
}
