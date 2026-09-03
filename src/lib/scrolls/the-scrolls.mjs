// The scrolls — the card→popout class: title rolled, markdown body unrolled.
// Depth available, never imposed.
// STANDALONE BY LAW: framework-free, zero imports, one file.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/** Escape first — always, before any shaping. */
export function escapeText(text) {
	return String(text).replace(/[&<>"]/g, (c) => ESCAPES[c]);
}

/** Inline shaping on ALREADY-ESCAPED text: bold then italic. */
function inline(escaped) {
	return escaped
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/**
 * The pure renderer: markdown subset in, honest HTML out.
 * Headings (# ## ###), bold, italic, bullets, checklists — the five
 * named forms. Anything else is a plain paragraph.
 */
export function renderScrollBody(markdown) {
	const lines = String(markdown).replace(/\r\n?/g, '\n').split('\n');
	const out = [];
	let listOpen = false;
	const closeList = () => { if (listOpen) { out.push('</ul>'); listOpen = false; } };
	for (const raw of lines) {
		const line = raw.trim();
		if (line === '') { closeList(); continue; }
		const esc = escapeText(line);
		const heading = /^(#{1,3})\s+(.*)$/.exec(line);
		if (heading) {
			closeList();
			const depth = heading[1].length;
			out.push(`<div class="scroll-h${depth}" role="heading" aria-level="${depth + 3}">${inline(escapeText(heading[2]))}</div>`);
			continue;
		}
		const check = /^-\s+\[( |x|X)\]\s+(.*)$/.exec(line);
		if (check) {
			if (!listOpen) { out.push('<ul class="scroll-list">'); listOpen = true; }
			const done = check[1].toLowerCase() === 'x';
			out.push(`<li class="scroll-check${done ? ' done' : ''}"><span class="mark" aria-hidden="true">${done ? '☑' : '☐'}</span> ${inline(escapeText(check[2]))}</li>`);
			continue;
		}
		const bullet = /^-\s+(.*)$/.exec(line);
		if (bullet) {
			if (!listOpen) { out.push('<ul class="scroll-list">'); listOpen = true; }
			out.push(`<li>${inline(escapeText(bullet[1]))}</li>`);
			continue;
		}
		closeList();
		out.push(`<p>${inline(esc)}</p>`);
	}
	closeList();
	return out.join('\n');
}

const SCROLL_STYLE = `
	:host { display: block; font: inherit; color: inherit;
		border: 1px solid var(--scroll-edge, rgba(128,128,128,.35));
		border-radius: var(--scroll-radius, 10px);
		background: var(--scroll-face, rgba(128,128,128,.06)); }
	button.title { all: unset; display: flex; gap: .5em; align-items: baseline;
		width: 100%; box-sizing: border-box; cursor: pointer;
		padding: .55em .8em; font-weight: 600; }
	button.title:focus-visible { outline: 2px solid var(--scroll-focus, #7c6cd6); outline-offset: 2px; border-radius: inherit; }
	.hinge { opacity: .6; transition: transform 160ms ease; }
	:host([open]) .hinge { transform: rotate(90deg); }
	@media (prefers-reduced-motion: reduce) { .hinge { transition: none; } }
	.body { display: none; padding: 0 .9em .8em; line-height: 1.5; }
	:host([open]) .body { display: block; }
	.body p { margin: .4em 0; }
	.body .scroll-h1 { font-size: 1.15em; font-weight: 700; margin: .6em 0 .2em; }
	.body .scroll-h2 { font-size: 1.05em; font-weight: 700; margin: .5em 0 .2em; }
	.body .scroll-h3 { font-size: 1em; font-weight: 600; margin: .4em 0 .2em; }
	.body ul.scroll-list { margin: .3em 0; padding-left: 1.2em; list-style: disc; }
	.body li.scroll-check { list-style: none; margin-left: -1.2em; }
	.body li.scroll-check.done { opacity: .75; }
`;

class TheScroll extends (typeof HTMLElement !== 'undefined' ? HTMLElement : class {}) {
	connectedCallback() {
		if (this.shadowRoot) return;
		const title = this.getAttribute('title') ?? 'untitled scroll';
		const source = this.textContent ?? '';
		const root = this.attachShadow({ mode: 'open' });
		const style = document.createElement('style');
		style.textContent = SCROLL_STYLE;
		const button = document.createElement('button');
		button.className = 'title';
		button.setAttribute('aria-expanded', this.hasAttribute('open') ? 'true' : 'false');
		button.innerHTML = `<span class="hinge" aria-hidden="true">▸</span><span>${escapeText(title)}</span>`;
		const body = document.createElement('div');
		body.className = 'body';
		body.innerHTML = renderScrollBody(source);
		button.addEventListener('click', () => {
			const open = this.toggleAttribute('open');
			button.setAttribute('aria-expanded', open ? 'true' : 'false');
		});
		root.append(style, button, body);
	}
}

if (typeof customElements !== 'undefined' && !customElements.get('the-scroll')) {
	customElements.define('the-scroll', TheScroll);
}

export { TheScroll };
