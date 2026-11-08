import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDataResponse } from '../../models/user-data.interface';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { UserProfileResponse } from '../../models/user-profile.interface';
import { ProfilePostsResponse } from '../../models/profile-posts.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  signUp(data: object): Observable<UserDataResponse> {
    return this.httpClient.post<UserDataResponse>(`${environment.baseUrl}/users/signup`, data);
  }
  signIn(data: object): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrl}/users/signin`, data);
  }
  getUserProfile(): Observable<UserProfileResponse> {
    return this.httpClient.get<UserProfileResponse>(`${environment.baseUrl}/users/profile-data`);
  }
  getUserPosts(userId: string): Observable<ProfilePostsResponse> {
    return this.httpClient.get<ProfilePostsResponse>(
      `${environment.baseUrl}/users/${userId}/posts`,
    );
  }
  signOut(): void {
    localStorage.removeItem('socialToken');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }
}
