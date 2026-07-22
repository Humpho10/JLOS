import React from 'react';
import ModalShell from './ModalShell.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { pressable } from '../../utils/a11y.js';

const LANGS = ['English', 'Luganda', 'Kiswahili', 'Ateso'];

export default function LangModal() {
  const { language, setLanguage, t } = useApp();

  return (
    <ModalShell id="langModal" title={t('lang.title')}>
      <div role="radiogroup" aria-label={t('lang.title')}>
        {LANGS.map((name) => (
          <div
            key={name}
            className={`lang-opt ${language === name ? 'selected' : ''}`}
            {...pressable(() => setLanguage(name), { role: 'radio', 'aria-checked': language === name })}
          >
            <span>{name}</span>
            <div className="radio-dot" aria-hidden="true"></div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '10px' }}>
        {t('lang.note')}
      </p>
    </ModalShell>
  );
}
