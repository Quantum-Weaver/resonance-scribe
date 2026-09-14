<script lang="ts">
	// THE DOOR IN — the leading-in, on the-epagoge.
	//
	// THE WALK IS THE WATER'S, not this room's. `beginWalk` builds it, `enter`
	// records a free answer, `toggleChoice` records a theme BY KEY, `skip`
	// passes a step by, `dots` draws the progression and `completion` says what
	// was given and what was not. This room supplies the particulars and the
	// dress, and keeps no second copy of where the walk stands.
	//
	// ADVICE NEVER GATES. Every step can be skipped, an empty answer is an
	// honest null, and the by-line and the contact block may both be left blank
	// — the manuscript road notes an absent contact block and never invents one.
	//
	// THE SAVE IS A TASK STEP, so a base that will not answer is told as data:
	// `taskTrouble` carries one plain sentence onto the screen and the walk
	// stands where it is. Nothing here throws.

	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import { authorStore } from '$lib/stores/author.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { PRESET_THEMES, presetSwatch } from '$lib/theme/theme';
	import {
		advance,
		beginWalk,
		current,
		dots,
		completion,
		enter,
		isDone,
		skip,
		taskBegun,
		taskDone,
		taskTrouble,
		toggleChoice,
		type StepDef,
		type Walk
	} from '$lib/epagoge';

	// The key is what is stored; the display name is dress and is recorded nowhere.
	const themeOffers = Object.entries(PRESET_THEMES).map(([key, t]) => ({
		key,
		name: t.presetName,
		icon: t.icon ?? '✨',
		accent: t.accentColor,
		swatch: presetSwatch(t)
	}));

	const STEPS: StepDef[] = [
		{ id: 'welcome', kind: 'threshold' },
		{ id: 'name', kind: 'entry' },
		{ id: 'byline', kind: 'entry' },
		{ id: 'contact', kind: 'entry' },
		{ id: 'theme', kind: 'choose', atMost: 1, preset: ['dark'], offers: themeOffers },
		{ id: 'keep', kind: 'task' }
	];

	const begun = beginWalk(STEPS);
	let walk = $state<Walk>(begun.walk ?? beginWalk([{ id: 'welcome', kind: 'threshold' }]).walk!);
	const beginTrouble = begun.trouble;

	let nameBox = $state('');
	let bylineBox = $state('');
	let contactBox = $state('');
	let stood = $state(false);

	const step = $derived(current(walk));
	const progress = $derived(dots(walk));
	const chosenTheme = $derived((walk.choices['theme'] ?? ['dark'])[0] ?? 'dark');
	const keeping = $derived(walk.tasks['keep'] ?? { phase: 'idle', trouble: null });

	// An author already standing fills the boxes once, so walking the door again
	// shows what stands rather than an empty room.
	onMount(() => {
		void (async () => {
			const who = await authorStore.load();
			if (!who) return;
			stood = true;
			nameBox = who.name;
			bylineBox = who.byline;
			contactBox = who.contact;
		})();
	});

	const boxFor = (id: string): string =>
		id === 'name' ? nameBox : id === 'byline' ? bylineBox : contactBox;

	function onward() {
		const here = step;
		if (here && here.kind === 'entry') walk = enter(walk, boxFor(here.id));
		walk = advance(walk);
	}

	function pass() {
		walk = skip(walk);
	}

	function pickTheme(key: string) {
		walk = toggleChoice(walk, key);
		themeStore.setPreset((walk.choices['theme'] ?? ['dark'])[0] ?? 'dark');
	}

	/** The one write: what the walk gathered, into the one author row. */
	async function keep() {
		walk = taskBegun(walk);
		const done = completion(walk);
		themeStore.setPreset((done.choices['theme'] ?? ['dark'])[0] ?? 'dark');
		const saved = await authorStore.save(
			done.entries['name'] ?? '',
			done.entries['byline'] ?? '',
			done.entries['contact'] ?? ''
		);
		if (!saved) {
			walk = taskTrouble(
				walk,
				`Nothing was written, and everything you have typed is still here — ${authorStore.refusal ?? 'the studio’s base did not answer.'}`
			);
			return;
		}
		walk = taskDone(walk);
		walk = advance(walk);
		await goto('/');
	}

	const gathered = $derived(completion(walk));
	const skippedNames = $derived(
		gathered.skipped
			.map((id) =>
				id === 'name'
					? 'your name'
					: id === 'byline'
						? 'the by-line'
						: id === 'contact'
							? 'the contact block'
							: id === 'theme'
								? 'the theme'
								: id
			)
			.filter((n) => n !== 'welcome' && n !== 'keep')
	);
