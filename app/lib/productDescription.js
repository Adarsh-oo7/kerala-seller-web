export function sanitizeDescriptionHtml(input) {
  if (!input) return '';
  const allowed = new Set(['p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3']);
  const styleKeys = new Set(['font-size', 'font-weight', 'font-style', 'text-decoration', 'text-align']);
  let html = String(input)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');

  html = html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, tag, attrs = '') => {
    const name = String(tag).toLowerCase();
    if (!allowed.has(name)) return '';
    if (full.startsWith('</')) return `</${name}>`;
    if (name === 'br') return '<br>';
    const match = String(attrs).match(/style\s*=\s*("([^"]*)"|'([^']*)')/i);
    const raw = match?.[2] ?? match?.[3] ?? '';
    const kept = [];
    for (const part of raw.split(';')) {
      const [key, ...rest] = part.split(':');
      const styleName = key?.trim().toLowerCase();
      const value = rest.join(':').trim();
      if (!styleName || !value || !styleKeys.has(styleName)) continue;
      if (/expression|url\s*\(|javascript/i.test(value)) continue;
      kept.push(`${styleName}: ${value}`);
    }
    const style = kept.join('; ');
    return style ? `<${name} style="${style}">` : `<${name}>`;
  });
  return html.trim();
}

export function descriptionLooksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
}

export function plainTextFromHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h2|h3)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function descriptionIsEmpty(html) {
  return plainTextFromHtml(html).length < 8;
}

export function toEditorHtml(value) {
  const raw = String(value || '').trim();
  if (!raw) return '<p><br></p>';
  if (!descriptionLooksLikeHtml(raw)) {
    const escaped = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped
      .split(/\n+/)
      .map((line) => `<p>${line || '<br>'}</p>`)
      .join('');
  }
  return sanitizeDescriptionHtml(raw) || '<p><br></p>';
}
