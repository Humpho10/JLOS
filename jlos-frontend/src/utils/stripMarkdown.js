// ============================================================
// Justice AI is instructed not to use markdown, but a defensive
// cleanup here means a stray ** or # slipping through a reply
// never shows up as literal asterisks/hashes in the chat bubble.
// ============================================================

export function stripMarkdown(text) {
  if (!text) return text;

  return text
    .replace(/^#{1,6}\s+/gm, '') // leading "### " heading markers
    .replace(/\*\*(.+?)\*\*/g, '$1') // **bold**
    .replace(/__(.+?)__/g, '$1') // __bold__
    .replace(/^\s*[*+]\s+/gm, '- ') // stray "* " / "+ " bullets -> "- "
    .replace(/\*(.+?)\*/g, '$1'); // *italic*
}
