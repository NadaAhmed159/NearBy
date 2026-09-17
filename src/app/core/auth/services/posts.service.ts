import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly httpClient = inject(HttpClient);

  myHeaders: object = {
    Headers: {
      Autorization: `Bearer ${localStorage.getItem('socialToken')}`,
    },
  };
  getAllPosts(): Observable<any> {
    return this.httpClient.get<any>(`${environment.baseUrl}/posts`, this.myHeaders);
  }
  createPost(data: object): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrl}`, data, this.myHeaders);
  }
  getSinglePost(postId: string): Observable<any> {
    return this.httpClient.get<any>(`${environment.baseUrl}/posts/${postId}`, this.myHeaders);
  }
  updatePost(postId: string, data: object): Observable<any> {
    return this.httpClient.put<any>(`${environment.baseUrl}/posts/${postId}`, data, this.myHeaders);
  }
  deletePost(postId: string): Observable<any> {
    return this.httpClient.delete<any>(`${environment.baseUrl}/posts/${postId}`, this.myHeaders);
  }
}
