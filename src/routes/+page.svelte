<!-- src/routes/components/+page.svelte -->

<script lang="ts">
  import { 
    Button,
    Dropdown,
    DropdownItem,
    Card,
    Input,
    Textarea,
    Label,
    Helper,
    Checkbox,
    Select,
    Badge, 
    Range
  } from 'flowbite-svelte';

  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell
  } from "flowbite-svelte";

  import { AlignJustifyOutline, ChevronDownOutline, DownloadOutline, UploadOutline, TrashBinOutline, CheckCircleOutline, ExclamationCircleOutline } from "flowbite-svelte-icons";
  import { onMount } from 'svelte';

  // Form variables
  let profile_name = '';
  let criterion1 = '';
  let criterion2 = '';
  let criterion3 = '';
  let profile_description = '';
  let tone_of_voice = '';
  let stepValue = 150;
  let newRssUrl = '';
  let newFeedName = '';

  // Category tags with binding
  let categoryTags = {
    inTheNews: false,
    transHealth: false,
    genderSenseLatest: false,
    transitionCoaching: false,
    communityHighlights: false,
    transRights: false
  };

  // RSS Feed data with selection state
  let rssFeeds: RSSFeed[] = [];

  // Storage key
  const STORAGE_KEY = 'cp04_profile_data';

  // Load data from localStorage on component mount
  onMount(() => {
    isClient = true;
    loadFromStorage();
  });

  // Browser-only storage functions
  let isClient = false;

  // Save data to localStorage
  function saveToStorage() {
    if (!isClient) return;
    
    const profileData = {
      profile_name,
      profile_description,
      tone_of_voice,
      criterion1,
      criterion2,
      criterion3,
      stepValue,
      categoryTags,
      rssFeeds: rssFeeds.map(feed => ({ ...feed, selected: false })), // Don't save selection state
      lastSaved: new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
      console.log('Profile data saved to localStorage');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      console.log('Failed to save profile data. Storage might be full.');
    }
  }

  // Load data from localStorage
  function loadFromStorage() {
    if (!isClient) return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const profileData = JSON.parse(saved);
        
        // Restore form fields
        profile_name = profileData.profile_name || '';
        profile_description = profileData.profile_description || '';
        tone_of_voice = profileData.tone_of_voice || '';
        criterion1 = profileData.criterion1 || '';
        criterion2 = profileData.criterion2 || '';
        criterion3 = profileData.criterion3 || '';
        stepValue = profileData.stepValue || 150;
        
        // Restore category tags
        if (profileData.categoryTags) {
          categoryTags = { ...categoryTags, ...profileData.categoryTags };
        }
        
        // Restore RSS feeds
        if (profileData.rssFeeds) {
          rssFeeds = profileData.rssFeeds;
        }
        
        console.log('Profile data loaded from localStorage');
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }

  // Auto-save when data changes (debounced)
  let saveTimeout: ReturnType<typeof setTimeout> | undefined;
  function autoSave() {
    if (!isClient) return;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveToStorage();
    }, 1000); // Save 1 second after last change
  }

  // Reactive statements to trigger auto-save
  $: if (profile_name !== undefined) autoSave();
  $: if (profile_description !== undefined) autoSave();
  $: if (tone_of_voice !== undefined) autoSave();
  $: if (criterion1 !== undefined) autoSave();
  $: if (criterion2 !== undefined) autoSave();
  $: if (criterion3 !== undefined) autoSave();
  $: if (stepValue !== undefined) autoSave();
  $: if (categoryTags) autoSave();
  $: if (rssFeeds) autoSave();

  // Export profile as JSON
  function exportProfile() {
    // Generate default filename
    const defaultFilename = profile_name 
      ? `${profile_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-profile`
      : 'cp04-profile';
    
    // Let user customize filename
    const userFilename = prompt('Enter filename for export:', defaultFilename);
    if (userFilename === null) return; // User cancelled
    
    // Clean the filename and ensure it's valid
    const cleanFilename = userFilename.trim() || defaultFilename;
    const finalFilename = cleanFilename.endsWith('.json') 
      ? cleanFilename 
      : `${cleanFilename}.json`;

    const profileData = {
      profile_name,
      profile_description,
      tone_of_voice,
      evaluationCriteria: [criterion1, criterion2, criterion3].filter(c => c),
      summaryLength: stepValue,
      categoryTags,
      rssFeeds: rssFeeds.map(feed => ({
        id: feed.id,
        name: feed.name,
        url: feed.url,
        status: feed.status
      })),
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };

    const jsonString = JSON.stringify(profileData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Profile exported as:', finalFilename);
  }

  // Define a type for RSS Feed
  type RSSFeed = {
    id: number;
    name: string;
    url: string;
    status: string;
    selected: boolean;
    [key: string]: any; // Allow extra properties if needed
  };

  // Import profile from JSON
  function importProfile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse((e.target as FileReader).result as string);
        
        // Validate and import data
        if (importedData.profile_name !== undefined) profile_name = importedData.profile_name;
        if (importedData.profile_description !== undefined) profile_description = importedData.profile_description;
        if (importedData.tone_of_voice !== undefined) tone_of_voice = importedData.tone_of_voice;
        if (importedData.summaryLength !== undefined) stepValue = importedData.summaryLength;
        
        // Import criteria
        if (importedData.evaluationCriteria && Array.isArray(importedData.evaluationCriteria)) {
          criterion1 = importedData.evaluationCriteria[0] || '';
          criterion2 = importedData.evaluationCriteria[1] || '';
          criterion3 = importedData.evaluationCriteria[2] || '';
        }
        
        // Import category tags
        if (importedData.categoryTags) {
          categoryTags = { ...categoryTags, ...importedData.categoryTags };
        }
        
        // Import RSS feeds
        if (importedData.rssFeeds && Array.isArray(importedData.rssFeeds)) {
          rssFeeds = importedData.rssFeeds.map((feed: RSSFeed) => ({
            ...feed,
            selected: false
          }));
        }
        
        saveToStorage(); // Save imported data
        alert('Profile imported successfully!');
        console.log('Profile imported from JSON');
      } catch (error) {
        console.error('Failed to import profile:', error);
        alert('Failed to import profile. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Clear the input
    input.value = '';
  }

  // Profile validation and saving
  let saveProfileDB = () => {
    // Save to localStorage
    saveToStorage(); // This will also trigger auto-save logic - amend to redirect to DB save if needed
    
    // Simulate preparing for newsletter app integration
    const newsletterData = prepareForNewsletterApp();
    console.log('Profile ready for newsletter app:', newsletterData);
    
    alert('Profile saved successfully!');
  };
  let saveStatus: null | 'saving' | 'success' | 'error' = null; // null, 'saving', 'success', 'error'
  let validationErrors: string[] = [];
  let lastSaveTime: Date | null = null;

  // Validate profile completeness
  function validateProfile() {
    const errors = [];
    
    if (!profile_name.trim()) {
      errors.push('Profile name is required');
    }
    
    if (!tone_of_voice) {
      errors.push('Tone of voice must be selected');
    }
    
    const selectedCriteria = [criterion1, criterion2, criterion3].filter(c => c);
    if (selectedCriteria.length === 0) {
      errors.push('At least one evaluation criteria must be selected');
    }
    
    const activeFeeds = rssFeeds.filter(feed => feed.status === 'active');
    if (activeFeeds.length === 0) {
      errors.push('At least one RSS feed must be active');
    }
    
    const selectedCategories = Object.values(categoryTags).filter(Boolean);
    if (selectedCategories.length === 0) {
      errors.push('At least one category tag must be selected');
    }
    
    return errors;
  }

  // Enhanced save profile function
  function saveProfile() {
    saveStatus = 'saving';
    validationErrors = validateProfile();
    
    if (validationErrors.length > 0) {
      saveStatus = 'error';
      return;
    }
    
    try {
      // Save to localStorage
      saveToStorage();
      
      // Simulate preparing for newsletter app integration
      const newsletterData = prepareForNewsletterApp();
      console.log('Profile ready for newsletter app:', newsletterData);
      
      saveStatus = 'success';
      lastSaveTime = new Date();
      
      // Reset status after 3 seconds
      setTimeout(() => {
        saveStatus = null;
      }, 3000);
      
    } catch (error) {
      console.error('Failed to save profile:', error);
      saveStatus = 'error';
      validationErrors = ['Failed to save profile. Please try again.'];
    }
  }

  // Prepare data specifically for newsletter app
  function prepareForNewsletterApp() {
    return {
      profileId: profile_name.toLowerCase().replace(/\s+/g, '-'),
      name: profile_name,
      description: profile_description,
      settings: {
        toneOfVoice: tone_of_voice,
        summaryLength: stepValue,
        evaluationCriteria: [criterion1, criterion2, criterion3].filter(c => c)
      },
      contentSources: rssFeeds.filter(feed => feed.status === 'active').map(feed => ({
        name: feed.name,
        url: feed.url,
        type: 'rss'
      })),
      contentCategories: Object.entries(categoryTags)
        .filter(([key, value]) => value)
        .map(([key, value]) => key),
      lastUpdated: new Date().toISOString()
    };
  }

  // Cancel function - revert to last saved state
  function cancelChanges() {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      loadFromStorage();
      saveStatus = null;
      validationErrors = [];
    }
  }
  function clearAllData() {
    if (!isClient) return;
    
    if (confirm('Are you sure you want to clear all profile data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      // Reset all form fields
      profile_name = '';
      profile_description = '';
      tone_of_voice = '';
      criterion1 = '';
      criterion2 = '';
      criterion3 = '';
      stepValue = 150;
      categoryTags = {
        inTheNews: false,
        transHealth: false,
        genderSenseLatest: false,
        transitionCoaching: false,
        communityHighlights: false,
        transRights: false
      };
      
      // Reset to empty RSS feeds
      rssFeeds = [];
      
      console.log('All profile data cleared');
    }
  }

  // Reactive statement to get selected feeds
  $: selectedFeeds = rssFeeds.filter(feed => feed.selected);
  $: hasSelectedFeeds = selectedFeeds.length > 0;
  $: allSelected = rssFeeds.length > 0 && rssFeeds.every(feed => feed.selected);

  // Functions for dropdown actions
  function toggleSelectedFeeds() {
    rssFeeds = rssFeeds.map(feed => {
      if (feed.selected) {
        return {
          ...feed,
          status: feed.status === 'active' ? 'paused' : 'active'
        };
      }
      return feed;
    });
    console.log('Toggled status for selected feeds:', selectedFeeds.map(f => f.name));
  }

  function deleteSelectedFeeds() {
    if (confirm(`Are you sure you want to delete ${selectedFeeds.length} selected feed(s)?`)) {
      rssFeeds = rssFeeds.filter(feed => !feed.selected);
      console.log('Deleted selected feeds');
    }
  }

  // Toggle all checkboxes
  const handleSelectAll = () => {
    const shouldSelectAll = !allSelected;
    rssFeeds = rssFeeds.map(feed => ({
      ...feed,
      selected: shouldSelectAll
    }));
    console.log('Select all toggled:', shouldSelectAll);
  };

  // Add new RSS feed function
  const handleAddNewSource = () => {
    if (!newFeedName.trim()) {
      alert('Please enter a feed name');
      return;
    }

    if (!newRssUrl.trim()) {
      alert('Please enter a valid RSS feed URL');
      return;
    }

    try {
      new URL(newRssUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    const isDuplicateUrl = rssFeeds.some(feed => feed.url === newRssUrl.trim());
    if (isDuplicateUrl) {
      alert('This RSS feed URL already exists');
      return;
    }

    const isDuplicateName = rssFeeds.some(feed => feed.name.toLowerCase() === newFeedName.trim().toLowerCase());
    if (isDuplicateName) {
      alert('This feed name already exists');
      return;
    }

    const nextId = rssFeeds.length > 0 ? Math.max(...rssFeeds.map(feed => feed.id)) + 1 : 1;

    const newFeed = {
      id: nextId,
      name: newFeedName.trim(),
      url: newRssUrl.trim(),
      status: "active",
      selected: false
    };

    rssFeeds = [...rssFeeds, newFeed];
    
    newFeedName = '';
    newRssUrl = '';
    
    console.log('Added new RSS feed:', newFeed);
  };

  // Function to trigger file input for import
  let fileInput: HTMLInputElement | null = null;
  const handleImportClick = () => {
    fileInput?.click();
  };

</script>

<!-- Page title -->
<svelte:head>
    <title>CP05 Profile Editor</title>
</svelte:head>

<!-- MAIN CONTAINER -->
<div class="min-h-screen bg-green-100 dark:bg-gray-900">

  <!-- MAIN PANEL - Full width -->
  <div class="bg-white dark:bg-gray-800 border-l border-r border-b border-gray-200 dark:border-gray-700 mt-0">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <!-- Storage Controls -->
      <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">Profile Data</h3>
            <p class="text-xs text-gray-600 dark:text-gray-300">Auto-saved locally • Export for use in other apps</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button color="light" size="sm" onclick={exportProfile}>
              <DownloadOutline class="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <input 
              type="file" 
              accept=".json" 
              on:change={importProfile} 
              bind:this={fileInput}
              class="hidden" 
            />
            <Button color="light" size="sm" onclick={handleImportClick}>
              <UploadOutline class="w-4 h-4 mr-2" />
              Import JSON
            </Button>
            <Button color="red" size="sm" onclick={clearAllData}>
              <TrashBinOutline class="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </div>

      <!-- GRID -->
      <form>
        <div class="mb-6 grid gap-8 md:grid-cols-2">
          <div>
            <Label for="profile_name" class="mb-2">
              Profile Name
            </Label>
            <Input type="text" id="profile_name" placeholder="Name" required class="mb-6" bind:value={profile_name}/>

            <Label for="profile_description" class="mb-2">Profile Description</Label>
            <Textarea
              id="profile_description"
              class="mb-6 text-md font-medium text-gray-900 dark:text-white"
              placeholder="Optional profile description and purpose …"
              bind:value={profile_description} 
              rows={5}
            />

            <Label for="tone_of_voice" class="mb-2 mt-0">Tone of Voice</Label>
            <Select
              id="tone_of_voice"
              class="block mb-6 text-sm font-medium text-gray-900 dark:text-white"
              placeholder="Select tone of voice"
              bind:value={tone_of_voice}
            >
              <option value="">Select tone of voice</option>
              <option value="professional_supportive">Professional / Supportive</option>
              <option value="empowering_activist">Empowering / Activist</option>
              <option value="community_caring">Community & Caring</option>
            </Select>

            <Label for="range-steps" class="mb-2 mt-8">Summary Text Length (max 400)</Label>
            <Range id="range-steps" min="0" max="400" bind:value={stepValue} step="10" />
            <p class="mt-2">Value: {stepValue}</p>

          </div>

          <div>
            <!-- EVALUATION CRITERIA -->
            <Label for="criterion1" class="block mb-2">Evaluation Criteria for Sources</Label>
            
            <Select id="criterion1" class="mb-6" placeholder="Select evaluation criteria" bind:value={criterion1}>
              <option value="">Select evaluation criteria</option>
              <option value="articleQuality">Article Quality</option>
              <option value="genderSenseAlignment">GenderSense Alignment</option>
              <option value="empoweringPositive">Empowering & Positive</option>
              <option value="currentUpToDate">Current & up to date</option>
            </Select>
              
            <Label for="criterion2" class="block mb-2">Select</Label>
            <Select id="criterion2" class="mb-6" placeholder="Select evaluation criteria" bind:value={criterion2}>
              <option value="">Select evaluation criteria</option>
              <option value="articleQuality">Article Quality</option>
              <option value="genderSenseAlignment">GenderSense Alignment</option>
              <option value="empoweringPositive">Empowering & Positive</option>
              <option value="currentUpToDate">Current & up to date</option>
            </Select>

            <Label for="criterion3" class="block mb-2">Select</Label>
            <Select id="criterion3" class="mb-6" placeholder="Select evaluation criteria" bind:value={criterion3}>
              <option value="">Select evaluation criteria</option>
              <option value="articleQuality">Article Quality</option>
              <option value="genderSenseAlignment">GenderSense Alignment</option>
              <option value="empoweringPositive">Empowering & Positive</option>
              <option value="currentUpToDate">Current & up to date</option>
            </Select>

            <!-- CATEGORY TAGS -->
            <h5 class="mt-8 mb-2 text-sm">Available Category Tags (e.g. newsletter sections)</h5>
            <Card class="p-4 sm:p-6 md:p-8 min-w-full shadow-none">
                        
              <Checkbox aria-describedby="news-helper" bind:checked={categoryTags.inTheNews}>In the News</Checkbox>
              <Helper id="news-helper" class="ps-7 mb-4">News items of general Trans+ interest</Helper>

              <Checkbox aria-describedby="health-helper" bind:checked={categoryTags.transHealth}>Trans+ Health</Checkbox>
              <Helper id="health-helper" class="ps-7 mb-4">Trans+ health tips and info</Helper>

              <Checkbox aria-describedby="latest-helper" bind:checked={categoryTags.genderSenseLatest}>GenderSense Latest</Checkbox>
              <Helper id="latest-helper" class="ps-7 mb-4">Updates on what is going on at GenderSense</Helper>

              <Checkbox aria-describedby="coaching-helper" bind:checked={categoryTags.transitionCoaching}>Transition Coaching Tips</Checkbox>
              <Helper id="coaching-helper" class="ps-7 mb-4">Hints and tips on making life easier</Helper>

              <Checkbox aria-describedby="community-helper" bind:checked={categoryTags.communityHighlights}>GenderSense Community Highlights</Checkbox>
              <Helper id="community-helper" class="ps-7 mb-4">Items from the GenderSense online community</Helper>

              <Checkbox aria-describedby="rights-helper" bind:checked={categoryTags.transRights}>Trans+ Issues & Rights Updates</Checkbox>
              <Helper id="rights-helper" class="ps-7 mb-4">Community issues</Helper>

            </Card>

          </div>

        </div>

      </form>

      <!-- FORM SECTION WITH RSS FEEDS -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-4">RSS Feeds</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">Add RSS feeds to be used for content generation.</p>

        <div class="mb-6 grid gap-8 md:grid-cols-3">

          <!-- Col 1 -->
          <div class="mb-0 col-span-1">
            <Label for="feed_name" class="block mb-2">Feed Name</Label>
            <Input 
              type="text" 
              id="feed_name" 
              placeholder="Example News" 
              bind:value={newFeedName}
              class="w-full mb-6"
            />

            <Button 
              type="button"
              color="primary" 
              onclick={handleAddNewSource}
            >
            Add New Source
            </Button>

          </div>

          <!-- Col 2 -->
          <div class="mb-4 col-span-2">
            <Label for="rss_feed" class="block mb-2">RSS Feed URL</Label>
            <Input 
              type="url" 
              id="rss_feed" 
              placeholder="https://example.com/rss" 
              bind:value={newRssUrl}
              class="w-full mb-4"
            />
          </div>

          <div> <!-- Col 3 -->
          <!-- Empty -->
          </div>

        </div>

                <!-- BUTTONS -->
        <div class="flex justify-between mt-6">
          <!-- Left side - Validation status -->
          <div class="flex items-center">
            {#if saveStatus === 'saving'}
              <div class="flex items-center text-blue-600 dark:text-blue-400">
                <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving profile...
              </div>
            {:else if saveStatus === 'success'}
              <div class="flex items-center text-green-600 dark:text-green-400">
                <CheckCircleOutline class="w-4 h-4 mr-2" />
                Profile saved successfully
                {#if lastSaveTime}
                  <span class="text-xs ml-2 text-gray-500">
                    at {lastSaveTime.toLocaleTimeString()}
                  </span>
                {/if}
              </div>
            {:else if saveStatus === 'error'}
              <div class="flex items-center text-red-600 dark:text-red-400">
                <ExclamationCircleOutline class="w-4 h-4 mr-2" />
                Validation errors found
              </div>
            {/if}
          </div>

          <!-- Right side - Action buttons -->
          <div class="space-x-3">
            <Button color="alternative" onclick={cancelChanges}>Cancel</Button>
            <Button color="primary" onclick={() => saveToDatabase(currentProfile)}>Save DB Profile</Button>
            <Button color="green" onclick={saveProfile}>Save Local Profile</Button>
          </div>
        </div>

        <!-- Validation Errors -->
        {#if validationErrors.length > 0}
          <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Please fix the following issues:</h3>
            <ul class="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
              {#each validationErrors as error}
                <li>{error}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- FEED DISPLAY TABLE -->
        <div class="mt-6 overflow-x-auto">

          <Table shadow>
            <TableHead>
              <TableHeadCell>Source Name</TableHeadCell>
              <TableHeadCell>
                <div class="flex items-center justify-between">
                  <span>RSS Feed URL</span>
                  {#if hasSelectedFeeds}
                    <span class="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full ml-2">
                      {selectedFeeds.length} selected
                    </span>
                  {/if}
                </div>
              </TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>
                <div class="flex items-center gap-2">
                  <!-- Select All Checkbox -->
                  <Checkbox 
                    checked={allSelected}
                    onclick={handleSelectAll}
                    title="Select All"
                  />
                  
                  <!-- Actions Dropdown -->
                  <div class="relative">
                    <Button 
                      color="light" 
                      class="!p-2"
                      disabled={!hasSelectedFeeds}
                      id="dropdown-button"
                    >
                      <AlignJustifyOutline class="w-4 h-4" />
                      <ChevronDownOutline class="w-3 h-3 ml-1" />
                    </Button>
                    
                    <Dropdown triggeredBy="#dropdown-button" class="w-48" placement="top">
                      <DropdownItem 
                        onclick={toggleSelectedFeeds}
                        disabled={!hasSelectedFeeds}
                        class="flex items-center gap-2 dark:text-gray-300"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                        </svg>
                        Toggle Active/Pause
                      </DropdownItem>
                      <DropdownItem 
                        onclick={deleteSelectedFeeds}
                        disabled={!hasSelectedFeeds}
                        class="flex items-center gap-2 text-red-600 dark:text-red-400"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete Selected
                      </DropdownItem>
                    </Dropdown>
                  </div>
                </div>
              </TableHeadCell>
            </TableHead>
            
            <TableBody>
              {#each rssFeeds as feed (feed.id)}
                <TableBodyRow>
                  <TableBodyCell>{feed.name}</TableBodyCell>
                  <TableBodyCell class="font-mono text-sm">{feed.url}</TableBodyCell>
                  <TableBodyCell>
                    <Badge color={feed.status === 'active' ? 'green' : 'red'}>
                      {feed.status === 'active' ? 'Active' : 'Paused'}
                    </Badge>
                  </TableBodyCell>
                  <TableBodyCell>
                    <Checkbox bind:checked={feed.selected} />
                  </TableBodyCell>
                </TableBodyRow>
              {/each}
            </TableBody>
          </Table>

        </div>

      </div>

    </div>

  </div>

</div>