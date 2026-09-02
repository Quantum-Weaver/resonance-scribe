<script lang="ts">
	import '../app.css';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { getThemeColors } from '$lib/theme/theme';
	import { onMount } from 'svelte';

	let { children } = $props();

	// The mother's shell, minus her chrome: the Sidebar and the ComfortBar were
	// doors into rooms this body does not have yet. S2 brings the rail back
	// when there are four rooms for it to point at.
	onMount(() => {
		themeStore.loadTheme();
	});

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
</style>
