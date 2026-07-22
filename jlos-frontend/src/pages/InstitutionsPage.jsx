import React, { useMemo, useState } from 'react';
import InstitutionCard from '../components/InstitutionCard.jsx';
import { institutions } from '../data/institutions.js';
import { useApp } from '../context/AppContext.jsx';

export default function InstitutionsPage({ active }) {
  const { t } = useApp();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return institutions;
    return institutions.filter((inst) => {
      const haystack = (inst.name + ' ' + inst.sub + ' ' + inst.services.join(' ')).toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <section className={`page ${active ? 'active' : ''}`} id="page-institutions">
      <div className="page-wrap">
        <div className="page-head">
          <h2>{t('page.institutions.title')}</h2>
          <p>{t('page.institutions.sub')}</p>
        </div>
        <div className="inst-search-web" role="search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7480" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input
            id="instSearchWeb"
            type="search"
            aria-label="Search institutions or services"
            placeholder="Search institution or service..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="inst-grid-web" id="instListWeb">
          {filtered.map((inst) => <InstitutionCard inst={inst} key={inst.code} />)}
        </div>
        {filtered.length === 0 && (
          <div className="no-results" id="noResultsWeb" role="status" style={{ display: 'block' }}>
            No institutions match your search.
          </div>
        )}
      </div>
    </section>
  );
}
