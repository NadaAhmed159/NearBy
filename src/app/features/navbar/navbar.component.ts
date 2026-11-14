import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { NotificationsService } from '../../core/auth/services/notifications.service';
import { UserInfo } from '../../core/models/user-data.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  userData: UserInfo | null = null;
  unreadCount = 0;

  private readonly authService = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly subs = new Subscription();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.getUserData();
    this.subs.add(
      this.authService.userData$.subscribe((user) => {
        if (user) {
          this.userData = user;
        }
      }),
    );
    this.subs.add(
      this.notificationsService.unreadCount$.subscribe((count) => {
        this.unreadCount = count;
      }),
    );
    this.notificationsService.getUnreadCount().subscribe({
      error: () => {},
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  signOut(): void {
    this.authService.signOut();
  }

  getUserData(): void {
    const stored = this.authService.getStoredUserData();
    if (stored) {
      this.userData = stored;
    }
  }
}

