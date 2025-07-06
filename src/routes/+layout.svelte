<!-- src/routes/+layout.svelte -->

<script lang="ts">
	import '$app/environment'; // required in Vite+SvelteKit for envs
	import '../app.css'; // ✅ ensures Tailwind + Flowbite styles are active
	import Navbar from '$lib/components/Navbar.svelte';
</script>

<!-- Fixed/Sticky Navbar Container -->
<div class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
	<Navbar />
</div>

<!-- Main content with top padding to account for fixed navbar -->
<main class="px-6 py-4 pt-20">
	<slot />
</main>