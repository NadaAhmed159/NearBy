import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NotificationsDataresponse } from '../../models/notifications-data.interface';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  getNotification(): Observable<NotificationsDataresponse> {
    return this.httpClient.get<NotificationsDataresponse>(
      `${environment.baseUrl}/notifications?unread=false&page=1&limit=10`,
    );
  }
}
