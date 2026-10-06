import { Component, inject, Input, OnInit, output } from '@angular/core';
import { CommentsService } from '../../../../core/auth/services/comments.service';
import { CommentData } from '../../../../core/models/comment-data.interface';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserInfo } from '../../../../core/models/user-data.interface';

@Component({
  selector: 'app-comments',
  imports: [ReactiveFormsModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent implements OnInit {
  private readonly commentsService = inject(CommentsService);
  userData!: UserInfo;
  userId: string = '';
  selectedFile!: File;
  selectedFilePreview: string | ArrayBuffer | null | undefined = '';

  @Input() postId!: string;
  commentAdded = output<void>();
  comments: CommentData[] = [];

  commentControl = new FormControl('');
  ngOnInit(): void {
    this.getUserData();
    this.getPostComments();
  }
  getUserData(): void {
    this.userId = JSON.parse(localStorage.getItem('userData')!)?._id;
    this.userData = JSON.parse(localStorage.getItem('userData')!);
  }

  getPostComments(): void {
    this.commentsService.getAllComments(this.postId).subscribe({
      next: (res) => {
        this.comments = res.data.comments;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  submitComment(e: Event): void {
    e.preventDefault();
    const formData = new FormData();
    const content = this.commentControl.value?.trim();
    if (content) {
      formData.append('content', content);
    }
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    this.commentsService.createComment(this.postId, formData).subscribe({
      next: (res) => {
        this.commentAdded.emit();
        this.commentControl.reset();
        this.selectedFilePreview = '';
        this.getPostComments();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  removeFile(): void {
    this.selectedFilePreview = '';
  }
  onFileSelected(e: Event): void {
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
}
