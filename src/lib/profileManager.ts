// src/lib/profileManager.ts - Profile object creation and management

import type { ProfileData, CategoryTags, RSSFeed, DatabaseProfile } from './types';

export class ProfileManager {
  private profileData: ProfileData;

  constructor() {
    this.profileData = this.createEmptyProfile();
  }

  // Create an empty profile with default values
  private createEmptyProfile(): ProfileData {
    return {
      profile_name: '',
      profile_description: '',
      tone_of_voice: '',
      evaluationCriteria: [],
      summaryLength: 150,
      categoryTags: {
        inTheNews: false,
        transHealth: false,
        genderSenseLatest: false,
        transitionCoaching: false,
        communityHighlights: false,
        transRights: false
      },
      rssFeeds: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
  }

  // Update profile from form data
  updateFromFormData(formData: {
    profile_name: string;
    profile_description: string;
    tone_of_voice: string;
    criterion1: string;
    criterion2: string;
    criterion3: string;
    stepValue: number;
    categoryTags: CategoryTags;
    rssFeeds: RSSFeed[];
  }): void {
    // Update basic fields
    this.profileData.profile_name = formData.profile_name;
    this.profileData.profile_description = formData.profile_description;
    this.profileData.tone_of_voice = formData.tone_of_voice;
    this.profileData.summaryLength = formData.stepValue;
    
    // Filter and set evaluation criteria (remove empty strings)
    this.profileData.evaluationCriteria = [
      formData.criterion1,
      formData.criterion2,
      formData.criterion3
    ].filter(criterion => criterion.trim() !== '');
    
    // Update category tags
    this.profileData.categoryTags = { ...formData.categoryTags };
    
    // Update RSS feeds (remove selection state for storage)
    this.profileData.rssFeeds = formData.rssFeeds.map(feed => ({
      ...feed,
      selected: false // Don't persist selection state
    }));
    
    // Update metadata
    this.profileData.metadata.updatedAt = new Date().toISOString();
  }

  // Get the current profile data
  getProfile(): ProfileData {
    return { ...this.profileData };
  }

  // Validate profile for database saving
  validateForDatabase(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.profileData.profile_name.trim()) {
      errors.push('Profile name is required');
    }

    if (!this.profileData.tone_of_voice) {
      errors.push('Tone of voice must be selected');
    }

    if (this.profileData.evaluationCriteria.length === 0) {
      errors.push('At least one evaluation criteria must be selected');
    }

    const activeFeeds = this.profileData.rssFeeds.filter(feed => feed.status === 'active');
    if (activeFeeds.length === 0) {
      errors.push('At least one RSS feed must be active');
    }

    const selectedCategories = Object.values(this.profileData.categoryTags).filter(Boolean);
    if (selectedCategories.length === 0) {
      errors.push('At least one category tag must be selected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Prepare profile for database insertion
  prepareDatabaseProfile(): DatabaseProfile {
    return {
      profile_name: this.profileData.profile_name,
      profile_description: this.profileData.profile_description,
      is_active: true,
      profile_json: this.getProfile()
    };
  }

  // Load profile from JSON (for imports)
  loadFromJSON(jsonData: any): void {
    try {
      // Validate and merge with current profile structure
      const loadedProfile: ProfileData = {
        profile_name: jsonData.profile_name || '',
        profile_description: jsonData.profile_description || '',
        tone_of_voice: jsonData.tone_of_voice || '',
        evaluationCriteria: Array.isArray(jsonData.evaluationCriteria) 
          ? jsonData.evaluationCriteria 
          : [],
        summaryLength: jsonData.summaryLength || 150,
        categoryTags: {
          ...this.profileData.categoryTags,
          ...(jsonData.categoryTags || {})
        },
        rssFeeds: Array.isArray(jsonData.rssFeeds) 
          ? jsonData.rssFeeds.map((feed: any) => ({
              ...feed,
              selected: false
            }))
          : [],
        metadata: {
          createdAt: jsonData.metadata?.createdAt || this.profileData.metadata.createdAt,
          updatedAt: new Date().toISOString(),
          version: '1.0'
        }
      };

      this.profileData = loadedProfile;
    } catch (error) {
      throw new Error('Invalid profile JSON format');
    }
  }

  // Export profile as JSON
  exportAsJSON(): string {
    return JSON.stringify(this.profileData, null, 2);
  }

  // Get profile summary for display
  getProfileSummary(): {
    name: string;
    criteriaCount: number;
    activeFeedsCount: number;
    selectedCategoriesCount: number;
    isComplete: boolean;
  } {
    const selectedCategories = Object.values(this.profileData.categoryTags).filter(Boolean);
    const activeFeeds = this.profileData.rssFeeds.filter(feed => feed.status === 'active');
    const validation = this.validateForDatabase();

    return {
      name: this.profileData.profile_name,
      criteriaCount: this.profileData.evaluationCriteria.length,
      activeFeedsCount: activeFeeds.length,
      selectedCategoriesCount: selectedCategories.length,
      isComplete: validation.isValid
    };
  }
}