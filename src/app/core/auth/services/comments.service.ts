import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CommentRepliesResponse, CommentsDataResponse } from '../../models/comment-data.interface';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly httpClient = inject(HttpClient);

  getAllComments(
    postId: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<CommentsDataResponse> {
    return this.httpClient.get<CommentsDataResponse>(
      `${environment.baseUrl}/posts/${postId}/comments?page=${page}&limit=${limit}`,
    );
  }

  createComment(postId: string, formData: FormData): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrl}/posts/${postId}/comments`, formData);
  }

  getCommentReplies(
    postId: string,
    commentId: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<CommentRepliesResponse> {
    return this.httpClient.get<CommentRepliesResponse>(
      `${environment.baseUrl}/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`,
    );
  }

  createReply(postId: string, commentId: string, formData: FormData): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrl}/posts/${postId}/comments/${commentId}/replies`,
      formData,
    );
  }

  updateComment(postId: string, commentId: string, formData: FormData): Observable<any> {
    return this.httpClient.put<any>(
      `${environment.baseUrl}/posts/${postId}/comments/${commentId}`,
      formData,
    );
  }

  deleteComment(postId: string, commentId: string): Observable<any> {
    return this.httpClient.delete<any>(
      `${environment.baseUrl}/posts/${postId}/comments/${commentId}`,
    );
  }

  toggleLikeComment(postId: string, commentId: string): Observable<any> {
    return this.httpClient.put<any>(
      `${environment.baseUrl}/posts/${postId}/comments/${commentId}/like`,
      {},
    );
  }
}

