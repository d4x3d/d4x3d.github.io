import SectionHeader from '../components/SectionHeader';
import { Code, Heart, Send, Trash2, Pencil, User, Share2, LogOut, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery, useMutation } from 'convex/react';
// @ts-ignore
import { api } from '../../convex/_generated/api';
import { useEffect, useRef, useState, ChangeEvent } from 'react';

type Viewer = {
  _id: string;
  name: string | null;
  displayName: string | null;
  email: string | null;
  image: string | null;
  isOwner: boolean;
};

type Draft = {
  title: string;
  slug: string;
  summary: string;
  content: string;
};

const createEmptyDraft = (): Draft => ({ title: '', slug: '', summary: '', content: '' });

export default function BlogPage() {
  const { signIn, signOut } = useAuthActions();
  const me = useQuery((api as any).users.me) as Viewer | null | undefined;
  const posts = useQuery((api as any).blog.list) as any[] | undefined;

  const createPost = useMutation((api as any).blog.create);
  const updatePost = useMutation((api as any).blog.update);
  const ensureProfile = useMutation((api as any).users.ensureProfile);

  const [draft, setDraft] = useState<Draft>(() => createEmptyDraft());
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const ensureRef = useRef(false);
  useEffect(() => {
    if (me && !ensureRef.current) {
      ensureRef.current = true;
      void ensureProfile({}).catch(() => {
        ensureRef.current = false;
      });
    }
    if (!me) {
      ensureRef.current = false;
    }
  }, [me, ensureProfile]);

  const authLoading = me === undefined;
  const signedIn = Boolean(me);
  const isOwner = Boolean(me?.isOwner);
  const viewerName = me?.displayName ?? me?.name ?? me?.email ?? '';

  const beginSignIn = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    void signIn('github', { redirectTo: `${base}/#/blog` });
  };

  const handleSignOut = async () => {
    await signOut();
    setShowEditor(false);
    setEditingSlug(null);
    setDraft(createEmptyDraft());
  };

  const handleSubmit = async () => {
    if (!isOwner) return;
    const trimmed: Draft = {
      title: draft.title.trim(),
      slug: draft.slug.trim().toLowerCase(),
      summary: draft.summary.trim(),
      content: draft.content.trim(),
    };
    if (!editingSlug) {
      trimmed.slug = trimmed.slug
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (!trimmed.title || !trimmed.slug || !trimmed.summary || !trimmed.content) {
      setFormError('Please fill in all fields before saving.');
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      if (editingSlug) {
        await updatePost({ ...trimmed, slug: editingSlug });
      } else {
        await createPost(trimmed);
      }
      setDraft(createEmptyDraft());
      setEditingSlug(null);
      setShowEditor(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save post';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post: any) => {
    setEditingSlug(post.slug);
    setDraft({ title: post.title, slug: post.slug, summary: post.summary, content: post.content });
    setShowEditor(true);
    setFormError(null);
  };

  const handleCancel = () => {
    setDraft(createEmptyDraft());
    setEditingSlug(null);
    setShowEditor(false);
    setFormError(null);
  };

  const renderEditor = isOwner && (showEditor || editingSlug !== null);
  const editorButtonLabel = editingSlug ? 'New Post' : renderEditor ? 'Close Editor' : 'Create Post';
  const postsLoading = posts === undefined;
  const postList = posts ?? [];

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="All Posts" icon={Code} bgColor="bg-yellow-200" rotate="rotate-1" />

        <div className="mb-6 flex flex-wrap items-center gap-3">
          {!signedIn ? (
            <button
              onClick={beginSignIn}
              className="bg-black text-white border-4 border-black px-4 py-2 -rotate-1 shadow-[6px_6px_0_rgba(0,0,0,1)] font-black"
            >
              Sign in with GitHub
            </button>
          ) : (
            <>
              {isOwner && (
                <button
                  onClick={() => {
                    if (editingSlug || !showEditor) {
                      setDraft(createEmptyDraft());
                      setEditingSlug(null);
                      setShowEditor(true);
                      setFormError(null);
                    } else {
                      handleCancel();
                    }
                  }}
                  className="bg-black text-white border-4 border-black px-4 py-2 -rotate-1 shadow-[6px_6px_0_rgba(0,0,0,1)] font-black"
                >
                  {editorButtonLabel}
                </button>
              )}
              <StatusBadge isOwner={isOwner} signedInName={viewerName} />
            </>
          )}
        </div>

        {(signedIn || authLoading) && (
          <ProfileSummary
            user={signedIn ? me ?? undefined : undefined}
            isOwner={isOwner}
            isLoading={authLoading}
            onSignOut={handleSignOut}
          />
        )}

        {renderEditor && (
          <PostEditor
            draft={draft}
            setDraft={setDraft}
            isEditing={Boolean(editingSlug)}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            saving={saving}
            error={formError}
          />
        )}

        {postsLoading ? (
          <LoadingPosts />
        ) : postList.length === 0 ? (
          <EmptyState
            onCreate={isOwner ? () => {
              setEditingSlug(null);
              setDraft(createEmptyDraft());
              setShowEditor(true);
              setFormError(null);
            } : undefined}
            signedIn={signedIn}
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {postList.map((post: any) => (
              <PostCard
                key={post.slug}
                post={post}
                isOwner={isOwner}
                canInteract={signedIn}
                onEdit={() => handleEdit(post)}
                onRequireAuth={beginSignIn}
              />
            ))}
          </div>
        )}

        <Link
          to="/"
          className="inline-block mt-8 bg-black text-white border-4 border-black px-4 py-2 -rotate-1 shadow-[6px_6px_0_rgba(0,0,0,1)] font-black"
        >
          Back
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ isOwner, signedInName }: { isOwner: boolean; signedInName: string }) {
  return (
    <span className={`inline-flex items-center gap-2 border-4 border-black px-3 py-1 rotate-1 font-black ${isOwner ? 'bg-green-300' : 'bg-blue-200'}`}>
      <User className="w-4 h-4" />
      {isOwner ? 'Owner' : signedInName ? 'Member' : 'Signed In'}
    </span>
  );
}

function ProfileSummary({ user, isOwner, isLoading, onSignOut }: { user: Viewer | undefined; isOwner: boolean; isLoading: boolean; onSignOut: () => void | Promise<void>; }) {
  if (isLoading) {
    return (
      <div className="mb-8 bg-white border-4 border-black p-4 rotate-1 shadow-[8px_8px_0_rgba(0,0,0,1)] flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="font-black text-sm">Checking your session...</span>
      </div>
    );
  }
  if (!user) return null;
  return (
    <div className="mb-8 bg-white border-4 border-black p-4 rotate-1 shadow-[8px_8px_0_rgba(0,0,0,1)]">
      <div className="flex flex-wrap items-center gap-4">
        {user.image ? (
          <img src={user.image} alt={user.displayName ?? user.name ?? 'Profile'} className="w-16 h-16 rounded-full border-4 border-black object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full border-4 border-black bg-yellow-200 flex items-center justify-center">
            <User className="w-7 h-7" />
          </div>
        )}
        <div className="flex-1 min-w-[200px]">
          <p className="font-black text-lg leading-tight">{user.displayName ?? user.name ?? 'Anonymous'}</p>
          {user.email && <p className="text-sm opacity-70">{user.email}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge isOwner={isOwner} signedInName={user.displayName ?? user.name ?? ''} />
            <button
              onClick={() => { void onSignOut(); }}
              className="inline-flex items-center gap-2 bg-black text-white border-4 border-black px-3 py-1 -rotate-1 shadow-[4px_4px_0_rgba(0,0,0,1)]"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type PostEditorProps = {
  draft: Draft;
  setDraft: (draft: Draft) => void;
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  saving: boolean;
  error: string | null;
};

function PostEditor({ draft, setDraft, isEditing, onCancel, onSubmit, saving, error }: PostEditorProps) {
  const handleChange = (key: keyof Draft) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft({ ...draft, [key]: e.target.value });
  };

  return (
    <div className="mb-8 bg-white border-4 border-black p-4 rotate-1 shadow-[8px_8px_0_rgba(0,0,0,1)]">
      <p className="font-black mb-2">{isEditing ? 'Edit Post' : 'New Post'}</p>
      {error && <p className="text-sm font-bold text-red-600 mb-2">{error}</p>}
      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="border-2 border-black p-2"
          placeholder="Title"
          value={draft.title}
          onChange={handleChange('title')}
        />
        <input
          className="border-2 border-black p-2"
          placeholder="Slug (lowercase, unique)"
          value={draft.slug}
          onChange={handleChange('slug')}
          disabled={isEditing}
        />
        <input
          className="border-2 border-black p-2 md:col-span-2"
          placeholder="Summary"
          value={draft.summary}
          onChange={handleChange('summary')}
        />
        <textarea
          className="border-2 border-black p-2 md:col-span-2"
          rows={6}
          placeholder="Content"
          value={draft.content}
          onChange={handleChange('content')}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={onSubmit}
          disabled={saving}
          className="bg-black text-white border-4 border-black px-4 py-2 -rotate-1 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Save Changes' : 'Create Post'}
        </button>
        <button
          onClick={onCancel}
          className="border-4 border-black px-4 py-2 rotate-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

type PostCardProps = {
  post: any;
  isOwner: boolean;
  canInteract: boolean;
  onEdit: () => void;
  onRequireAuth: () => void;
};

function PostCard({ post, isOwner, canInteract, onEdit, onRequireAuth }: PostCardProps) {
  const deletePost = useMutation((api as any).blog.remove);
  const toggleLike = useMutation((api as any).blog.toggleLike);
  const commentData = useQuery((api as any).blog.comments, { slug: post.slug }) || { comments: [], likes: 0 };
  const comments = commentData?.comments ?? [];
  const likes = commentData?.likes ?? 0;
  const [copySuccess, setCopySuccess] = useState<string>('');

  const handleDelete = async () => {
    if (typeof window !== 'undefined') {
      const proceed = window.confirm('Delete this post permanently?');
      if (!proceed) return;
    }
    await deletePost({ slug: post.slug });
  };

  const handleLike = async () => {
    if (!canInteract) {
      onRequireAuth();
      return;
    }
    await toggleLike({ slug: post.slug });
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/#/blog?post=${post.slug}` : post.slug;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: post.title, text: post.summary, url });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to share';
      setCopySuccess(message);
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  return (
    <article className="bg-white border-4 border-black p-6 rotate-1 shadow-[8px_8px_0_rgba(0,0,0,1)]">
      <h2 className="font-black text-2xl mb-2">{post.title}</h2>
      <p className="text-sm opacity-80 mb-3">{new Date(post.createdAt).toDateString()}</p>
      <p className="text-sm mb-3">{post.summary}</p>
      <details>
        <summary className="cursor-pointer font-black">Read</summary>
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </details>
      <div className="mt-3 flex flex-wrap gap-3 items-center">
        <button
          onClick={handleLike}
          className={`inline-flex items-center gap-1 border-2 border-black px-3 py-1 ${!canInteract ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <Heart className="w-4 h-4" /> <span>{likes}</span>
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1 border-2 border-black px-3 py-1"
        >
          <Share2 className="w-4 h-4" /> {copySuccess || 'Share'}
        </button>
        {isOwner && (
          <>
            <button onClick={onEdit} className="inline-flex items-center gap-1 border-2 border-black px-3 py-1"><Pencil className="w-4 h-4" /> Edit</button>
            <button onClick={handleDelete} className="inline-flex items-center gap-1 border-2 border-black px-3 py-1"><Trash2 className="w-4 h-4" /> Delete</button>
          </>
        )}
      </div>
      <div className="mt-4">
        <p className="font-black mb-1">Comments</p>
        <CommentBox slug={post.slug} comments={comments} canInteract={canInteract} onRequireAuth={onRequireAuth} />
      </div>
    </article>
  );
}

type CommentBoxProps = {
  slug: string;
  comments: any[];
  canInteract: boolean;
  onRequireAuth: () => void;
};

function CommentBox({ slug, comments, canInteract, onRequireAuth }: CommentBoxProps) {
  const addComment = useMutation((api as any).blog.addComment);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!canInteract) {
      onRequireAuth();
      return;
    }
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await addComment({ slug, text: text.trim() });
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="space-y-2 mb-2">
        {comments.length === 0 ? (
          <p className="text-sm opacity-70">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((c: any) => (
            <div key={c._id} className="border-2 border-black p-2">
              <p className="text-sm"><span className="font-black">{c.userName}</span>: {c.text}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          className="border-2 border-black p-2 flex-1 min-w-[180px]"
          placeholder={canInteract ? 'Write a comment' : 'Sign in to comment'}
          value={text}
          disabled={!canInteract || submitting}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={!canInteract || submitting}
          className="inline-flex items-center gap-1 border-2 border-black px-3 py-1"
        >
          <Send className="w-4 h-4" /> {submitting ? 'Posting...' : 'Post'}
        </button>
        {!canInteract && (
          <button
            onClick={onRequireAuth}
            className="inline-flex items-center gap-1 border-2 border-black px-3 py-1 bg-yellow-200"
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}

function LoadingPosts() {
  return (
    <div className="py-12 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <span className="font-black">Loading posts...</span>
    </div>
  );
}

function EmptyState({ onCreate, signedIn }: { onCreate?: () => void; signedIn: boolean; }) {
  return (
    <div className="py-12 text-center border-4 border-dashed border-black rotate-1 bg-white">
      <p className="font-black text-lg">No posts yet.</p>
      <p className="text-sm opacity-70 mt-2">{signedIn ? 'Create the first story for your readers.' : 'Sign in to start sharing your stories.'}</p>
      {onCreate && (
        <button
          onClick={onCreate}
          className="mt-4 bg-black text-white border-4 border-black px-4 py-2 -rotate-1 shadow-[6px_6px_0_rgba(0,0,0,1)] font-black"
        >
          Write a post
        </button>
      )}
    </div>
  );
}
