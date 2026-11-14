import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { SuggestedUser } from '../../../../core/models/user-profile.interface';

@Component({
  selector: 'app-suggested-friends',
  imports: [FormsModule, RouterLink],
  templateUrl: './suggested-friends.component.html',
  styleUrl: './suggested-friends.component.css',
})
export class SuggestedFriendsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  suggestions: SuggestedUser[] = [];
  searchTerm = '';
  limit = 5;
  followingIds = new Set<string>();

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.authService.getFollowSuggestions(this.limit).subscribe({
      next: (res) => {
        this.suggestions = res?.data?.suggestions || res?.data?.users || [];
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  get filteredSuggestions(): SuggestedUser[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.suggestions;
    return this.suggestions.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q),
    );
  }

  toggleFollow(user: SuggestedUser): void {
    if (this.followingIds.has(user._id)) return;
    this.followingIds.add(user._id);

    this.authService.toggleFollowUser(user._id).subscribe({
      next: (res) => {
        this.followingIds.delete(user._id);
        user.isFollowing = !user.isFollowing;
        if (user.isFollowing) {
          user.followersCount = (user.followersCount || 0) + 1;
          this.toastr.success(`Following ${user.name}`, 'NearBy Social');
        } else {
          user.followersCount = Math.max(0, (user.followersCount || 1) - 1);
          this.toastr.info(`Unfollowed ${user.name}`, 'NearBy Social');
        }
      },
      error: () => {
        this.followingIds.delete(user._id);
      },
    });
  }

  viewMore(): void {
    this.limit += 5;
    this.loadSuggestions();
  }
}

