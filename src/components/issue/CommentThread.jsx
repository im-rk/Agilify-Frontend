import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CornerDownRight, Pencil, Trash2 } from 'lucide-react';
import { useAddComment, useComments, useDeleteComment, useUpdateComment } from '@/hooks/useComments';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function CommentThread({ issueId, canModerate }) {
  const { data: comments, isLoading } = useComments(issueId);
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const addComment = useAddComment(issueId);

  const roots = comments?.filter((c) => !c.parentCommentId) ?? [];
  const repliesOf = (id) => comments?.filter((c) => c.parentCommentId === id) ?? [];

  const submit = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    await addComment.mutateAsync({ content: draft, parentCommentId: replyTo });
    setDraft('');
    setReplyTo(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {roots.map((comment) => (
        <div key={comment.id} className="flex flex-col gap-3">
          <CommentRow
            comment={comment}
            issueId={issueId}
            currentUserId={user?.id}
            canModerate={canModerate}
            onReply={() => setReplyTo(comment.id)}
          />
          {repliesOf(comment.id).map((reply) => (
            <div key={reply.id} className="ml-8 flex items-start gap-1.5">
              <CornerDownRight className="mt-2.5 size-3 shrink-0 text-muted-foreground" />
              <CommentRow
                comment={reply}
                issueId={issueId}
                currentUserId={user?.id}
                canModerate={canModerate}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      ))}

      <form onSubmit={submit} className="flex flex-col gap-2">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Replying to a comment
            <button type="button" onClick={() => setReplyTo(null)} className="underline">
              cancel
            </button>
          </div>
        )}
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Leave a comment…"
          rows={2}
        />
        <Button type="submit" size="sm" className="self-end" disabled={!draft.trim() || addComment.isPending}>
          Comment
        </Button>
      </form>
    </div>
  );
}

function CommentRow({ comment, issueId, currentUserId, canModerate, onReply, className }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const updateComment = useUpdateComment(issueId);
  const deleteComment = useDeleteComment(issueId);
  const isDeleted = comment.content === '[Comment deleted]';
  const canEdit = !isDeleted && (comment.authorId === currentUserId || canModerate);

  const save = async () => {
    await updateComment.mutateAsync({ commentId: comment.id, content });
    setEditing(false);
  };

  return (
    <div className={`flex items-start gap-2.5 ${className ?? ''}`}>
      <Avatar className="size-7">
        <AvatarFallback className="bg-secondary text-[10px] font-medium">{initials(comment.authorName)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            {comment.isEdited && !isDeleted && ' (edited)'}
          </span>
        </div>
        {editing ? (
          <div className="mt-1 flex flex-col gap-2">
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} autoFocus />
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={updateComment.isPending}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className={`text-sm ${isDeleted ? 'italic text-muted-foreground' : ''}`}>{comment.content}</p>
        )}
      </div>
      {!editing && (
        <div className="flex shrink-0 gap-1 text-muted-foreground">
          {onReply && !isDeleted && (
            <button onClick={onReply} className="text-xs hover:text-foreground">
              Reply
            </button>
          )}
          {canEdit && (
            <>
              <button onClick={() => setEditing(true)} className="hover:text-foreground">
                <Pencil className="size-3.5" />
              </button>
              <button onClick={() => deleteComment.mutate(comment.id)} className="hover:text-destructive">
                <Trash2 className="size-3.5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
