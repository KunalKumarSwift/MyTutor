/** Collapses runs of whitespace and trims. */
export function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** Trims multi-line text while preserving paragraph breaks. Empty becomes null. */
export function cleanMultiline(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const normalized = value
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
  return normalized === '' ? null : normalized;
}

/** Key used for case-insensitive uniqueness of titles. */
export function titleKey(value: string): string {
  return cleanText(value).toLocaleLowerCase('en');
}

/** Builds a short plain-text excerpt from long text. */
export function excerpt(value: string, maxLength = 180): string {
  const flat = cleanText(value);
  if (flat.length <= maxLength) return flat;
  const cut = flat.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > maxLength * 0.6 ? lastSpace : maxLength).trimEnd()}…`;
}
