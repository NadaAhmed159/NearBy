import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { UserInfo } from '../../core/models/user-data.interface';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  userData!: UserInfo;

  private readonly authService = inject(AuthService);
  constructor(private elementRef: ElementRef) {}
  ngOnInit(): void {
    this.getUserData();
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
    this.userData = JSON.parse(localStorage.getItem('userData')!);
  }
}
