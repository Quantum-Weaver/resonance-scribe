<script lang="ts">
	// THE RAIL — five doors and the work they are all about.
	//
	// Plain links, deliberately. The mother's Sidebar derives its panels from
	// the-cumdach because she has nine rooms and a fold to arrange; this body
	// has five doors that always fit, so the arithmetic would be answering a
	// question nobody asked. What is kept from her is the IDIOM — the family's
	// tokens, the wordmark, the accent per door from QUANTUM_COLORS — written
	// fresh, not copied.
	//
	// The ComfortBar did not come back and is not coming back (S1 removed it;
	// the plan says so in as many words).
	//
	// Every door is an `<a href>`, so tab, enter, middle-click and the
	// browser's own back button all work without a line of code, and the
	// current door carries `aria-current="page"` for a reader that is
	// listening rather than looking.
	import { page } from '$app/state';
	import { QUANTUM_COLORS } from '$lib/cosmic';
	import { workStore } from '$lib/stores/work.svelte';

	interface Door {
		href: string;
		label: string;
		face: string;
		colour: string;
	}

	const DOORS: Door[] = [
		{ href: '/', label: 'Shelf', face: '📚', colour: QUANTUM_COLORS['cosmic.blue'] },
		{ href: '/desk', label: 'Desk', face: '✒️', colour: QUANTUM_COLORS['hearth.gold'] },
		{ href: '/board', label: 'Board', face: '🧵', colour: QUANTUM_COLORS['sanctuary.green'] },
		{ href: '/cast', label: 'Cast', face: '🎭', colour: QUANTUM_COLORS['quantum.purple'] },
		{ href: '/bind', label: 'Bind', face: '📖', colour: QUANTUM_COLORS['sirens.rose'] }
	];

	const here = $derived(page.url.pathname.replace(/\/$/, '') || '/');
	const chosen = $derived(workStore.work);
</script>

<nav class="rail" aria-label="The rooms">
	<span class="wordmark">Scribe</span>

	<ul>
		{#each DOORS as door (door.href)}
			<li>
				<a
					href={door.href}
					class="door"
					class:current={here === door.href}
					style="--face-colour: {door.colour}"
					aria-current={here === door.href ? 'page' : undefined}
				>
					<span class="face" aria-hidden="true">{door.face}</span>
					<span class="label">{door.label}</span>
				</a>
			</li>
		{/each}
	</ul>

	<div class="chosen">
		{#if chosen}
			<span class="chosen-what">the work</span>
			<span class="chosen-title">{chosen.title}</span>
		{:else}
			<span class="chosen-what">no work chosen</span>
			<a class="chosen-invite" href="/">Choose one on the shelf</a>
		{/if}
	</div>
</nav>

<style>
	.rail {
		flex: 0 0 auto;
		width: 12.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.1rem 0.75rem 1rem;
		background: var(--bg-surface);
		border-right: 1px solid var(--border-color);
		overflow-y: auto;
	}

	.wordmark {
		font-weight: 700;
		letter-spacing: 0.02em;
		color: var(--accent);
		padding: 0 0.45rem;
	}

	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.door {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.5rem 0.45rem;
		border-radius: 0.45rem;
		border-left: 3px solid transparent;
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.92rem;
	}

	.door:hover {
		background: color-mix(in srgb, var(--text) 7%, transparent);
		color: var(--text);
	}

	.door.current {
		background: color-mix(in srgb, var(--face-colour) 16%, transparent);
		border-left-color: var(--face-colour);
		color: var(--text);
		font-weight: 600;
	}

	.face {
		font-size: 1rem;
		line-height: 1;
	}

	.chosen {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.6rem 0.45rem 0;
		border-top: 1px solid var(--border-color);
	}

	.chosen-what {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-muted);
	}

	.chosen-title {
		font-size: 0.88rem;
		color: var(--text);
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.chosen-invite {
		font-size: 0.82rem;
		color: var(--accent);
		line-height: 1.35;
	}

	/* A narrow window turns the column into a row across the top; nothing is
	   hidden behind a hamburger, because five doors fit either way. */
	@media (max-width: 46rem) {
		.rail {
			width: auto;
			flex-direction: row;
			align-items: center;
			flex-wrap: wrap;
			gap: 0.5rem 0.75rem;
			border-right: none;
			border-bottom: 1px solid var(--border-color);
			overflow-y: visible;
		}

		ul {
			flex-direction: row;
			flex-wrap: wrap;
		}

		.door {
			border-left: none;
			border-bottom: 3px solid transparent;
			border-radius: 0.45rem 0.45rem 0 0;
		}

		.door.current {
			border-left-color: transparent;
			border-bottom-color: var(--face-colour);
		}

		.chosen {
			margin-top: 0;
			margin-left: auto;
			border-top: none;
			padding-top: 0;
			text-align: right;
		}
	}
</style>
