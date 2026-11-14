import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostsService } from '../../../../core/auth/services/posts.service';
import { Post } from '../../../../core/models/post-details.interface';
import { User } from '../../../../core/models/posts-data.interface';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago-pipe';
import { CommentsComponent } from '../comments/comments.component';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-post-detailes',
  imports: [RouterLink, TimeAgoPipe, CommentsComponent, FormsModule],
  templateUrl: './post-detailes.component.html',
  styleUrl: './post-detailes.component.css',
})
export class PostDetailesComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly postsService = inject(PostsService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  postId!: string;
  post!: Post;
  userId: string = '';
  openPrivacyMenuId: string | number | null = null;
  openPostMenuId: string | number | null = null;
  postPrivacyMap: Record<string | number, string> = {};
  showComments = true;

  // Edit post state
  isEditing = false;
  editPostBody = '';
  editPostFile: File | null = null;
  editPostPreview: string | ArrayBuffer | null | undefined = null;

  // Share modal
  showShareModal = false;
  shareCaption = '';

  // Likes modal
  showLikesModal = false;
  postLikesUsers: User[] = [];
  loadingLikes = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.getUserData();
    this.activatedRoute.paramMap.subscribe((param) => {
      this.postId = param.get('id')!;
      if (this.postId) {
        this.getPostDetails();
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

  getUserData(): void {
    const stored = this.authService.getStoredUserData();
    if (stored) {
      this.userId = stored._id;
    }
  }

  getPostDetails(): void {
    this.postsService.getSinglePost(this.postId).subscribe({
      next: (res) => {
        this.post = res.data.post;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  incrementCommentsCount(): void {
    if (this.post) {
      this.post.commentsCount = (this.post.commentsCount || 0) + 1;
    }
  }

  decrementCommentsCount(): void {
    if (this.post && this.post.commentsCount > 0) {
      this.post.commentsCount -= 1;
    }
  }

  deletePost(id: string): void {
    this.postsService.deletePost(id).subscribe({
      next: () => {
        this.toastr.info('Post deleted', 'NearBy Social');
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        console.error(error);
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

  selectPrivacy(postId: string, privacy: string): void {
    this.postPrivacyMap[postId] = privacy;
    this.openPrivacyMenuId = null;

    const formData = new FormData();
    formData.append('privacy', privacy);
    if (this.post?.body) {
      formData.append('body', this.post.body);
    }
    this.postsService.updatePost(postId, formData).subscribe({
      next: () => {
        if (this.post) this.post.privacy = privacy;
        this.toastr.success('Privacy updated', 'NearBy Social');
      },
    });
  }

  getPrivacy(postId: string | number): string {
    return this.postPrivacyMap[postId] || this.post?.privacy || 'public';
  }

  isPostLiked(): boolean {
    return Array.isArray(this.post?.likes) && this.post.likes.includes(this.userId);
  }

  toggleLike(): void {
    if (!this.post) return;
    this.postsService.toggleLikePost(this.post._id).subscribe({
      next: (res) => {
        if (res?.data?.post?.likes) {
          this.post.likes = res.data.post.likes;
          this.post.likesCount = res.data.post.likesCount ?? this.post.likes.length;
        } else {
          if (!Array.isArray(this.post.likes)) this.post.likes = [];
          const idx = this.post.likes.indexOf(this.userId);
          if (idx > -1) {
            this.post.likes.splice(idx, 1);
            this.post.likesCount = Math.max(0, (this.post.likesCount || 1) - 1);
          } else {
            this.post.likes.push(this.userId);
            this.post.likesCount = (this.post.likesCount || 0) + 1;
          }
        }
      },
    });
  }

  toggleBookmark(): void {
    if (!this.post) return;
    this.openPostMenuId = null;
    this.postsService.toggleBookmarkPost(this.post._id).subscribe({
      next: (res) => {
        this.post.bookmarked = res?.data?.bookmarked ?? !this.post.bookmarked;
        this.toastr.success(
          this.post.bookmarked ? 'Post saved to bookmarks' : 'Post removed from bookmarks',
          'NearBy Social',
        );
      },
    });
  }

  startEditPost(): void {
    this.openPostMenuId = null;
    this.isEditing = true;
    this.editPostBody = this.post.body || '';
    this.editPostFile = null;
    this.editPostPreview = this.post.image || null;
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
    this.isEditing = false;
    this.editPostBody = '';
    this.editPostFile = null;
    this.editPostPreview = null;
  }

  saveEditPost(): void {
    if (!this.post) return;
    const formData = new FormData();
    formData.append('body', this.editPostBody.trim());
    if (this.editPostFile) {
      formData.append('image', this.editPostFile);
    }

    this.postsService.updatePost(this.post._id, formData).subscribe({
      next: () => {
        this.toastr.success('Post updated!', 'NearBy Social');
        this.cancelEditPost();
        this.getPostDetails();
      },
    });
  }

  openShareModal(): void {
    this.showShareModal = true;
    this.shareCaption = '';
  }

  closeShareModal(): void {
    this.showShareModal = false;
    this.shareCaption = '';
  }

  confirmSharePost(): void {
    if (!this.post) return;
    this.postsService.sharePost(this.post._id, this.shareCaption.trim()).subscribe({
      next: () => {
        this.post.sharesCount = (this.post.sharesCount || 0) + 1;
        this.toastr.success('Post shared!', 'NearBy Social');
        this.closeShareModal();
      },
    });
  }

  openLikesModal(): void {
    if (!this.post) return;
    this.showLikesModal = true;
    this.loadingLikes = true;
    this.postLikesUsers = [];
    this.postsService.getPostLikes(this.post._id).subscribe({
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
    this.showLikesModal = false;
  }
}

