/**
 * FlowButton – animated arrow-flow button (vanilla JS)
 *
 * Usage:
 *   import { FlowButton } from './components/ui/flow-button.js';
 *
 *   const btn = FlowButton('See Pricing', () => location.href = '#pricing');
 *   document.querySelector('.hero').appendChild(btn);
 *
 * Or to upgrade an existing <button> in place:
 *   FlowButton.upgrade(document.querySelector('#myBtn'));
 */

const ARROW_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

function FlowButton(text = 'Click me', onClick = null) {
  const btn = document.createElement('button');
  btn.className = 'flow-btn';
  btn.innerHTML = `
    <span class="flow-btn__arrow-l">${ARROW_SVG}</span>
    <span class="flow-btn__fill"></span>
    <span class="flow-btn__text">${text}</span>
    <span class="flow-btn__arrow-r">${ARROW_SVG}</span>
  `;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}

/**
 * Upgrade an existing <button> element to a FlowButton in-place.
 * Preserves all existing attributes (id, onclick, class, etc.).
 */
FlowButton.upgrade = function (el) {
  if (!el || el.dataset.flowUpgraded) return;
  const text = el.textContent.trim();
  el.innerHTML = `
    <span class="flow-btn__arrow-l">${ARROW_SVG}</span>
    <span class="flow-btn__fill"></span>
    <span class="flow-btn__text">${text}</span>
    <span class="flow-btn__arrow-r">${ARROW_SVG}</span>
  `;
  el.classList.add('flow-btn');
  el.dataset.flowUpgraded = '1';
};

export { FlowButton };
