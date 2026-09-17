import { Component, ElementRef, HostListener } from '@angular/core';
import { NavigationSidebarComponent } from './components/navigation-sidebar/navigation-sidebar.component';
import { FeedPostsComponent } from './components/feed-posts/feed-posts.component';
import { SuggestedFriendsComponent } from './components/suggested-friends/suggested-friends.component';

@Component({
  selector: 'app-feed',
  imports: [NavigationSidebarComponent, FeedPostsComponent, SuggestedFriendsComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent {
  isPostMenuOpen = false;
  isPrivacyMenuOpen = false;
  selectedPrivacy = 'public';

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isPostMenuOpen = false;
      this.isPrivacyMenuOpen = false;
    }
  }

  togglePostMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isPrivacyMenuOpen = false;
    this.isPostMenuOpen = !this.isPostMenuOpen;
  }

  togglePrivacyMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isPostMenuOpen = false;
    this.isPrivacyMenuOpen = !this.isPrivacyMenuOpen;
  }

  selectPrivacy(privacy: string): void {
    this.selectedPrivacy = privacy;
    this.isPrivacyMenuOpen = false;
  }
}
