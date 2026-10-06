export interface PostsDataResponse {
  success: boolean;
  message: string;
  data: PostsData;
  meta: Meta;
}

export interface PostsData {
  posts: Post[];
}

export interface Post {
  _id: string;
  id: string;

  body?: string;
  image?: string;
  privacy: string;

  user: User;
  sharedPost?: SharedPost;

  likes: string[];
  likesCount: number;

  commentsCount: number;
  topComment?: TopComment;

  sharesCount: number;
  isShare: boolean;

  createdAt: string;
  bookmarked: boolean;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface SharedPost {
  _id: string;
  id: string;

  image: string;
  privacy: string;

  user: User;

  sharedPost?: SharedPost;

  likes: string[];
  likesCount: number;

  commentsCount: number;
  topComment?: TopComment;

  sharesCount: number;
  isShare: boolean;

  createdAt: string;
}

export interface TopComment {
  _id: string;
  content: string;

  commentCreator: User;

  post: string;
  parentComment?: string;

  likes: string[];

  createdAt: string;
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
  total: number;
}
