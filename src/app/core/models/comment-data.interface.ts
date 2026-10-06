export interface CommentsDataResponse {
  success: boolean;
  message: string;
  data: CommentsData;
  meta: CommentsMeta;
}

export interface CommentsData {
  comments: CommentData[];
}

export interface CommentData {
  _id: string;
  content: string;
  commentCreator: CommentCreator;
  post: string;
  parentComment: string | null;
  likes: string[];
  createdAt: string;
  repliesCount: number;
}

export interface CommentCreator {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface CommentsMeta {
  pagination: Pagination;
}

export interface Pagination {
  currentPage: number;
  limit: number;
  total: number;
  numberOfPages: number;
}
