import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PostsDataResponse } from '../../models/posts-data.interface';
import { PostMutationDataResponse } from '../../models/post-mutation-data-response.interface';
import { PostDetailsResponse } from '../../models/post-details.interface';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly httpClient = inject(HttpClient);

  getAllPosts(): Observable<PostsDataResponse> {
    return this.httpClient.get<PostsDataResponse>(`${environment.baseUrl}/posts`);
  }
  createPost(data: FormData): Observable<PostMutationDataResponse> {
    return this.httpClient.post<PostMutationDataResponse>(`${environment.baseUrl}/posts/`, data);
  }
  getSinglePost(postId: string): Observable<PostDetailsResponse> {
    return this.httpClient.get<PostDetailsResponse>(`${environment.baseUrl}/posts/${postId}`);
  }
  updatePost(postId: string, data: object): Observable<any> {
    return this.httpClient.put<any>(`${environment.baseUrl}/posts/${postId}`, data);
  }
  deletePost(postId: string): Observable<any> {
    return this.httpClient.delete<any>(`${environment.baseUrl}/posts/${postId}`);
  }
}
