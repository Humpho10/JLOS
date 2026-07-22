// ============================================================
// Accessibility helpers — make non-<button> elements (divs/spans
// that carry the portal's rich card/pill styling) behave like real
// buttons for keyboard users: focusable, and activatable with
// Enter / Space, with the correct ARIA role.
//
// Use `pressable(fn)` to spread role/tabIndex/onClick/onKeyDown onto
// a plain clickable element, or `activate(fn)` when you only need the
// keydown handler (e.g. a component that already owns onClick).
// ============================================================

// Returns an onKeyDown handler that fires `handler` on Enter or Space,
// matching native <button> activation (and preventing the page scroll
// that Space would otherwise cause).
export function activate(handler) {
  return (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      handler(e);
    }
  };
}

// Full set of props to turn a div/span into a keyboard-operable button.
// `extra` lets callers add aria-* attributes (e.g. aria-expanded, aria-label).
export function pressable(handler, extra = {}) {
  return {
    role: 'button',
    tabIndex: 0,
    onClick: handler,
    onKeyDown: activate(handler),
    ...extra,
  };
}
