<!-- src/routes/components/+page.svelte -->

<script>
  import { 
    Button, 
    Card, 
    Badge, 
  
    Breadcrumb,
    BreadcrumbItem
  } from 'flowbite-svelte';

  import { ArrowRightOutline } from "flowbite-svelte-icons";
  
</script>

<svelte:head>
    <title>CP04 Control Panel</title>
</svelte:head>

<!-- MAIN CONTAINER -->

<div class="min-h-screen bg-green-100 dark:bg-gray-900">

  <!-- HEADER SECTION - Full width -->

  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">

      <!-- Breadcrumb -->
      <div class="mb-6">
        <Breadcrumb>
          <BreadcrumbItem href="/" home>Home</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <!-- Top panel -->
      <div class="text-center">
        <h1 class="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
          <span class="text-gray-500">CP04</span> Profile Control Panel
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Ella's Initial profile control panel prototype.
        </p>
      </div>

    </div>
  </div>

  <!-- BODY SECTION -->

  <!-- MAIN PANEL - Full width -->
   
  <div class="bg-white dark:bg-gray-800 border-l border-r border-b border-gray-200 dark:border-gray-700 mt-0">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <!-- Text  -->
      <div class="text-center">
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Main panel
        </p>
      </div>
      
      <!-- Grid section -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        <div>
          <Card class="p-4 sm:p-6 md:p-8 min-w-full">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">CARD 1. Noteworthy technology acquisitions 2021</h5>
          <p class="leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
          </Card>
        </div>

        <div>
          <Card class="p-4 sm:p-6 md:p-8 min-w-full">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">CARD 2. Noteworthy technology acquisitions 2021</h5>
          <p class="leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
          </Card>
        </div>

        <div>
          <Card class="p-4 sm:p-6 md:p-8 min-w-full">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">CARD 3. Noteworthy technology acquisitions 2021</h5>
          <p class="leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
          </Card>
        </div>

        <div>
          <Card class="p-4 sm:p-6 md:p-8 min-w-full">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">CARD 4. Noteworthy technology acquisitions 2021</h5>
          <p class="leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
          </Card>
        </div>

        <div>
          <Card class="rounded-none shadow-none min-w-full">
          <h5>CARD 4A. Noteworthy technology acquisitions 2021</h5>
          <p>Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
          </Card>
        </div>

      </div>
      <!-- End of Grid Section -->

      <!-- Card -->
      <div class="py-6 px-0">
        <Card class="p-4 sm:p-6 md:p-8">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">CARD 5. Noteworthy technology acquisitions 2021</h5>
        <p class="leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
        </Card>
      </div>

      <div>
        <Card class="p-4 sm:p-6 md:p-8">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">CARD 6. Noteworthy technology acquisitions 2021</h5>
          <p class="leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
        </Card>
      </div>

    </div>

  </div>
</div>
