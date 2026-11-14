export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface UserProfile {
  user: User;
  isFollowing?: boolean;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  photo: string;
  cover: string;
  bookmarks: any[];
  followers: any[];
  following: any[];
  createdAt: string;
  followersCount: number;
  followingCount: number;
  bookmarksCount: number;
  myPostsCount?: number;
  savedPostsCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  id: string;
}

export interface SuggestedUser {
  _id: string;
  id?: string;
  name: string;
  username: string;
  photo: string;
  followersCount?: number;
  mutualFollowersCount?: number;
  mutualCount?: number;
  isFollowing?: boolean;
}

export interface SuggestionsResponse {
  success: boolean;
  message: string;
  data: {
    suggestions?: SuggestedUser[];
    users?: SuggestedUser[];
  };
}

