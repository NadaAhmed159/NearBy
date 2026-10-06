import { UserInfo } from './../../../../core/models/user-data.interface';
import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { PostsService } from '../../../../core/auth/services/posts.service';
import { Post } from '../../../../core/models/posts-data.interface';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommentsComponent } from '../comments/comments.component';

@Component({
  selector: 'app-feed-posts',
  imports: [ReactiveFormsModule, CommentsComponent],
  templateUrl: './feed-posts.component.html',
  styleUrl: './feed-posts.component.css',
})
export class FeedPostsComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  postsList: Post[] = [];

  openPostMenuId: string | number | null = null;
  openPrivacyMenuId: string | number | null = null;

  postPrivacyMap: Record<string | number, string> = {};
  userData!: UserInfo;
  userId: string = '';
  selectedFile!: File;
  selectedFilePreview: string | ArrayBuffer | null | undefined;

  privacyControll = new FormControl('public');
  contentControll = new FormControl('');

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.getUserData();
    this.GetAllPosts();
  }

  GetAllPosts(): void {
    this.postsService.getAllPosts().subscribe({
      next: (res) => {
        this.postsList = res.data.posts;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  incrementCommentsCount(postId: string): void {
    const post = this.postsList.find((item) => item._id === postId);
    if (post) {
      post.commentsCount += 1;
    }
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

  selectPrivacy(postId: string | number, privacy: string): void {
    this.postPrivacyMap[postId] = privacy;
    this.openPrivacyMenuId = null;
  }

  getPrivacy(postId: string | number): string {
    return this.postPrivacyMap[postId] || 'public';
  }

  getUserData(): void {
    this.userId = JSON.parse(localStorage.getItem('userData')!)?._id;
    this.userData = JSON.parse(localStorage.getItem('userData')!);
  }
  FileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.selectedFile = input.files[0];
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);

    reader.addEventListener('load', (e) => {
      this.selectedFilePreview = e.target?.result;
    });
  }

  formSubmit(e: SubmitEvent, form: HTMLFormElement): void {
    e.preventDefault();
    const formData = new FormData();
    if (this.privacyControll.value) {
      formData.append('privacy', this.privacyControll.value);
    }
    if (this.contentControll.value) {
      formData.append('body', this.contentControll.value);
    }
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.postsService.createPost(formData).subscribe({
      next: (res) => {
        form.reset();
        this.selectedFilePreview = '';
        this.GetAllPosts();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  deletePost(id: string): void {
    this.postsService.deletePost(id).subscribe({
      next: (res) => {
        this.GetAllPosts();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
