import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';
import { User } from '../../core/models/user-profile.interface';
import { Post } from '../../core/models/profile-posts.interface';
import { User as PostUser } from '../../core/models/posts-data.interface';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostsService } from '../../core/auth/services/posts.service';
import { CommentsComponent } from '../feed/components/comments/comments.component';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  imports: [TimeAgoPipe, RouterLink, CommentsComponent, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postsService = inject(PostsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastr = inject(ToastrService);

  currentUserId = '';
  isOwnProfile = true;
  isFollowing = false;

  userProfile!: User;
  userPosts: Post[] = [];
  savedPosts: Post[] = [];
  activeTab: 'posts' | 'saved' = 'posts';

  openPostMenuId: string | number | null = null;
  openPrivacyMenuId: string | number | null = null;
  openCommentsMap: Record<string, boolean> = {};

  postPrivacyMap: Record<string | number, string> = {};

  // Edit post state
  editingPostId: string | null = null;
  editPostBody = '';
  editPostFile: File | null = null;
  editPostPreview: string | ArrayBuffer | null | undefined = null;

  // Share post modal
  sharingPost: Post | null = null;
  shareCaption = '';

  // Post likes modal
  likesModalPostId: string | null = null;
  postLikesUsers: PostUser[] = [];
  loadingLikes = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    const stored = this.authService.getStoredUserData();
    if (stored) {
      this.currentUserId = stored._id;
    }

    this.activatedRoute.paramMap.subscribe((params) => {
      const routeUserId = params.get('id');
      this.activeTab = 'posts';
      if (!routeUserId || routeUserId === this.currentUserId) {
        this.isOwnProfile = true;
        this.getMyProfile();
      } else {
        this.isOwnProfile = false;
        this.getOtherUserProfile(routeUserId);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.openPostMenuId = null;
      this.openPrivacyMenuId = null;
    }
  }

  get displayedPosts(): Post[] {
    return this.activeTab === 'posts' ? this.userPosts : this.savedPosts;
  }

  getMyProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (res) => {
        this.userProfile = res.data.user;
        this.currentUserId = this.userProfile._id;
        this.getProfilePosts(this.userProfile._id);
        this.loadBookmarks();
      },
    });
  }

  getOtherUserProfile(userId: string): void {
    this.authService.getUserProfileById(userId).subscribe({
      next: (res) => {
        this.userProfile = res.data.user;
        this.isFollowing =
          res.data.isFollowing ??
          this.userProfile.isFollowing ??
          (Array.isArray(this.userProfile.followers) &&
            this.userProfile.followers.some(
              (f: any) => f === this.currentUserId || f?._id === this.currentUserId,
            ));
        this.getProfilePosts(userId);
      },
    });
  }

  getProfilePosts(userId: string): void {
    this.authService.getUserPosts(userId).subscribe({
      next: (res) => {
        this.userPosts = res.data?.posts || [];
      },
    });
  }

  loadBookmarks(): void {
    this.authService.getBookmarks().subscribe({
      next: (res) => {
        const raw = res?.data?.bookmarks || res?.data?.posts || [];
        this.savedPosts = raw
          .map((item: any) => (item?.post ? item.post : item))
          .filter((p: any) => p && p._id)
          .map((p: Post) => ({ ...p, bookmarked: true }));
      },
    });
  }

  switchTab(tab: 'posts' | 'saved'): void {
    this.activeTab = tab;
    if (tab === 'saved' && this.isOwnProfile) {
      this.loadBookmarks();
    }
  }

  onProfilePhotoSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('photo', file);

      this.authService.uploadProfilePhoto(formData).subscribe({
        next: (res) => {
          const newPhoto = res?.data?.photo || res?.data?.user?.photo;
          if (newPhoto && this.userProfile) {
            this.userProfile.photo = newPhoto;
          } else {
            this.getMyProfile();
          }
          this.toastr.success('Profile photo updated!', 'NearBy Social');
        },
      });
    }
  }

  toggleFollowProfileUser(): void {
    if (!this.userProfile || this.isOwnProfile) return;
    this.authService.toggleFollowUser(this.userProfile._id).subscribe({
      next: () => {
        this.isFollowing = !this.isFollowing;
        if (this.isFollowing) {
          this.userProfile.followersCount = (this.userProfile.followersCount || 0) + 1;
          this.toastr.success(`Following ${this.userProfile.name}`, 'NearBy Social');
        } else {
          this.userProfile.followersCount = Math.max(
            0,
            (this.userProfile.followersCount || 1) - 1,
          );
          this.toastr.info(`Unfollowed ${this.userProfile.name}`, 'NearBy Social');
        }
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

  selectPrivacy(post: Post, privacy: string): void {
    this.postPrivacyMap[post._id] = privacy;
    this.openPrivacyMenuId = null;

    const formData = new FormData();
    formData.append('privacy', privacy);
    if (post.body) {
      formData.append('body', post.body);
    }
    this.postsService.updatePost(post._id, formData).subscribe({
      next: () => {
        post.privacy = privacy;
        this.toastr.success('Privacy updated', 'NearBy Social');
      },
    });
  }

  getPrivacy(post: Post): string {
    return this.postPrivacyMap[post._id] || post.privacy || 'public';
  }

  deletePost(id: string): void {
    this.openPostMenuId = null;
    this.postsService.deletePost(id).subscribe({
      next: () => {
        this.toastr.info('Post deleted', 'NearBy Social');
        this.userPosts = this.userPosts.filter((p) => p._id !== id && p.id !== id);
        this.savedPosts = this.savedPosts.filter((p) => p._id !== id && p.id !== id);
      },
    });
  }

  toggleComments(postId: string): void {
    this.openCommentsMap[postId] = !this.openCommentsMap[postId];
  }

  incrementCommentsCount(postId: string): void {
    const post = this.displayedPosts.find((p) => p._id === postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
    }
  }

  decrementCommentsCount(postId: string): void {
    const post = this.displayedPosts.find((p) => p._id === postId);
    if (post && post.commentsCount > 0) {
      post.commentsCount -= 1;
    }
  }

  isPostLiked(post: Post): boolean {
    return Array.isArray(post.likes) && post.likes.includes(this.currentUserId);
  }

  toggleLike(post: Post): void {
    this.postsService.toggleLikePost(post._id).subscribe({
      next: (res) => {
        if (res?.data?.post?.likes) {
          post.likes = res.data.post.likes;
          post.likesCount = res.data.post.likesCount ?? post.likes.length;
        } else {
          if (!Array.isArray(post.likes)) post.likes = [];
          const idx = post.likes.indexOf(this.currentUserId);
          if (idx > -1) {
            post.likes.splice(idx, 1);
            post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
          } else {
            post.likes.push(this.currentUserId);
            post.likesCount = (post.likesCount || 0) + 1;
          }
        }
      },
    });
  }

  toggleBookmark(post: Post): void {
    this.openPostMenuId = null;
    this.postsService.toggleBookmarkPost(post._id).subscribe({
      next: (res) => {
        post.bookmarked = res?.data?.bookmarked ?? !post.bookmarked;
        this.toastr.success(
          post.bookmarked ? 'Post saved to bookmarks' : 'Post removed from bookmarks',
          'NearBy Social',
        );
        if (this.isOwnProfile) {
          this.loadBookmarks();
        }
      },
    });
  }

  startEditPost(post: Post): void {
    this.openPostMenuId = null;
    this.editingPostId = post._id;
    this.editPostBody = post.body || '';
    this.editPostFile = null;
    this.editPostPreview = post.image || null;
  }

  onEditFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.editPostFile = input.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.editPostFile);
      reader.addEventListener('load', (ev) => {
        this.editPostPreview = ev.target?.result;
      });
    }
  }

  cancelEditPost(): void {
    this.editingPostId = null;
    this.editPostBody = '';
    this.editPostFile = null;
    this.editPostPreview = null;
  }

  saveEditPost(post: Post): void {
    const formData = new FormData();
    formData.append('body', this.editPostBody.trim());
    if (this.editPostFile) {
      formData.append('image', this.editPostFile);
    }

    this.postsService.updatePost(post._id, formData).subscribe({
      next: () => {
        this.toastr.success('Post updated!', 'NearBy Social');
        this.cancelEditPost();
        if (this.userProfile) {
          this.getProfilePosts(this.userProfile._id);
        }
      },
    });
  }

  openShareModal(post: Post): void {
    this.sharingPost = post;
    this.shareCaption = '';
  }

  closeShareModal(): void {
    this.sharingPost = null;
    this.shareCaption = '';
  }

  confirmSharePost(): void {
    if (!this.sharingPost) return;
    const target = this.sharingPost;
    this.postsService.sharePost(target._id, this.shareCaption.trim()).subscribe({
      next: () => {
        target.sharesCount = (target.sharesCount || 0) + 1;
        this.toastr.success('Post shared!', 'NearBy Social');
        this.closeShareModal();
        if (this.isOwnProfile && this.userProfile) {
          this.getProfilePosts(this.userProfile._id);
        }
      },
    });
  }

  openLikesModal(postId: string): void {
    this.likesModalPostId = postId;
    this.loadingLikes = true;
    this.postLikesUsers = [];
    this.postsService.getPostLikes(postId).subscribe({
      next: (res) => {
        this.loadingLikes = false;
        const raw = res?.data?.likes || res?.data?.users || [];
        this.postLikesUsers = raw
          .map((item: any) => (item?.user ? item.user : item))
          .filter((u: any) => u && u._id);
      },
      error: () => {
        this.loadingLikes = false;
      },
    });
  }

  closeLikesModal(): void {
    this.likesModalPostId = null;
  }
}

