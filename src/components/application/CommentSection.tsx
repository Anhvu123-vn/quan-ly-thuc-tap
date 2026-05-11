import { useState } from "react";
import { MessageSquare, Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: 'student' | 'lecturer' | 'department' | 'registrar' | 'system';
  };
  content: string;
  createdAt: string;
  attachments?: { name: string; url: string }[];
}

interface CommentSectionProps {
  comments: {
    id: string;
    author: {
      name: string;
      avatar?: string;
      role: 'student' | 'lecturer' | 'department' | 'registrar' | 'system';
    };
    content: string;
    createdAt: string;
    attachments?: { name: string; url: string }[];
  }[];
  currentUser: {
    name: string;
    avatar?: string;
    role: 'student' | 'lecturer' | 'department' | 'registrar' | 'system';
  };
  onSubmit: (content: string) => void;
  disabled?: boolean;
}

const roleColors: Record<Comment['author']['role'], string> = {
  student: 'bg-blue-100 text-blue-700',
  lecturer: 'bg-purple-100 text-purple-700',
  department: 'bg-amber-100 text-amber-700',
  registrar: 'bg-indigo-100 text-indigo-700',
  system: 'bg-gray-100 text-gray-600',
};

const roleLabels: Record<Comment['author']['role'], string> = {
  student: 'Student',
  lecturer: 'Lecturer',
  department: 'Department',
  registrar: 'Registrar',
  system: 'System',
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function CommentSection({ comments, currentUser, onSubmit, disabled }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit(newComment.trim());
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[--color-muted-foreground]" />
          <CardTitle className="text-lg">Comments & Updates</CardTitle>
          {comments.length > 0 && (
            <span className="ml-auto text-sm font-normal text-[--color-muted-foreground]">
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Comments list */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-center py-8 text-sm text-[--color-muted-foreground]">
              No comments yet. Be the first to comment.
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>

        {/* Comment input */}
        {!disabled && (
          <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-[--color-border]">
            <div className="flex gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                {currentUser.avatar ? (
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-[--color-muted-foreground]">
                    <Paperclip className="h-4 w-4" />
                    Attach
                  </Button>
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={!newComment.trim() || isSubmitting}
                    className="gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const initials = comment.author.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9 shrink-0">
        {comment.author.avatar ? (
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
        ) : null}
        <AvatarFallback className="text-xs bg-[--color-muted]">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.author.name}</span>
          <span className={cn("text-xs px-1.5 py-0.5 rounded", roleColors[comment.author.role])}>
            {roleLabels[comment.author.role]}
          </span>
          <span className="text-xs text-[--color-muted-foreground]">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm text-[--color-foreground] whitespace-pre-wrap">
          {comment.content}
        </p>
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {comment.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[--color-accent] hover:underline"
              >
                <Paperclip className="h-3 w-3" />
                {attachment.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
