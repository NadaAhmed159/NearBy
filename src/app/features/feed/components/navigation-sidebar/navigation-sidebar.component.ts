import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FeedMode, PostsService } from '../../../../core/auth/services/posts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation-sidebar',
  imports: [],
  templateUrl: './navigation-sidebar.component.html',
  styleUrl: './navigation-sidebar.component.css',
})
export class NavigationSidebarComponent implements OnInit, OnDestroy {
  private readonly postsService = inject(PostsService);
  private sub?: Subscription;

  activeMode: FeedMode = 'feed';

  ngOnInit(): void {
    this.sub = this.postsService.feedMode$.subscribe((mode) => {
      this.activeMode = mode;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  selectMode(mode: FeedMode): void {
    this.postsService.setFeedMode(mode);
  }
}

