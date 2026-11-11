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

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  middot: '·',
  copy: '©',
  rarr: '→',
  larr: '←',
  mdash: '—',
  ndash: '–',
  bull: '•',
};

function decodeHtmlEntities(input) {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (full, name) => NAMED_ENTITIES[name] ?? full);
}

function parseAttributes(rawAttrs) {
  const attrs = {};
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let match;
  while ((match = re.exec(rawAttrs)) !== null) {
    const name = match[1].toLowerCase();
    const val = match[2] ?? match[3] ?? match[4] ?? '';
    attrs[name] = decodeHtmlEntities(val);
  }
  return attrs;
}

function parseHtmlTree(html) {
  const cleaned = html.replace(/<!--[\s\S]*?-->/g, '');
  const root = { type: 'element', tag: 'document', attrs: {}, children: [] };
  const stack = [root];
  const tokenRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>|([^<]+)/g;
  let match;

  while ((match = tokenRe.exec(cleaned)) !== null) {
    if (match[5] !== undefined) {
      const text = decodeHtmlEntities(match[5]);
      stack[stack.length - 1].children.push({ type: 'text', text });
      continue;
    }

    const isClose = match[1] === '/';
    const tag = match[2].toLowerCase();
    const rawAttrs = match[3] || '';
    const selfClosing = match[4] === '/' || VOID_TAGS.has(tag);

    if (isClose) {
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
    } else {
      const node = {
        type: 'element',
        tag,
        attrs: parseAttributes(rawAttrs),
        children: [],
      };
      stack[stack.length - 1].children.push(node);
      if (!selfClosing) {
        stack.push(node);
      }
    }
  }

  return root;
}

function isHiddenNode(node, insideArticle = false) {
  if (node.type !== 'element') return false;
  if (['script', 'style', 'noscript', 'nav', 'footer', 'form', 'button', 'svg'].includes(node.tag)) {
    return true;
  }
  if (node.tag === 'header' && !insideArticle) {
    return true;
  }
  if ('hidden' in node.attrs) return true;
  if ((node.attrs['aria-hidden'] || '').toLowerCase() === 'true') return true;
  const style = (node.attrs.style || '').replace(/\s+/g, '').toLowerCase();
  if (style.includes('display:none')) return true;
  return false;
}

function findFirstElement(node, predicate) {
  if (node.type !== 'element') return null;
  if (predicate(node)) return node;
  for (const child of node.children) {
    const found = findFirstElement(child, predicate);
    if (found) return found;
  }
  return null;
}

function collectText(node, insideArticle = false) {
  if (node.type === 'text') return node.text;
  if (isHiddenNode(node, insideArticle)) return '';
  const nextInsideArticle = insideArticle || node.tag === 'article';
  return node.children.map((c) => collectText(c, nextInsideArticle)).join('');
}

function collectRawText(node) {
  if (node.type === 'text') return node.text;
  return node.children.map(collectRawText).join('');
}

// Conversor SSR em Node puro (zero dependência de Chromium/Puppeteer).
export function htmlToMarkdown(html, sourceUrl) {
  const tree = parseHtmlTree(html);
  const root =
    findFirstElement(tree, (n) => n.tag === 'main') ||
    findFirstElement(tree, (n) => n.attrs.id === 'root') ||
    tree;

  const h1 = findFirstElement(root, (n) => n.tag === 'h1');
  if (!h1) {
    throw new Error(`Conteúdo público sem título em ${sourceUrl}`);
  }

  const escape = (text) => text.replace(/\s+/g, ' ').replace(/([\\`*_[\]<>])/g, '\\$1');
  const title = escape(collectRawText(h1)).trim();
  if (!title) {
    throw new Error(`Título H1 vazio em ${sourceUrl}`);
  }

  const renderNode = (node, insideArticle = false) => {
    if (node.type === 'text') return escape(node.text);
    if (isHiddenNode(node, insideArticle)) return '';
    if (node.tag === 'h1') return '';
    const nextInsideArticle = insideArticle || node.tag === 'article';
    const content = node.children.map((c) => renderNode(c, nextInsideArticle)).join('');

    if (/^h[2-6]$/.test(node.tag)) {
      const clean = content.trim();
      return clean ? `\n\n${'#'.repeat(Number(node.tag[1]))} ${clean}\n\n` : '';
    }
    if (node.tag === 'a') {
      const href = node.attrs.href;
      if (!href || !content.trim()) return content;
      try {
        const url = new URL(href, sourceUrl);
        if (!['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol)) return content;
        return `[${content.trim()}](${url.href.replace(/\(/g, '%28').replace(/\)/g, '%29')})`;
      } catch {
        return content;
      }
    }
    if (node.tag === 'strong' || node.tag === 'b') {
      const clean = content.trim();
      return clean ? `**${clean}**` : '';
    }
    if (node.tag === 'em' || node.tag === 'i') {
      const clean = content.trim();
      return clean ? `*${clean}*` : '';
    }
    if (node.tag === 'li') return `\n- ${content.trim()}`;
    if (node.tag === 'br') return '\n';
    if (['p', 'div', 'section', 'article', 'header', 'ul', 'ol', 'details', 'blockquote'].includes(node.tag)) {
      const clean = content.trim();
      return clean ? `\n\n${clean}\n\n` : '';
    }
    if (node.tag === 'summary') {
      const clean = content.trim();
      return clean ? `\n\n**${clean}**\n\n` : '';
    }
    return content;
  };

  const body = renderNode(root)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return `# ${title}\n\n${body}\n\nFonte: ${sourceUrl}\n`;
}

export function extractVisibleTextLength(html) {
  const tree = parseHtmlTree(html);
  const root =
    findFirstElement(tree, (n) => n.tag === 'main') ||
    findFirstElement(tree, (n) => n.attrs.id === 'root') ||
    findFirstElement(tree, (n) => n.tag === 'body') ||
    tree;
  const text = collectText(root).replace(/\s+/g, ' ').trim();
  return text.length;
}

export function validateHeadingHierarchy(html) {
  const tree = parseHtmlTree(html);
  const root =
    findFirstElement(tree, (n) => n.attrs.id === 'root') ||
    findFirstElement(tree, (n) => n.tag === 'body') ||
    tree;
  const headings = [];

  const walk = (node) => {
    if (node.type !== 'element') return;
    if (['script', 'style', 'noscript', 'svg'].includes(node.tag)) return;
    if ('hidden' in node.attrs || (node.attrs['aria-hidden'] || '').toLowerCase() === 'true') return;
    const style = (node.attrs.style || '').replace(/\s+/g, '').toLowerCase();
    if (style.includes('display:none')) return;

    if (/^h[1-6]$/.test(node.tag)) {
      headings.push({
        level: Number(node.tag[1]),
        text: collectRawText(node).replace(/\s+/g, ' ').trim(),
      });
    }
    for (const child of node.children) {
      walk(child);
    }
  };

  walk(root);

  const errors = [];
  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count === 0) {
    errors.push('Nenhum H1 encontrado.');
  } else if (h1Count > 1) {
    errors.push(`Foram encontrados ${h1Count} H1 na página (esperado apenas 1).`);
  }
  if (headings.length > 0 && headings[0].level !== 1) {
    errors.push(`Primeiro heading é h${headings[0].level} em vez de h1.`);
  }
  for (let i = 1; i < headings.length; i += 1) {
    const prev = headings[i - 1].level;
    const curr = headings[i].level;
    if (curr > prev + 1) {
      errors.push(`Salto de heading de h${prev} para h${curr} ("${headings[i].text}").`);
    }
  }

  return {
    valid: errors.length === 0,
    headings,
    errors,
  };
}
