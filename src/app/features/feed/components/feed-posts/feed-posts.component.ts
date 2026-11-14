import { UserInfo } from './../../../../core/models/user-data.interface';
import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { FeedMode, PostsService } from '../../../../core/auth/services/posts.service';
import { Post, User } from '../../../../core/models/posts-data.interface';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommentsComponent } from '../comments/comments.component';
import { RouterLink } from '@angular/router';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago-pipe';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feed-posts',
  imports: [ReactiveFormsModule, FormsModule, CommentsComponent, RouterLink, TimeAgoPipe],
  templateUrl: './feed-posts.component.html',
  styleUrl: './feed-posts.component.css',
})
export class FeedPostsComponent implements OnInit, OnDestroy {
  private readonly postsService = inject(PostsService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly subs = new Subscription();

  postsList: Post[] = [];
  activeMode: FeedMode = 'feed';
  currentPage = 1;
  hasMorePages = false;
  loadingMore = false;

  openPostMenuId: string | number | null = null;
  openPrivacyMenuId: string | number | null = null;
  openCommentsMap: Record<string, boolean> = {};

  postPrivacyMap: Record<string | number, string> = {};
  userData: UserInfo | null = null;
  userId: string = '';
  selectedFile: File | null = null;
  selectedFilePreview: string | ArrayBuffer | null | undefined;

  privacyControll = new FormControl('public');
  contentControll = new FormControl('');

  // Edit post state
  editingPostId: string | null = null;
  editPostBody: string = '';
  editPostFile: File | null = null;
  editPostPreview: string | ArrayBuffer | null | undefined = null;

  // Share post modal state
  sharingPost: Post | null = null;
  shareCaption: string = '';

  // Post likes modal state
  likesModalPostId: string | null = null;
  postLikesUsers: User[] = [];
  loadingLikes = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.getUserData();
    this.subs.add(
      this.authService.userData$.subscribe((u) => {
        if (u) {
          this.userData = u;
          this.userId = u._id;
        }
      }),
    );
    this.subs.add(
      this.postsService.feedMode$.subscribe((mode) => {
        this.activeMode = mode;
        this.loadPostsByMode(mode);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setMode(mode: FeedMode): void {
    this.postsService.setFeedMode(mode);
  }

  loadPostsByMode(mode: FeedMode, page: number = 1, append: boolean = false): void {
    this.currentPage = page;
    if (mode === 'feed') {
      this.postsService.getHomeFeed('following', page, 20).subscribe({
        next: (res) => {
          const feedPosts = res.data?.posts || [];
          if (feedPosts.length > 0 || append) {
            this.postsList = append ? [...this.postsList, ...feedPosts] : feedPosts;
            this.updatePagination(res.meta?.pagination);
          } else {
            this.GetAllPosts(page, append);
          }
          this.loadingMore = false;
        },
        error: () => {
          this.loadingMore = false;
          if (!append) this.GetAllPosts(1, false);
        },
      });
    } else if (mode === 'community') {
      this.GetAllPosts(page, append);
    } else if (mode === 'my-posts') {
      if (!this.userId) return;
      this.authService.getUserPosts(this.userId).subscribe({
        next: (res) => {
          const posts = (res.data?.posts as unknown as Post[]) || [];
          this.postsList = append ? [...this.postsList, ...posts] : posts;
          this.updatePagination(res.meta?.pagination);
          this.loadingMore = false;
        },
        error: () => {
          this.loadingMore = false;
        },
      });
    } else if (mode === 'saved') {
      this.authService.getBookmarks().subscribe({
        next: (res) => {
          const raw = res?.data?.bookmarks || res?.data?.posts || [];
          this.postsList = raw
            .map((item: any) => (item?.post ? item.post : item))
            .filter((p: any) => p && p._id)
            .map((p: Post) => ({ ...p, bookmarked: true }));
          this.hasMorePages = false;
          this.loadingMore = false;
        },
        error: () => {
          this.loadingMore = false;
        },
      });
    }
  }

  private updatePagination(pagination?: { currentPage: number; numberOfPages: number; nextPage?: number }): void {
    if (!pagination) {
      this.hasMorePages = false;
      return;
    }
    this.hasMorePages =
      Boolean(pagination.nextPage) || pagination.currentPage < pagination.numberOfPages;
  }

  loadMorePosts(): void {
    if (!this.hasMorePages || this.loadingMore) return;
    this.loadingMore = true;
    this.loadPostsByMode(this.activeMode, this.currentPage + 1, true);
  }

  GetAllPosts(page: number = 1, append: boolean = false): void {
    this.postsService.getAllPosts(page, 20).subscribe({
      next: (res) => {
        const posts = res.data?.posts || [];
        this.postsList = append ? [...this.postsList, ...posts] : posts;
        this.updatePagination(res.meta?.pagination);
        this.loadingMore = false;
      },
      error: (error) => {
        this.loadingMore = false;
        console.error(error);
      },
    });
  }

  incrementCommentsCount(postId: string): void {
    const post = this.postsList.find((item) => item._id === postId);
    if (post) {
      post.commentsCount += 1;
    }
  }

  decrementCommentsCount(postId: string): void {
    const post = this.postsList.find((item) => item._id === postId);
    if (post && post.commentsCount > 0) {
      post.commentsCount -= 1;
    }
  }

  toggleComments(postId: string): void {
    this.openCommentsMap[postId] = !this.openCommentsMap[postId];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.openPostMenuId = null;
      this.openPrivacyMenuId = null;
    }
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

  getUserData(): void {
    const stored = this.authService.getStoredUserData();
    if (stored) {
      this.userId = stored._id;
      this.userData = stored;
    }
  }

  FileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
      reader.addEventListener('load', (ev) => {
        this.selectedFilePreview = ev.target?.result;
      });
    }
  }

  removeSelectedFile(fileInput?: HTMLInputElement): void {
    this.selectedFile = null;
    this.selectedFilePreview = null;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  formSubmit(e: SubmitEvent, form: HTMLFormElement): void {
    e.preventDefault();
    const body = this.contentControll.value?.trim();
    if (!body && !this.selectedFile) return;

    const formData = new FormData();
    if (this.privacyControll.value) {
      formData.append('privacy', this.privacyControll.value);
    }
    if (body) {
      formData.append('body', body);
    }
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.postsService.createPost(formData).subscribe({
      next: () => {
        form.reset();
        this.contentControll.reset('');
        this.privacyControll.setValue('public');
        this.selectedFile = null;
        this.selectedFilePreview = '';
        this.toastr.success('Post created successfully!', 'NearBy Social');
        this.loadPostsByMode(this.activeMode);
      },
      error: (error) => {
        console.error(error);
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
        this.toastr.success('Post updated successfully!', 'NearBy Social');
        this.cancelEditPost();
        this.loadPostsByMode(this.activeMode);
      },
    });
  }

  deletePost(id: string): void {
    this.openPostMenuId = null;
    this.postsService.deletePost(id).subscribe({
      next: () => {
        this.toastr.info('Post deleted', 'NearBy Social');
        this.postsList = this.postsList.filter((p) => p._id !== id && p.id !== id);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  isPostLiked(post: Post): boolean {
    return Array.isArray(post.likes) && post.likes.includes(this.userId);
  }

  toggleLike(post: Post): void {
    this.postsService.toggleLikePost(post._id).subscribe({
      next: (res) => {
        if (res?.data?.post?.likes) {
          post.likes = res.data.post.likes;
          post.likesCount = res.data.post.likesCount ?? post.likes.length;
        } else {
          if (!Array.isArray(post.likes)) post.likes = [];
          const idx = post.likes.indexOf(this.userId);
          if (idx > -1) {
            post.likes.splice(idx, 1);
            post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
          } else {
            post.likes.push(this.userId);
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
        if (this.activeMode === 'saved' && !post.bookmarked) {
          this.postsList = this.postsList.filter((p) => p._id !== post._id);
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
    const targetPost = this.sharingPost;
    const body = this.shareCaption.trim();

    this.postsService.sharePost(targetPost._id, body).subscribe({
      next: () => {
        targetPost.sharesCount = (targetPost.sharesCount || 0) + 1;
        this.toastr.success('Post shared to your feed!', 'NearBy Social');
        this.closeShareModal();
        this.loadPostsByMode(this.activeMode);
      },
    });
  }

  openLikesModal(postId: string): void {
    this.likesModalPostId = postId;
    this.postLikesUsers = [];
    this.loadingLikes = true;
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
    this.postLikesUsers = [];
  }
}

