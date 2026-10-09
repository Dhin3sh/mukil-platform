import { loadProducts } from './components/product-cards.js';

const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

function setNav(open) {
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
}
const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

if (toggle && nav) {
  toggle.addEventListener('click', () => setNav(!isOpen()));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setNav(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 44.0625rem)').addEventListener('change', () => setNav(false));
}

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

const catalogue = document.getElementById('product-catalogue');
if (catalogue) loadProducts(catalogue);
