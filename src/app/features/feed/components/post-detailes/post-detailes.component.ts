import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostsService } from '../../../../core/auth/services/posts.service';
import { Post } from '../../../../core/models/post-details.interface';

@Component({
  selector: 'app-post-detailes',
  imports: [RouterLink],
  templateUrl: './post-detailes.component.html',
  styleUrl: './post-detailes.component.css',
})
export class PostDetailesComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly postsService = inject(PostsService);
  private readonly router = inject(Router);

  postId!: string;
  post!: Post;
  userId: string = '';
  openPrivacyMenuId: string | number | null = null;
  openPostMenuId: string | number | null = null;
  postPrivacyMap: Record<string | number, string> = {};

  ngOnInit(): void {
    this.getUserData();
    this.getPostId();
    this.getPostDetails();
  }
  getUserData(): void {
    this.userId = JSON.parse(localStorage.getItem('userData')!)?._id;
  }

  getPostId(): void {
    this.activatedRoute.paramMap.subscribe((param) => {
      this.postId = param.get('id')!;
    });
  }
  getPostDetails(): void {
    this.postsService.getSinglePost(this.postId).subscribe({
      next: (res) => {
        this.post = res.data.post;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  deletePost(id: string): void {
    this.postsService.deletePost(id).subscribe({
      next: (res) => {
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        console.log(error);
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
}
