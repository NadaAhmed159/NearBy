import { Component, inject, OnInit } from '@angular/core';
import { NavigationSidebarComponent } from './components/navigation-sidebar/navigation-sidebar.component';
import { FeedPostsComponent } from './components/feed-posts/feed-posts.component';
import { SuggestedFriendsComponent } from './components/suggested-friends/suggested-friends.component';

@Component({
  selector: 'app-feed',
  imports: [NavigationSidebarComponent, FeedPostsComponent, SuggestedFriendsComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent {}
