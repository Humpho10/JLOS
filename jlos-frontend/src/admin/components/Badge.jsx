import React from 'react';

const STYLES = {
  new: 'bg-brand-navy/10 text-brand-navy',
  replied: 'bg-brand-success-bg text-brand-success',
  ok: 'bg-brand-success-bg text-brand-success',
  idle: 'bg-black/5 text-brand-muted',
  scraping: 'bg-brand-gold/15 text-brand-gold animate-pulse',
  embedding: 'bg-brand-gold/15 text-brand-gold animate-pulse',
  failed: 'bg-brand-danger-bg text-brand-danger',
  skipped: 'bg-black/5 text-brand-muted',
  unchanged: 'bg-black/5 text-brand-muted',
  no_text: 'bg-black/5 text-brand-muted',
  never_synced: 'bg-black/5 text-brand-muted',
};

export default function Badge({ status, children }) {
  const style = STYLES[status] || 'bg-black/5 text-brand-muted';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {children || status?.replace(/_/g, ' ')}
    </span>
  );
}
