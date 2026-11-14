import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserDataResponse, UserInfo } from '../../models/user-data.interface';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { SuggestionsResponse, UserProfileResponse } from '../../models/user-profile.interface';
import { ProfilePostsResponse } from '../../models/profile-posts.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  userData$ = new BehaviorSubject<UserInfo | null>(this.getStoredUserData());

  getStoredUserData(): UserInfo | null {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && !parsed._id && parsed.id) {
        parsed._id = parsed.id;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  updateStoredUserData(partial: Partial<UserInfo>): void {
    const current = this.getStoredUserData();
    const updated = { ...(current || {}), ...partial } as UserInfo;
    localStorage.setItem('userData', JSON.stringify(updated));
    this.userData$.next(updated);
  }

  healthCheck(): Observable<any> {
    return this.httpClient.get<any>(`${environment.baseUrl}/`);
  }

  signUp(data: object): Observable<UserDataResponse> {
    return this.httpClient.post<UserDataResponse>(`${environment.baseUrl}/users/signup`, data);
  }

  signIn(data: object): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrl}/users/signin`, data).pipe(
      tap((res) => {
        if (res?.data?.user) {
          this.userData$.next(res.data.user);
        }
      }),
    );
  }

  changePassword(data: { password: string; newPassword: string }): Observable<any> {
    return this.httpClient.patch<any>(`${environment.baseUrl}/users/change-password`, data);
  }

  uploadProfilePhoto(formData: FormData): Observable<any> {
    return this.httpClient.put<any>(`${environment.baseUrl}/users/upload-photo`, formData).pipe(
      tap((res) => {
        const photo = res?.data?.photo || res?.data?.user?.photo;
        if (photo) {
          this.updateStoredUserData({ photo });
        }
      }),
    );
  }

  getUserProfile(): Observable<UserProfileResponse> {
    return this.httpClient.get<UserProfileResponse>(`${environment.baseUrl}/users/profile-data`).pipe(
      tap((res) => {
        if (res?.data?.user) {
          this.updateStoredUserData({
            _id: res.data.user._id,
            name: res.data.user.name,
            username: res.data.user.username,
            email: res.data.user.email,
            photo: res.data.user.photo,
            cover: res.data.user.cover,
          });
        }
      }),
    );
  }

  getUserProfileById(userId: string): Observable<UserProfileResponse> {
    return this.httpClient.get<UserProfileResponse>(
      `${environment.baseUrl}/users/${userId}/profile`,
    );
  }

  getBookmarks(): Observable<any> {
    return this.httpClient.get<any>(`${environment.baseUrl}/users/bookmarks`);
  }

  getFollowSuggestions(limit: number = 10): Observable<SuggestionsResponse> {
    return this.httpClient.get<SuggestionsResponse>(
      `${environment.baseUrl}/users/suggestions?limit=${limit}`,
    );
  }

  toggleFollowUser(userId: string): Observable<any> {
    return this.httpClient.put<any>(`${environment.baseUrl}/users/${userId}/follow`, {});
  }

  getUserPosts(userId: string): Observable<ProfilePostsResponse> {
    return this.httpClient.get<ProfilePostsResponse>(
      `${environment.baseUrl}/users/${userId}/posts`,
    );
  }

  signOut(): void {
    localStorage.removeItem('socialToken');
    localStorage.removeItem('userData');
    this.userData$.next(null);
    this.router.navigate(['/login']);
  }
}

