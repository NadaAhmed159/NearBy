import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PostsDataResponse } from '../../models/posts-data.interface';
import { PostMutationDataResponse } from '../../models/post-mutation-data-response.interface';
import { PostDetailsResponse } from '../../models/post-details.interface';

export type FeedMode = 'feed' | 'my-posts' | 'community' | 'saved';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly httpClient = inject(HttpClient);

  feedMode$ = new BehaviorSubject<FeedMode>('feed');

  setFeedMode(mode: FeedMode): void {
    this.feedMode$.next(mode);
  }

  getAllPosts(page: number = 1, limit: number = 20): Observable<PostsDataResponse> {
    return this.httpClient.get<PostsDataResponse>(
      `${environment.baseUrl}/posts?page=${page}&limit=${limit}`,
    );
  }

  getHomeFeed(
    only: string = 'following',
    page: number = 1,
    limit: number = 10,
  ): Observable<PostsDataResponse> {
    return this.httpClient.get<PostsDataResponse>(
      `${environment.baseUrl}/posts/feed?only=${only}&page=${page}&limit=${limit}`,
    );
  }

  createPost(data: FormData): Observable<PostMutationDataResponse> {
    return this.httpClient.post<PostMutationDataResponse>(`${environment.baseUrl}/posts`, data);
  }

  getSinglePost(postId: string): Observable<PostDetailsResponse> {
    return this.httpClient.get<PostDetailsResponse>(`${environment.baseUrl}/posts/${postId}`);
  }

  getPostLikes(postId: string, page: number = 1, limit: number = 20): Observable<any> {
    return this.httpClient.get<any>(
      `${environment.baseUrl}/posts/${postId}/likes?page=${page}&limit=${limit}`,
    );
  }

  updatePost(postId: string, data: FormData | object): Observable<any> {
    return this.httpClient.put<any>(`${environment.baseUrl}/posts/${postId}`, data);
  }

  deletePost(postId: string): Observable<any> {
    return this.httpClient.delete<any>(`${environment.baseUrl}/posts/${postId}`);
  }

  toggleLikePost(postId: string): Observable<any> {
    return this.httpClient.put<any>(`${environment.baseUrl}/posts/${postId}/like`, {});
  }

  toggleBookmarkPost(postId: string): Observable<any> {
    return this.httpClient.put<any>(`${environment.baseUrl}/posts/${postId}/bookmark`, {});
  }

  sharePost(postId: string, body: string): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrl}/posts/${postId}/share`, { body });
  }
}

