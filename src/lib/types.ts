// src/lib/types.ts - Define your profile structure

export interface RSSFeed {
  id: number;
  name: string;
  url: string;
  status: 'active' | 'paused';
  selected: boolean;
}

export interface CategoryTags {
  inTheNews: boolean;
  transHealth: boolean;
  genderSenseLatest: boolean;
  transitionCoaching: boolean;
  communityHighlights: boolean;
  transRights: boolean;
}

export interface ProfileData {
  profile_name: string;
  profile_description: string;
  tone_of_voice: string;
  evaluationCriteria: string[];
  summaryLength: number;
  categoryTags: CategoryTags;
  rssFeeds: RSSFeed[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

export interface DatabaseProfile {
  profile_name: string;
  profile_description: string;
  is_active: boolean;
  profile_json: ProfileData;
}