</script>

<svelte:head><title>The door in — Resonance Scribe</title></svelte:head>

{#snippet dotsRow()}
	<div
		class="progress"
		role="progressbar"
		aria-label={progress.label}
		aria-valuenow={progress.valuenow}
		aria-valuemin={progress.valuemin}
		aria-valuemax={progress.valuemax}
	>
		{#each progress.states as s, i (i)}
			<span class="dot" class:active={s === 'active'} class:done={s === 'past'}></span>
		{/each}
		<span class="step-label">{progress.label}</span>
	</div>
{/snippet}

<div class="walk">
	{#if beginTrouble}
		<p class="line">{beginTrouble}</p>
	{:else if step?.id === 'welcome'}
		<section class="screen">
			<h1>Welcome to the studio ✍️</h1>
			<p>
				A book, a manuscript, an article, an essay — written here, kept here. The studio holds
				your works and their chapters, the eras they run through, the cast and the arcs, in one
				file on this device. Nothing is uploaded, nothing is analysed elsewhere, and there is no
				account to make.
			</p>
			<p class="quiet small">
				Four questions, and every one of them can be skipped or changed later in Settings.
			</p>
			{#if stood}
				<p class="quiet small">
					An author already stands here, and the boxes ahead carry what they say now.
				</p>
			{/if}
			<div class="row">
				<button type="button" onclick={onward}>Begin</button>
				<button type="button" class="plain" onclick={pass}>Skip</button>
			</div>
		</section>
	{:else if step?.id === 'name'}
		<section class="screen">
			<h1>What should we call you?</h1>
			<label class="field">
				<span>Your name</span>
				<input
					bind:value={nameBox}
					placeholder="a name, a nickname, anything"
					autocomplete="off"
				/>
			</label>
			<p class="quiet small">This is who you are in the studio. It is never sent anywhere.</p>
			<div class="row">
				<button type="button" onclick={onward}>Next</button>
				<button type="button" class="plain" onclick={pass}>Skip</button>
			</div>
		</section>
	{:else if step?.id === 'byline'}
		<section class="screen">
			<h1>The by-line</h1>
			<label class="field">
				<span>As it should appear on a title page</span>
				<input
					bind:value={bylineBox}
					placeholder="the name a reader sees"
					autocomplete="off"
				/>
			</label>
			<p class="quiet small">
				The bind room fills a work's by-line from this when the work carries none of its own. A
				pen name belongs here as readily as the name above.
			</p>
			<div class="row">
				<button type="button" onclick={onward}>Next</button>
				<button type="button" class="plain" onclick={pass}>Skip</button>
			</div>
		</section>
	{:else if step?.id === 'contact'}
		<section class="screen">
			<h1>The contact block</h1>
			<label class="field">
				<span>One line per line, set verbatim, in this order</span>
				<textarea
					bind:value={contactBox}
					rows="5"
					placeholder="nothing is looked up and nothing is invented"
				></textarea>
			</label>
			<p class="quiet small">
				This is the block a standard manuscript carries at the top left of its title page. It may
				be left empty: the manuscript road notes an absent block out loud and never invents one.
			</p>
			<div class="row">
				<button type="button" onclick={onward}>Next</button>
				<button type="button" class="plain" onclick={pass}>Skip</button>
			</div>
		</section>
	{:else if step?.id === 'theme'}
		<section class="screen">
			<h1>Choose an atmosphere</h1>
			<div class="themes">
				{#each themeOffers as opt (opt.key)}
					<button
						type="button"
						class="theme-card"
						class:selected={chosenTheme === opt.key}
						style="--card-accent: {opt.accent};"
						onclick={() => pickTheme(opt.key)}
						aria-pressed={chosenTheme === opt.key}
					>
						<span class="theme-icon" aria-hidden="true">{opt.icon}</span>
						<span class="theme-name">{opt.name}</span>
						<span class="theme-swatch" style="background: {opt.swatch};"></span>
					</button>
				{/each}
			</div>
			<p class="quiet small">
				Display mode, tint and type size stand beside this one in Settings, and a colour never
				resets them.
			</p>
			<div class="row">
				<button type="button" onclick={onward}>Next</button>
				<button type="button" class="plain" onclick={pass}>Skip</button>
			</div>
		</section>
	{:else if step?.id === 'keep'}
		<section class="screen">
			<h1>That is everything</h1>
			<dl class="gathered">
				<div>
					<dt>Name</dt>
					<dd>{gathered.entries['name'] ?? 'not given'}</dd>
				</div>
				<div>
					<dt>By-line</dt>
					<dd>{gathered.entries['byline'] ?? 'not given'}</dd>
				</div>
				<div>
					<dt>Contact block</dt>
					<dd>
						{gathered.entries['contact']
							? `${gathered.entries['contact']!.split('\n').length} line(s)`
							: 'empty'}
					</dd>
				</div>
				<div>
					<dt>Theme</dt>
					<dd>{chosenTheme}</dd>
				</div>
			</dl>
			{#if skippedNames.length > 0}
				<p class="quiet small">
					Passed by: {skippedNames.join(', ')}. Nothing was filled in for you, and Settings holds
					all of it.
				</p>
			{/if}
			{#if keeping.phase === 'trouble'}
				<p class="line" role="alert">{keeping.trouble}</p>
			{/if}
			<div class="row">
				<button type="button" onclick={keep} disabled={keeping.phase === 'working'}>
					{keeping.phase === 'working'
						? 'writing…'
						: keeping.phase === 'trouble'
							? 'Try again'
							: 'Save and enter the studio'}
				</button>
			</div>
		</section>
	{:else if isDone(walk)}
		<section class="screen">
			<h1>The studio is open</h1>
			<p>Everything you gave is written. The shelf is through here.</p>
			<p><a class="invite" href="/">Go to the shelf</a></p>
		</section>
	{/if}

	{@render dotsRow()}
</div>

<style>
	.walk {
		max-width: 40rem;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 3rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		min-height: 100%;
		box-sizing: border-box;
	}

	.screen {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 600;
	}

	p {
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.field span {
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	input,
	textarea {
		background: var(--bg-surface);
		color: var(--text);
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		padding: 0.5rem 0.6rem;
		font: inherit;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	textarea {
		font-family: ui-monospace, SFMono-Regular, 'Cascadia Mono', Menlo, monospace;
		font-size: 0.85rem;
		line-height: 1.5;
		resize: vertical;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		margin-top: 0.3rem;
	}

	button {
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: 0.4rem;
		padding: 0.5rem 0.9rem;
		font: inherit;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
	}

	button.plain {
		background: none;
		color: var(--text-secondary);
		border: 1px solid var(--border-color);
	}

	button:disabled {
		opacity: 0.45;
		cursor: default;
	}

	.themes {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
		gap: 0.6rem;
	}

	.theme-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		padding: 0.9rem 0.5rem 0.7rem;
		background: var(--bg-surface);
		color: var(--text-secondary);
		border: 2px solid var(--border-color);
		border-radius: 0.7rem;
		font-weight: 500;
	}

	.theme-card.selected {
		border-color: var(--card-accent);
		color: var(--text);
	}

	.theme-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.theme-name {
		font-size: 0.78rem;
	}

	.theme-swatch {
		width: 26px;
		height: 4px;
		border-radius: 2px;
	}

	.gathered {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.85rem;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.8rem 0.9rem;
	}

	.gathered div {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
	}

	.gathered dt {
		color: var(--text-muted);
		min-width: 7rem;
	}

	.gathered dd {
		color: var(--text);
		overflow-wrap: anywhere;
	}

	.line {
		border-left: 2px solid var(--accent);
		padding-left: 0.75rem;
		color: var(--text);
		line-height: 1.55;
		overflow-wrap: anywhere;
	}

	.progress {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin-top: auto;
		padding-top: 1rem;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 4px;
		background: var(--border-color);
	}

	.dot.active {
		width: 22px;
		background: var(--accent);
	}

	.dot.done {
		background: color-mix(in srgb, var(--accent) 45%, var(--border-color));
	}

	.step-label {
		margin-left: 0.5rem;
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	.invite {
		color: var(--accent);
		font-weight: 600;
	}

	.quiet {
		color: var(--text-muted);
	}

	.small {
		font-size: 0.8rem;
		line-height: 1.55;
	}
</style>
