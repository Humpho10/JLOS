import React, { useState } from 'react';
import ModalShell from './ModalShell.jsx';
import { useApp } from '../../context/AppContext.jsx';

function ToggleRow({ id, title, desc, initialOn = false, noBorder = false, on: controlledOn, onClick }) {
  const [localOn, setLocalOn] = useState(initialOn);
  const on = controlledOn !== undefined ? controlledOn : localOn;
  return (
    <div className="access-row" style={noBorder ? { borderBottom: 'none' } : undefined}>
      <div>
        <div className="at" id={id ? `${id}-label` : undefined}>{title}</div>
        <div className="as">{desc}</div>
      </div>
      <button
        type="button"
        id={id}
        className={`toggle-sw ${on ? 'on' : ''}`}
        role="switch"
        aria-checked={on}
        aria-label={title}
        onClick={onClick || (() => setLocalOn((v) => !v))}
      ></button>
    </div>
  );
}

export default function AccessModal() {
  const { isDark, toggleTheme } = useApp();

  return (
    <ModalShell id="accessModal" title="Display & Accessibility">
      <ToggleRow id="themeSwitch" title="Dark theme" desc="Switch to a darker, low-glare palette" on={isDark} onClick={toggleTheme} />
      <ToggleRow title="Audio read-aloud" desc="Screen content is read out for blind & low-vision users" initialOn />
      <ToggleRow title="Large text" desc="Increase font size across the app" />
      <ToggleRow title="High contrast mode" desc="Stronger colour contrast for low vision" />
      <ToggleRow title="Voice input for chat" desc="Speak instead of typing to Justice AI" initialOn noBorder />
    </ModalShell>
  );
}
