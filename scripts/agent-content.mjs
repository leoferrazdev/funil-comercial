// Executado no documento público pelo Puppeteer, sem dependências do Node.
export function documentToMarkdown(sourceUrl) {
  const ignored = 'script, style, noscript, nav, header, footer, form, button, svg, [hidden], [aria-hidden="true"]';
  const escape = (text) => text.replace(/\s+/g, ' ').replace(/([\\`*_[\]<>])/g, '\\$1');
  const render = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return escape(node.textContent || '');
    if (!(node instanceof Element) || node.matches(ignored)) return '';
    if (node instanceof HTMLElement && node.style.display === 'none') return '';
    const content = [...node.childNodes].map(render).join('');
    const tag = node.tagName.toLowerCase();
    if (tag === 'h1') return '';
    if (/^h[1-6]$/.test(tag)) return `\n\n${'#'.repeat(Number(tag[1]))} ${content.trim()}\n\n`;
    if (tag === 'a') {
      const href = node.getAttribute('href');
      if (!href || !content.trim()) return content;
      const url = new URL(href, sourceUrl);
      if (!['https:', 'mailto:', 'tel:'].includes(url.protocol)) return content;
      return `[${content.trim()}](${url.href.replace(/\(/g, '%28').replace(/\)/g, '%29')})`;
    }
    if (tag === 'strong' || tag === 'b') return `**${content.trim()}**`;
    if (tag === 'em' || tag === 'i') return `*${content.trim()}*`;
    if (tag === 'li') return `\n- ${content.trim()}`;
    if (tag === 'br') return '\n';
    if (['p', 'div', 'section', 'article', 'ul', 'ol', 'details'].includes(tag)) return `\n\n${content.trim()}\n\n`;
    return content;
  };
  const root = document.querySelector('main') || document.getElementById('root');
  if (!root || !root.querySelector('h1')) throw new Error(`Conteúdo público sem título em ${sourceUrl}`);
  const heading = root.querySelector('h1');
  const title = escape(heading.innerText || heading.textContent).trim();
  return `# ${title}\n\n${render(root).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()}\n\nFonte: ${sourceUrl}\n`;
}
