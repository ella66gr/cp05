<!-- src/routes/+page.svelte - Complete CP05 Profile Editor with Enhanced Save UI -->

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
  import { ProfileManager } from '$lib/profileManager';
  import type { RSSFeed, CategoryTags } from '$lib/types';

  // ===== PROFILE MANAGER & FORM VARIABLES =====
  
  // Initialize ProfileManager for structured profile handling
  let profileManager = new ProfileManager();

  // Form variables for user input
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
  let categoryTags: CategoryTags = {
    inTheNews: false,
    transHealth: false,
    genderSenseLatest: false,
    transitionCoaching: false,
    communityHighlights: false,
    transRights: false
  };

  // RSS Feed data with selection state
  let rssFeeds: RSSFeed[] = [];

  // ===== SAVE STATUS & UI STATE =====
  
  // Enhanced save status tracking
  let saveStatus: null | 'saving' | 'success' | 'error' = null;
  let validationErrors: string[] = [];
  let lastSaveTime: Date | null = null;
  let lastSavedProfileId: string | null = null; // Track the saved profile ID
  let saveLocation: 'local' | 'database' | null = null; // Track where it was saved
  let detailedSaveMessage: string = '';

  // Storage and client state
  const STORAGE_KEY = 'cp05_profile_data';
  let isClient = false;

  // ===== LIFECYCLE & INITIALIZATION =====
  
  // Load data from localStorage on component mount
  onMount(() => {
    isClient = true;
    loadFromStorage();
  });

  // ===== PROFILE MANAGEMENT FUNCTIONS =====
  
  // Update profile manager with current form data
  function updateProfileManager() {
    profileManager.updateFromFormData({
      profile_name,
      profile_description,
      tone_of_voice,
      criterion1,
      criterion2,
      criterion3,
      stepValue,
      categoryTags,
      rssFeeds
    });
  }

  // Save data to localStorage
  function saveToStorage() {
    if (!isClient) return;
    
    updateProfileManager();
    const profileData = profileManager.getProfile();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
      console.log('Profile data saved to localStorage', profileManager.getProfileSummary());
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
        profileManager.loadFromJSON(profileData);
        
        // Update form fields from loaded profile
        const profile = profileManager.getProfile();
        profile_name = profile.profile_name;
        profile_description = profile.profile_description;
        tone_of_voice = profile.tone_of_voice;
        stepValue = profile.summaryLength;
        
        // Load evaluation criteria
        criterion1 = profile.evaluationCriteria[0] || '';
        criterion2 = profile.evaluationCriteria[1] || '';
        criterion3 = profile.evaluationCriteria[2] || '';
        
        // Load category tags
        categoryTags = { ...profile.categoryTags };
        
        // Load RSS feeds
        rssFeeds = profile.rssFeeds.map(feed => ({ ...feed, selected: false }));
        
        console.log('Profile data loaded from localStorage', profileManager.getProfileSummary());
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }

  // ===== AUTO-SAVE FUNCTIONALITY =====
  
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

  // ===== ENHANCED SAVE FUNCTIONS =====
  
  // Enhanced local save function with detailed UI feedback
  function saveProfile() {
    saveStatus = 'saving';
    saveLocation = 'local';
    detailedSaveMessage = 'Saving to local storage...';
    
    updateProfileManager();
    
    const validation = profileManager.validateForDatabase();
    validationErrors = validation.errors;
    
    if (!validation.isValid) {
      saveStatus = 'error';
      detailedSaveMessage = `Local save failed: ${validation.errors.length} validation error(s).`;
      return;
    }
    
    try {
      saveToStorage();
      
      saveStatus = 'success';
      lastSaveTime = new Date();
      saveLocation = 'local';
      
      const summary = profileManager.getProfileSummary();
      detailedSaveMessage = `Profile "${summary.name}" saved locally with ${summary.criteriaCount} criteria, ${summary.activeFeedsCount} active feeds.`;
      
      // Reset status after 3 seconds for local saves
      setTimeout(() => {
        saveStatus = null;
        detailedSaveMessage = '';
        saveLocation = null;
      }, 3000);
      
    } catch (error) {
      console.error('Failed to save profile locally:', error);
      saveStatus = 'error';
      saveLocation = 'local';
      detailedSaveMessage = 'Failed to save to local storage. Storage might be full.';
      validationErrors = ['Failed to save profile locally. Please try again.'];
    }
  }

  // Enhanced database save function with detailed UI feedback
  async function saveToDatabase(event: MouseEvent) {
    event.preventDefault();
    saveStatus = 'saving';
    saveLocation = 'database';
    detailedSaveMessage = 'Validating profile data...';
    
    // Update profile manager with current form data
    updateProfileManager();
    
    // Validate before saving
    const validation = profileManager.validateForDatabase();
    validationErrors = validation.errors;
    
    if (!validation.isValid) {
      saveStatus = 'error';
      detailedSaveMessage = `Validation failed: ${validation.errors.length} error(s) found.`;
      return;
    }

    try {
      detailedSaveMessage = 'Sending profile to database...';
      
      // Get the structured profile for database
      const databaseProfile = profileManager.prepareDatabaseProfile();
      
      const response = await fetch('/api/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(databaseProfile)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Success!
        console.log('Saved to DB with ID:', result.id);
        console.log('Profile Summary:', profileManager.getProfileSummary());
        
        saveStatus = 'success';
        lastSaveTime = new Date();
        lastSavedProfileId = result.id;
        
        const summary = profileManager.getProfileSummary();
        detailedSaveMessage = `Profile "${summary.name}" saved successfully to database with ID: ${result.id.substring(0, 8)}...`;
        
        // Also save to localStorage as backup
        saveToStorage();
        
        // Reset status after 5 seconds for database saves (longer to show the ID)
        setTimeout(() => {
          saveStatus = null;
          detailedSaveMessage = '';
          saveLocation = null;
        }, 5000);
      } else {
        // Handle API errors
        throw new Error(result.error || result.details || 'Failed to save profile to database');
      }
    } catch (error) {
      console.error('Error saving profile to DB:', error);
      saveStatus = 'error';
      saveLocation = 'database';
      
      if (error instanceof Error) {
        detailedSaveMessage = `Database save failed: ${error.message}`;
        validationErrors = [error.message];
      } else {
        detailedSaveMessage = 'Unknown error occurred while saving to database.';
        validationErrors = ['Failed to save to database. Please try again.'];
      }
    }
  }

  // ===== IMPORT/EXPORT FUNCTIONS =====
  
  // Export profile as JSON
  function exportProfile() {
    updateProfileManager();
    
    // Generate default filename
    const defaultFilename = profile_name 
      ? `${profile_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-profile`
      : 'cp05-profile';
    
    // Let user customize filename
    const userFilename = prompt('Enter filename for export:', defaultFilename);
    if (userFilename === null) return; // User cancelled
    
    // Clean the filename and ensure it's valid
    const cleanFilename = userFilename.trim() || defaultFilename;
    const finalFilename = cleanFilename.endsWith('.json') 
      ? cleanFilename 
      : `${cleanFilename}.json`;

    const jsonString = profileManager.exportAsJSON();
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

  // Import profile from JSON
  function importProfile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse((e.target as FileReader).result as string);
        profileManager.loadFromJSON(importedData);
        
        // Update form fields from imported profile
        const profile = profileManager.getProfile();
        profile_name = profile.profile_name;
        profile_description = profile.profile_description;
        tone_of_voice = profile.tone_of_voice;
        stepValue = profile.summaryLength;
        
        // Load evaluation criteria
        criterion1 = profile.evaluationCriteria[0] || '';
        criterion2 = profile.evaluationCriteria[1] || '';
        criterion3 = profile.evaluationCriteria[2] || '';
        
        // Load category tags
        categoryTags = { ...profile.categoryTags };
        
        // Load RSS feeds
        rssFeeds = profile.rssFeeds.map(feed => ({ ...feed, selected: false }));
        
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

  // ===== UTILITY FUNCTIONS =====
  
  // Cancel function - revert to last saved state
  function cancelChanges() {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      loadFromStorage();
      saveStatus = null;
      validationErrors = [];
      detailedSaveMessage = '';
      saveLocation = null;
    }
  }

  // Clear all profile data
  function clearAllData() {
    if (!isClient) return;
    
    if (confirm('Are you sure you want to clear all profile data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      // Reset ProfileManager
      profileManager = new ProfileManager();
      
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

  // ===== RSS FEED MANAGEMENT =====
  
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

    const newFeed: RSSFeed = {
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

  // ===== REACTIVE PROFILE SYNC =====
  
  // Reactive statement to keep profile manager in sync
  $: {
    if (isClient) {
      updateProfileManager();
      // This will trigger whenever form data changes, keeping profile manager in sync
    }
  }
</script>

<!-- ===== PAGE TITLE ===== -->
<svelte:head>
    <title>CP05 Profile Editor</title>
</svelte:head>

<!-- ===== MAIN CONTAINER ===== -->
<div class="min-h-screen bg-green-100 dark:bg-gray-900">

  <!-- MAIN PANEL - Full width -->
  <div class="bg-white dark:bg-gray-800 border-l border-r border-b border-gray-200 dark:border-gray-700 mt-0">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <!-- ===== STORAGE CONTROLS ===== -->
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
              onchange={importProfile} 
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

      <!-- ===== ENHANCED SAVE STATUS SECTION ===== -->
      <div class="mb-6">
        <!-- Save Status Banner -->
        {#if saveStatus}
          <div class="mb-4 p-4 rounded-lg border transition-all duration-300 {
            saveStatus === 'saving' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
            saveStatus === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
            'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }">
            
            <div class="flex items-start gap-3">
              <!-- Status Icon -->
              <div class="flex-shrink-0 mt-0.5">
                {#if saveStatus === 'saving'}
                  <svg class="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                {:else if saveStatus === 'success'}
                  <CheckCircleOutline class="w-5 h-5 text-green-600 dark:text-green-400" />
                {:else if saveStatus === 'error'}
                  <ExclamationCircleOutline class="w-5 h-5 text-red-600 dark:text-red-400" />
                {/if}
              </div>

              <!-- Status Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="text-sm font-medium {
                    saveStatus === 'saving' ? 'text-blue-800 dark:text-blue-200' :
                    saveStatus === 'success' ? 'text-green-800 dark:text-green-200' :
                    'text-red-800 dark:text-red-200'
                  }">
                    {#if saveStatus === 'saving'}
                      Saving Profile...
                    {:else if saveStatus === 'success'}
                      {saveLocation === 'database' ? '✅ Database Save Successful!' : '✅ Local Save Successful!'}
                    {:else if saveStatus === 'error'}
                      {saveLocation === 'database' ? '❌ Database Save Failed' : '❌ Local Save Failed'}
                    {/if}
                  </h4>
                  
                  <!-- Save Location Badge -->
                  {#if saveLocation}
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {
                      saveLocation === 'database' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                    }">
                      {saveLocation === 'database' ? '🗄️ Database' : '💾 Local Storage'}
                    </span>
                  {/if}
                </div>

                <!-- Detailed Message -->
                {#if detailedSaveMessage}
                  <p class="text-sm {
                    saveStatus === 'saving' ? 'text-blue-700 dark:text-blue-300' :
                    saveStatus === 'success' ? 'text-green-700 dark:text-green-300' :
                    'text-red-700 dark:text-red-300'
                  }">
                    {detailedSaveMessage}
                  </p>
                {/if}

                <!-- Timestamp -->
                {#if lastSaveTime && saveStatus === 'success'}
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Saved at {lastSaveTime.toLocaleTimeString()}
                    {#if lastSavedProfileId && saveLocation === 'database'}
                      • Profile ID: {lastSavedProfileId.substring(0, 8)}...
                    {/if}
                  </p>
                {/if}
              </div>

              <!-- Close Button -->
              {#if saveStatus !== 'saving'}
                <button 
                  onclick={() => { saveStatus = null; detailedSaveMessage = ''; saveLocation = null; }}
                  class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  title="Dismiss"
                  aria-label="Dismiss notification"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- Left side - Profile Summary (when not saving) -->
          <div class="flex items-center gap-4">
            {#if !saveStatus && profile_name}
              <div class="text-sm text-gray-600 dark:text-gray-300">
                <span class="font-medium">{profile_name}</span>
                {#if isClient}
                  {@const summary = profileManager.getProfileSummary()}
                  <span class="text-xs ml-2">
                    {summary.criteriaCount} criteria • {summary.activeFeedsCount} feeds • {summary.selectedCategoriesCount} categories
                    {#if summary.isComplete}
                      <span class="text-green-600 dark:text-green-400 ml-1">✓ Complete</span>
                    {:else}
                      <span class="text-amber-600 dark:text-amber-400 ml-1">⚠ Incomplete</span>
                    {/if}
                  </span>
                {/if}
              </div>
            {/if}
          </div>

          <!-- Right side - Action buttons -->
          <div class="flex items-center gap-3">
            <Button color="alternative" onclick={cancelChanges} disabled={saveStatus === 'saving'}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onclick={saveToDatabase} 
              disabled={saveStatus === 'saving'}
              class="relative"
            >
              {#if saveStatus === 'saving' && saveLocation === 'database'}
                <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              {/if}
              Save to Database
            </Button>
            <Button 
              color="green" 
              onclick={saveProfile} 
              disabled={saveStatus === 'saving'}
              class="relative"
            >
              {#if saveStatus === 'saving' && saveLocation === 'local'}
                <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              {/if}
              Save Locally
            </Button>
          </div>
        </div>
      </div>

      <!-- Enhanced Validation Errors Section -->
      {#if validationErrors.length > 0}
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="flex items-start gap-3">
            <ExclamationCircleOutline class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div class="flex-1">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Validation Issues ({validationErrors.length})
              </h3>
              <ul class="text-sm text-red-700 dark:text-red-300 space-y-1">
                {#each validationErrors as error, index}
                  <li class="flex items-start gap-2">
                    <span class="text-red-400 mt-1">•</span>
                    <span>{error}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        </div>
      {/if}

      <!-- ===== MAIN FORM GRID ===== -->
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

      <!-- ===== RSS FEEDS SECTION ===== -->
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

        <!-- ===== RSS FEEDS DISPLAY TABLE ===== -->
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

<!-- 
===== SUMMARY OF ENHANCED FEATURES =====

🔧 ProfileManager Integration:
- Structured profile object creation
- Type-safe data handling
- Automatic validation before saves

💾 Enhanced Save System:
- Visual status banners with detailed messages
- Database ID display for successful saves
- Location badges (Database vs Local Storage)
- Progress indicators during operations
- Profile summary with completion status

🎯 User Experience:
- Auto-save functionality (1-second debounce)
- Import/Export JSON profiles
- Validation error display with counts
- Dismissible success notifications
- Button states with loading indicators

📊 Database Features:
- UUID primary key support
- JSONB structured storage
- Comprehensive error handling
- Backup to localStorage after DB saves

🔄 RSS Feed Management:
- Bulk operations (toggle, delete)
- Select all functionality
- Status badges and validation
- Duplicate prevention

This complete implementation provides a professional profile editor with 
structured data management, enhanced user feedback, and reliable database 
integration using your existing PostgreSQL schema.
-->