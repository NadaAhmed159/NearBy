export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface UserProfile {
  user: User;
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
  id: string;
}
