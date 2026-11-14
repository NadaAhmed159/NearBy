import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NotificationsDataresponse } from '../../models/notifications-data.interface';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly httpClient = inject(HttpClient);

  unreadCount$ = new BehaviorSubject<number>(0);

  getNotification(
    unread: boolean = false,
    page: number = 1,
    limit: number = 20,
  ): Observable<NotificationsDataresponse> {
    return this.httpClient.get<NotificationsDataresponse>(
      `${environment.baseUrl}/notifications?unread=${unread}&page=${page}&limit=${limit}`,
    );
  }

  getUnreadCount(): Observable<any> {
    return this.httpClient.get<any>(`${environment.baseUrl}/notifications/unread-count`).pipe(
      tap((res) => {
        const count = res?.data?.unreadCount ?? res?.data?.count ?? 0;
        this.unreadCount$.next(count);
      }),
    );
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.httpClient
      .patch<any>(`${environment.baseUrl}/notifications/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          const current = this.unreadCount$.value;
          if (current > 0) {
            this.unreadCount$.next(current - 1);
          }
        }),
      );
  }

  markAllAsRead(): Observable<any> {
    return this.httpClient
      .patch<any>(`${environment.baseUrl}/notifications/read-all`, {})
      .pipe(tap(() => this.unreadCount$.next(0)));
  }
}

