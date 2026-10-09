// Renders product cards from products.json using DOM APIs and textContent only.
const DATA_URL = 'platform-assets/data/products.json';
// Only these routes may ever become links, whatever the data file says.
const APPROVED_ROUTES = new Set(['/new-t/', '/new-k/', '/lab-report-system/']);
const STATUS_LABEL = { available: 'Available', coming_soon: 'Coming soon' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const isText = (v) => typeof v === 'string' && v.trim() !== '';
const isValid = (p) => p && isText(p.name) && isText(p.description) && isText(p.category) && isText(p.status);
const isLinkable = (p) => p.status === 'available' && typeof p.route === 'string' && APPROVED_ROUTES.has(p.route);

function buildCard(p) {
  const available = p.status === 'available';
  const card = el('article', `card ${available ? 'card--available' : 'card--planned'}`);
  const footer = el('div', 'card-footer');

  const badge = el('span', `badge ${available ? 'badge--available' : 'badge--planned'}`,
    STATUS_LABEL[p.status] || 'Unavailable');
  footer.append(badge);

  if (isLinkable(p)) {
    const link = el('a', 'button', 'Open product');
    link.href = p.route;
    link.setAttribute('aria-label', `Open ${p.name}`);
    footer.append(link);
  } else if (available) {
    footer.append(el('span', 'card-category', 'Currently unavailable'));
    console.warn(`Product "${p.name}" has no approved route and is not linked.`);
  }
  // Planned products get no link or button of any kind.

  card.append(el('h4', '', p.name), el('p', 'card-category', p.category), el('p', 'card-desc', p.description), footer);
  return card;
}

function buildGroup(title, products) {
  const group = el('div', 'catalogue-group');
  const grid = el('div', 'card-grid');
  grid.append(...products.map(buildCard));
  group.append(el('h3', '', title), grid);
  return group;
}

export async function loadProducts(container) {
  const note = el('p', 'state', 'Loading products…');
  note.setAttribute('role', 'status');
  container.prepend(note);
  try {
    const res = await fetch(DATA_URL, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = (Array.isArray(data.products) ? data.products : [])
      .filter(isValid)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    if (!items.length) throw new Error('No valid products');
    const groups = [];
    const live = items.filter((p) => p.status === 'available');
    const planned = items.filter((p) => p.status !== 'available');
    if (live.length) groups.push(buildGroup('Available now', live));
    if (planned.length) groups.push(buildGroup('Planned', planned));
    container.replaceChildren(...groups); // also removes the static fallback
  } catch (err) {
    console.error('Could not load products:', err);
    note.textContent = 'The full product list could not be loaded. The available products can still be opened below.';
    note.setAttribute('role', 'alert');
    note.classList.add('state--error');
  }
}
