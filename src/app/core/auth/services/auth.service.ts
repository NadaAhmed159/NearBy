import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDataResponse } from '../../models/user-data.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  signUp(data: object): Observable<UserDataResponse> {
    return this.httpClient.post<UserDataResponse>(
      'https://route-posts.routemisr.com/users/signup',
      data,
    );
  }
  signIn(data: object): Observable<any> {
    return this.httpClient.post<any>('https://route-posts.routemisr.com/users/signin', data);
  }
}
