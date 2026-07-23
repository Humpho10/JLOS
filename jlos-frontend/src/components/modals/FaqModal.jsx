import React from 'react';
import ModalShell from './ModalShell.jsx';

const FAQS = [
  { q: 'How does Justice AI know where to send me?', a: 'You describe your problem in plain language and it matches you to the JLOS institution and service that handles it.' },
  { q: "What if Justice AI can't answer my question?", a: "It points you to that institution's contact page, where you'll find a toll-free number and a chat that goes directly to that institution." },
  { q: 'Is my information shared between institutions?', a: 'Only the details needed to resolve your specific request are shared with the relevant institution.' },
];

export default function FaqModal() {
  return (
    <ModalShell id="faqModal" title="FAQs">
      {FAQS.map((f, i) => (
        <div className="faq-item" key={f.q} style={i === FAQS.length - 1 ? { borderBottom: 'none' } : undefined}>
          <b>{f.q}</b>
          <p>{f.a}</p>
        </div>
      ))}
    </ModalShell>
  );
}
