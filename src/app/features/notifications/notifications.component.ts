import { Component, inject, OnInit } from '@angular/core';
import { NotificationsService } from '../../core/auth/services/notifications.service';
import { Notification } from '../../core/models/notifications-data.interface';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notifications',
  imports: [TimeAgoPipe, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly toastr = inject(ToastrService);

  notifications: Notification[] = [];
  filterUnread = false;
  unreadCount = 0;
  currentPage = 1;
  hasMore = false;

  ngOnInit(): void {
    this.getNotification();
    this.loadUnreadCount();
    this.notificationsService.unreadCount$.subscribe((c) => {
      this.unreadCount = c;
    });
  }

  setFilter(unread: boolean): void {
    this.filterUnread = unread;
    this.getNotification(1, false);
  }

  getNotification(page: number = 1, append: boolean = false): void {
    this.currentPage = page;
    this.notificationsService.getNotification(this.filterUnread, page, 15).subscribe({
      next: (res) => {
        const list = res.data?.notifications || [];
        this.notifications = append ? [...this.notifications, ...list] : list;
        const p = res.meta?.pagination;
        this.hasMore = Boolean(p && p.currentPage < p.numberOfPages);
      },
    });
  }

  loadMoreNotifications(): void {
    if (!this.hasMore) return;
    this.getNotification(this.currentPage + 1, true);
  }

  loadUnreadCount(): void {
    this.notificationsService.getUnreadCount().subscribe({
      error: () => {},
    });
  }

  markOneAsRead(notification: Notification): void {
    if (notification.isRead) return;
    this.notificationsService.markAsRead(notification._id).subscribe({
      next: () => {
        notification.isRead = true;
        if (this.filterUnread) {
          this.notifications = this.notifications.filter((n) => n._id !== notification._id);
        }
      },
    });
  }

  markAllRead(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.isRead = true));
        if (this.filterUnread) {
          this.notifications = [];
        }
        this.toastr.success('All notifications marked as read', 'NearBy Social');
      },
    });
  }

  getNotificationMessage(n: Notification): string {
    const t = (n.type || '').toLowerCase();
    if (t.includes('comment')) return 'commented on your post:';
    if (t.includes('reply')) return 'replied to your comment:';
    if (t.includes('like')) return `liked your ${n.entityType || 'post'}`;
    if (t.includes('share')) return 'shared your post';
    if (t.includes('follow')) return 'started following you';
    if (t.includes('mention')) return 'mentioned you:';
    return 'interacted with your content';
  }

  getNotificationSnippet(n: Notification): string {
    return n.entity?.topComment?.content || n.entity?.body || '';
  }

  getPostLink(n: Notification): string | null {
    if (n.entity?._id) return n.entity._id;
    if (n.entityType === 'post' && n.entityId) return n.entityId;
    return null;
  }
}

