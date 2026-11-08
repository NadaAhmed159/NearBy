import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';
import { User } from '../../core/models/user-profile.interface';
import { Post } from '../../core/models/profile-posts.interface';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { RouterLink } from '@angular/router';
import { PostsService } from '../../core/auth/services/posts.service';

@Component({
  selector: 'app-profile',
  imports: [TimeAgoPipe, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postsService = inject(PostsService);
  userProfile!: User;
  userPosts!: Post[];
  openPostMenuId: string | number | null = null;
  openPrivacyMenuId: string | number | null = null;

  postPrivacyMap: Record<string | number, string> = {};

  ngOnInit(): void {
    this.getProfile();
  }
  getProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (res) => {
        this.userProfile = res.data.user;
        this.getProfilePosts();
      },
    });
  }
  getProfilePosts(): void {
    this.authService.getUserPosts(this.userProfile._id).subscribe({
      next: (res) => {
        this.userPosts = res.data.posts;
      },
    });
  }
  togglePostMenu(postId: string | number, event: MouseEvent): void {
    event.stopPropagation();
    this.openPrivacyMenuId = null;
    this.openPostMenuId = this.openPostMenuId === postId ? null : postId;
  }

  togglePrivacyMenu(postId: string | number, event: MouseEvent): void {
    event.stopPropagation();
    this.openPostMenuId = null;
    this.openPrivacyMenuId = this.openPrivacyMenuId === postId ? null : postId;
  }

  selectPrivacy(postId: string | number, privacy: string): void {
    this.postPrivacyMap[postId] = privacy;
    this.openPrivacyMenuId = null;
  }

  getPrivacy(postId: string | number): string {
    return this.postPrivacyMap[postId] || 'public';
  }
  deletePost(id: string): void {
    this.postsService.deletePost(id).subscribe({
      next: (res) => {
        this.getProfilePosts();
      },
    });
  }
}
