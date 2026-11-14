import { Component, inject, Input, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import { CommentsService } from '../../../../core/auth/services/comments.service';
import { CommentData } from '../../../../core/models/comment-data.interface';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserInfo } from '../../../../core/models/user-data.interface';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago-pipe';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-comments',
  imports: [ReactiveFormsModule, FormsModule, TimeAgoPipe, RouterLink],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent implements OnInit, OnChanges {
  private readonly commentsService = inject(CommentsService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  userData: UserInfo | null = null;
  userId: string = '';
  selectedFile: File | null = null;
  selectedFilePreview: string | ArrayBuffer | null | undefined = '';

  @Input() postId!: string;
  commentAdded = output<void>();
  commentDeleted = output<void>();
  comments: CommentData[] = [];
  currentPage = 1;
  hasMoreComments = false;

  commentControl = new FormControl('');

  // Edit comment state
  editingCommentId: string | null = null;
  editCommentText: string = '';
  editCommentFile: File | null = null;
  editCommentPreview: string | ArrayBuffer | null | undefined = '';

  // Replies state per commentId
  openRepliesMap: Record<string, boolean> = {};
  repliesMap: Record<string, CommentData[]> = {};
  replyTextMap: Record<string, string> = {};
  replyFileMap: Record<string, File | null> = {};
  replyPreviewMap: Record<string, string | ArrayBuffer | null | undefined> = {};

  ngOnInit(): void {
    this.getUserData();
    if (this.postId) {
      this.getPostComments();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postId'] && !changes['postId'].firstChange && this.postId) {
      this.getPostComments();
    }
  }

  getUserData(): void {
    const stored = this.authService.getStoredUserData();
    if (stored) {
      this.userData = stored;
      this.userId = stored._id;
    }
  }

  getPostComments(page: number = 1, append: boolean = false): void {
    this.currentPage = page;
    this.commentsService.getAllComments(this.postId, page, 10).subscribe({
      next: (res) => {
        const fetched = (res.data?.comments || []).map((c) => ({
          ...c,
          likes: Array.isArray(c.likes) ? c.likes : [],
        }));
        this.comments = append ? [...this.comments, ...fetched] : fetched;
        const p = res.meta?.pagination;
        this.hasMoreComments = Boolean(p && p.currentPage < p.numberOfPages);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  loadMoreComments(): void {
    if (!this.hasMoreComments) return;
    this.getPostComments(this.currentPage + 1, true);
  }

  submitComment(e: Event, fileInput?: HTMLInputElement): void {
    e.preventDefault();
    const content = this.commentControl.value?.trim();
    if (!content && !this.selectedFile) return;

    const formData = new FormData();
    if (content) {
      formData.append('content', content);
    }
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.commentsService.createComment(this.postId, formData).subscribe({
      next: () => {
        this.commentAdded.emit();
        this.commentControl.reset();
        this.removeFile();
        if (fileInput) fileInput.value = '';
        this.getPostComments(1, false);
        this.toastr.success('Comment added', 'NearBy Social');
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFilePreview = '';
  }

  onFileSelected(e: Event): void {
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

  isCommentLiked(comment: CommentData): boolean {
    return Array.isArray(comment.likes) && comment.likes.includes(this.userId);
  }

  toggleLikeComment(comment: CommentData): void {
    this.commentsService.toggleLikeComment(this.postId, comment._id).subscribe({
      next: (res) => {
        if (res?.data?.comment?.likes) {
          comment.likes = res.data.comment.likes;
        } else {
          if (!Array.isArray(comment.likes)) comment.likes = [];
          const idx = comment.likes.indexOf(this.userId);
          if (idx > -1) {
            comment.likes.splice(idx, 1);
          } else {
            comment.likes.push(this.userId);
          }
        }
      },
    });
  }

  startEditComment(comment: CommentData): void {
    this.editingCommentId = comment._id;
    this.editCommentText = comment.content || '';
    this.editCommentFile = null;
    this.editCommentPreview = comment.image || '';
  }

  onEditCommentFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.editCommentFile = input.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.editCommentFile);
      reader.addEventListener('load', (ev) => {
        this.editCommentPreview = ev.target?.result;
      });
    }
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editCommentText = '';
    this.editCommentFile = null;
    this.editCommentPreview = '';
  }

  saveEditComment(comment: CommentData, parentCommentId?: string): void {
    const text = this.editCommentText.trim();
    if (!text && !this.editCommentFile) return;

    const formData = new FormData();
    if (text) {
      formData.append('content', text);
    }
    if (this.editCommentFile) {
      formData.append('image', this.editCommentFile);
    }

    this.commentsService.updateComment(this.postId, comment._id, formData).subscribe({
      next: () => {
        comment.content = text;
        this.cancelEditComment();
        this.toastr.success('Comment updated', 'NearBy Social');
        if (parentCommentId) {
          this.loadReplies(parentCommentId);
        } else {
          this.getPostComments(1, false);
        }
      },
    });
  }

  deleteCommentItem(comment: CommentData, parentComment?: CommentData): void {
    this.commentsService.deleteComment(this.postId, comment._id).subscribe({
      next: () => {
        this.toastr.info('Comment deleted', 'NearBy Social');
        if (parentComment) {
          parentComment.repliesCount = Math.max(0, (parentComment.repliesCount || 1) - 1);
          this.loadReplies(parentComment._id);
        } else {
          this.comments = this.comments.filter((c) => c._id !== comment._id);
          this.commentDeleted.emit();
        }
      },
    });
  }

  toggleReplies(comment: CommentData): void {
    const id = comment._id;
    this.openRepliesMap[id] = !this.openRepliesMap[id];
    if (this.openRepliesMap[id]) {
      this.loadReplies(id);
    }
  }

  loadReplies(commentId: string): void {
    this.commentsService.getCommentReplies(this.postId, commentId).subscribe({
      next: (res) => {
        this.repliesMap[commentId] = res.data?.replies || res.data?.comments || [];
      },
    });
  }

  onReplyFileSelected(commentId: string, e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.replyFileMap[commentId] = file;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', (ev) => {
        this.replyPreviewMap[commentId] = ev.target?.result;
      });
    }
  }

  removeReplyFile(commentId: string): void {
    this.replyFileMap[commentId] = null;
    this.replyPreviewMap[commentId] = '';
  }

  submitReply(comment: CommentData, e: Event): void {
    e.preventDefault();
    const id = comment._id;
    const text = (this.replyTextMap[id] || '').trim();
    const file = this.replyFileMap[id];
    if (!text && !file) return;

    const formData = new FormData();
    if (text) {
      formData.append('content', text);
    }
    if (file) {
      formData.append('image', file);
    }

    this.commentsService.createReply(this.postId, id, formData).subscribe({
      next: () => {
        this.replyTextMap[id] = '';
        this.removeReplyFile(id);
        comment.repliesCount = (comment.repliesCount || 0) + 1;
        this.loadReplies(id);
        this.toastr.success('Reply added', 'NearBy Social');
      },
    });
  }
}

