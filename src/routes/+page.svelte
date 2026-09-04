<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageServerData } from './$types';

	export let data: PageServerData;

	/**
	 * One delegated listener for every copy button on the page.
	 *
	 * The plugin emits `data-copy-code` rather than an inline `onclick`, because
	 * an inline handler attribute counts as inline script under a
	 * Content-Security-Policy — it would need 'unsafe-inline', or 'unsafe-hashes'
	 * plus a SHA-256 of the exact attribute text, and a nonce cannot help because
	 * there is no <script> element to carry one. Delegation also means buttons
	 * added to the DOM later are already wired.
	 */
	onMount(() => {
		const onClick = async (event: MouseEvent) => {
			const target = event.target as HTMLElement | null;
			const button = target?.closest<HTMLButtonElement>('[data-copy-code]');
			if (!button) return;

			const code = button.closest('.code-block')?.querySelector('code')?.textContent;
			if (!code) return;

			await navigator.clipboard.writeText(code);
			button.textContent = 'Copied';
			setTimeout(() => {
				button.textContent = 'Copy';
			}, 1000);
		};

		document.addEventListener('click', onClick);
		return () => document.removeEventListener('click', onClick);
	});
</script>

<div class="h-screen w-screen">
	<div class="flex flex-col align-middle justify-center">
		<div class="w-100 mt-52 prose mx-auto">
			{#await data.props.html}
				<!-- A Loading spinner or something -->
			{:then value}
				{@html value}
			{:catch error}
				<!-- Handle the error while parsing the markdown -->
			{/await}
		</div>
	</div>
</div>

<style>
	/* The plugin emits semantic class names rather than a long utility string, so
	   the presentation lives here where it can be overridden, and the tree stays
	   readable to anything that inspects it. */
	:global(.code-block) {
		border-radius: 0.375rem;
		overflow: hidden;
		background: rgb(23 23 23 / 0.7);
	}

	:global(.code-block__bar) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.25rem 1rem;
		font-size: 0.875rem;
		color: rgb(241 245 249);
		background: rgb(59 130 246);
	}

	:global(.code-block__lang) {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}

	:global(.code-block__copy) {
		padding: 0.125rem 0.625rem;
		border-radius: 0.25rem;
		background: rgb(255 255 255 / 0.15);
		cursor: pointer;
	}

	:global(.code-block__copy:hover) {
		background: rgb(255 255 255 / 0.25);
	}

	:global(.code-block pre) {
		margin: 0;
		border-radius: 0;
	}
</style>
