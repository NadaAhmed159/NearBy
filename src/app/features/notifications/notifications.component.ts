import { Component, inject, OnInit } from '@angular/core';
import { NotificationsService } from '../../core/auth/services/notifications.service';
import { Notification } from '../../core/models/notifications-data.interface';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';

@Component({
  selector: 'app-notifications',
  imports: [TimeAgoPipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  notifications!: Notification[];
  ngOnInit(): void {
    this.getNotification();
  }

  getNotification(): void {
    this.notificationsService.getNotification().subscribe({
      next: (res) => {
        this.notifications = res.data.notifications;
        console.log(res);
      },
    });
  }
}
