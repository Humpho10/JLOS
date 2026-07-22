import React from 'react';
import ModalShell from './ModalShell.jsx';

const FAQS = [
  { q: 'How does Justice AI know where to send me?', a: 'You describe your problem in plain language and it matches you to the JLOS institution and service that handles it.' },
  { q: 'What if nobody can answer my question right away?', a: 'A ticket is raised automatically and emailed to the right officer, with your full conversation attached.' },
  { q: "I don't have internet — can I still use this?", a: 'Yes, dial the USSD code from the More menu to reach the contact centre from any phone.' },
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
