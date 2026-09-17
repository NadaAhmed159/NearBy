import { Component, ElementRef, HostListener, signal } from '@angular/core';
export interface Post {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  timeAgo: string;
  privacy: 'public' | 'followers' | 'only me';
  content: string;
  bannerText: string;
  likes: number;
  shares: number;
  comments: number;
}
@Component({
  selector: 'app-feed-posts',
  imports: [],
  templateUrl: './feed-posts.component.html',
  styleUrl: './feed-posts.component.css',
})
export class FeedPostsComponent {
  activeMenuPostId = signal<string | null>(null);
  activePrivacyPostId = signal<string | null>(null);

  posts = signal<Post[]>([
    {
      id: 'p1',
      author: 'Ahmed Menisy',
      handle: '@menisy',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AhmedMenisy',
      timeAgo: '12h',
      privacy: 'public',
      content: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quae, quod?',
      bannerText: 'ROUTE',
      likes: 0,
      shares: 0,
      comments: 1,
    },
  ]);

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllMenus();
    }
  }

  togglePostMenu(postId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activePrivacyPostId.set(null);
    this.activeMenuPostId.update((current) => (current === postId ? null : postId));
  }

  togglePrivacyMenu(postId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeMenuPostId.set(null);
    this.activePrivacyPostId.update((current) => (current === postId ? null : postId));
  }

  selectPrivacy(postId: string, privacy: 'public' | 'followers' | 'only me'): void {
    this.posts.update((currentPosts) =>
      currentPosts.map((post) => (post.id === postId ? { ...post, privacy } : post)),
    );
    this.activePrivacyPostId.set(null);
  }

  closeAllMenus(): void {
    this.activeMenuPostId.set(null);
    this.activePrivacyPostId.set(null);
  }
}
