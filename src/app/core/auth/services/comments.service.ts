import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { CommentsDataResponse } from '../../models/comment-data.interface';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly httpClient = inject(HttpClient);

  myHeaders: object = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('socialToken')}`,
    },
  };

  getAllComments(postId: string): Observable<CommentsDataResponse> {
    return this.httpClient.get<CommentsDataResponse>(
      `${environment.baseUrl}/posts/${postId}/comments?page=1&limit=10`,
      this.myHeaders,
    );
  }
  createComment(postId: string, formData: FormData): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrl}/posts/${postId}/comments`,
      formData,
      this.myHeaders,
    );
  }
}
