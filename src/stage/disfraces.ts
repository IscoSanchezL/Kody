/** Disfraces de Kody (SVG propios). El zorro robot tiene dos variantes. */
export function kodySVG(variante: 0 | 1): string {
  const ojos =
    variante === 0
      ? `<circle cx="44" cy="68" r="7" fill="#1e1b4b"/><circle cx="76" cy="68" r="7" fill="#1e1b4b"/>
         <circle cx="46" cy="65" r="2.5" fill="#fff"/><circle cx="78" cy="65" r="2.5" fill="#fff"/>`
      : `<path d="M37 70q7-10 14 0M69 70q7-10 14 0" stroke="#1e1b4b" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  const antena = variante === 0 ? '#22d3ee' : '#facc15';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 120 120">
  <line x1="60" y1="22" x2="60" y2="10" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
  <circle cx="60" cy="9" r="6" fill="${antena}" stroke="#fff" stroke-width="2"/>
  <path d="M16 20 L40 38 L28 62 Z" fill="#f97316" stroke="#9a3412" stroke-width="3" stroke-linejoin="round"/>
  <path d="M104 20 L80 38 L92 62 Z" fill="#f97316" stroke="#9a3412" stroke-width="3" stroke-linejoin="round"/>
  <path d="M24 32 L36 42 L31 54 Z" fill="#fde68a"/><path d="M96 32 L84 42 L89 54 Z" fill="#fde68a"/>
  <path d="M18 56 Q18 26 60 26 Q102 26 102 56 L102 78 Q102 106 60 106 Q18 106 18 78 Z" fill="#fb923c" stroke="#9a3412" stroke-width="3.5"/>
  <path d="M26 74 Q60 112 94 74 Q94 98 60 104 Q26 98 26 74 Z" fill="#fff7ed"/>
  <rect x="30" y="52" width="60" height="30" rx="15" fill="#fff" opacity=".25"/>
  ${ojos}
  <ellipse cx="60" cy="82" rx="6" ry="4.5" fill="#1e1b4b"/>
  <path d="M52 90 Q60 97 68 90" stroke="#1e1b4b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <circle cx="32" cy="82" r="5" fill="#fb7185" opacity=".6"/><circle cx="88" cy="82" r="5" fill="#fb7185" opacity=".6"/>
</svg>`;
}

export const alDataUri = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
