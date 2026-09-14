<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Rail from '$lib/components/Rail.svelte';
	import { authorStore } from '$lib/stores/author.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { workStore } from '$lib/stores/work.svelte';
	import { getThemeColors } from '$lib/theme/theme';
	import { onMount } from 'svelte';

	let { children } = $props();

	// ONE SHELL, ONE RAIL, THE ROOMS AS ROUTES — the conductor's reading of
	// the plan's "one page, four rooms". The shell and the rail are drawn once
	// here; `/`, `/desk`, `/board`, `/cast`, `/bind`, `/settings` and
	// `/onboarding` are static routes in SPA mode (`ssr = false`,
	// adapter-static) and there is no `[id]` route anywhere: the chosen work is
	// held in a runes store, not in the URL, so it survives every walk between
	// rooms and every reload.
	//
	// The Sidebar and the ComfortBar did not cross from the mother. The rail is
	// this body's own, written to the family's idiom rather than copied.
	//
	// THE GATE, ONCE, ON FIRST PAINT. A studio with no author row opens at the
	// door in. It asks the base exactly once — `onMount` runs once for the
	// shell, not once per room — so there is no loop to fall into, and a base
	// that will not answer (no Tauri window: `invoke` rejects) leaves every
	// room standing and says nothing at all.
	onMount(() => {
		themeStore.loadTheme();
		// The work chosen in an earlier sitting, re-read from the base by id.
		// A work that is gone clears itself; nothing is drawn from a cache.
		void workStore.restore();
		void gate();
	});

	async function gate() {
		await authorStore.load();
		if (!authorStore.absent) return;
		const here = page.url.pathname.replace(/\/$/, '') || '/';
		if (here === '/onboarding') return;
		await goto('/onboarding');
	}

	const config = $derived(themeStore.config);
	const colors = $derived(getThemeColors(config));

	// rem units are relative to <html>, not .app-shell — must update root font-size
	$effect(() => {
		const fs = themeStore.config.fontSize;
		document.documentElement.style.fontSize =
			fs === 'small' ? '14px' : fs === 'large' ? '18px' : '16px';
	});
</script>

<div
	class="app-shell"
	style="
		--bg: {colors.background};
		--accent: {colors.accent};
		--text: {colors.text};
		--text-secondary: {colors.textSecondary};
		--text-muted: {colors.textMuted};
		--bg-surface: {colors.surface};
		--border-color: {colors.border};
	"
>
	<Rail />
	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.app-shell {
		display: flex;
		height: 100vh;
		max-width: 100vw;
		overflow: hidden;
		background-color: var(--bg);
		color: var(--text);
	}

	.main-content {
		flex: 1;
		/* min-width: 0 — flex children default to min-width auto, so a wide descendant would stretch the shell past the viewport. */
		min-width: 0;
		max-width: 100%;
		overflow-y: auto;
		overflow-x: hidden;
	}

	/* The rail's own media query turns it into a row at the same width; the
	   shell has to stack for that to be a top bar rather than a squeezed
	   column. One breakpoint, named in two files, and they agree. */
	@media (max-width: 46rem) {
		.app-shell {
			flex-direction: column;
		}
	}
</style>
