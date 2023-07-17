<script lang="ts">
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

<div class="h-screen w-screen">
	<div class="flex flex-col align-middle justify-center">
		<div class="w-100 mt-52 prose mx-auto">
			{#await data.props.html}
				<!-- A Loading spinner or something -->
			{:then value}
				<script lang="ts">
					function copyCode(button: HTMLButtonElement) {
						// prettier-ignore
						const codeBlock = button.parentNode?.nextElementSibling as HTMLElement;
						const code = codeBlock?.textContent;
						if (code) {
							navigator.clipboard.writeText(code).then(() => {
								button.textContent = 'Copied!';
								setTimeout(() => {
									button.textContent = 'Copy';
								}, 1000);
							});
						}
					}
				</script>
				{@html value}
			{:catch error}
				<!-- Handle the error while parsing the markdown -->
			{/await}
		</div>
	</div>
</div>
