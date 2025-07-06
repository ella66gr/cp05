<!-- Reusable Navbar with placeholder dropdown menus -->

<script lang="ts">
	import {
		Navbar,
		NavBrand,
		NavUl,
		NavLi,
		Dropdown,
		DropdownItem,
		DarkMode
	} from 'flowbite-svelte';

	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';

	const activeUrl = derived(page, ($page) => $page.url.pathname);
	let activeUrlValue: string;
	$: activeUrl.subscribe(value => activeUrlValue = value);
</script>

<Navbar>
	<NavBrand href="/">
		<span
			class="text-4xl pl-10 font-semibold whitespace-nowrap text-green-500 dark:text-green-400"
			>CP05 <span class="text-black dark:text-white">Profile Editor</span></span
		>
	</NavBrand>

	<NavUl activeUrl={activeUrlValue}>
		<NavLi href="/">Home</NavLi>

		<!-- Inputs group -->
		<NavLi class="cursor-pointer">
			Nav 1<ChevronDownOutline class="text-primary-800 ms-2 inline h-6 w-6 dark:text-white" />
		</NavLi>
		<Dropdown simple class="w-44" activeUrl={activeUrlValue}>
			<DropdownItem href="/nav-1">Nav-1</DropdownItem>
		</Dropdown>

	</NavUl>

	<!-- ✅ Valid placement of toggle outside <NavUl> to avoid nesting inside <button> -->
	<div class="flex items-center pr-4">
		<DarkMode />
	</div>
</Navbar>