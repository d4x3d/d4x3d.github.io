import SectionHeader from '../components/SectionHeader';
import { Code, Heart, Send, Trash2, Pencil, User, Share2, LogOut, Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery, useMutation } from 'convex/react';
// @ts-ignore
import { api } from '../../convex/_generated/api';
import { useEffect, useRef, useState, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

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
  const posts = useQuery((api as any).blog.listWithData) as any[] | undefined;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]); // Only depend on me, not ensureProfile to prevent unnecessary re-runs

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
    <div className="p-4 md:p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="All Posts" icon={Code} bgColor="bg-cyan-300" rotate="" />

        <div className="mb-6 flex flex-wrap items-center gap-3">
          {!signedIn ? (
            <button
              onClick={beginSignIn}
              className="bg-blue-400 border-4 border-black px-6 py-2 shadow-[8px_8px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] transition-all font-black"
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
                  className="bg-lime-300 border-4 border-black px-6 py-2 shadow-[8px_8px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] transition-all font-black"
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
          className="inline-block mt-8 bg-black text-white border-4 border-black px-6 py-2 shadow-[8px_8px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] transition-all font-black"
        >
          Back
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ isOwner, signedInName }: { isOwner: boolean; signedInName: string }) {
  return (
    <span className={`inline-flex items-center gap-2 border-4 border-black px-3 py-1 font-black shadow-[4px_4px_0_rgba(0,0,0,1)] ${isOwner ? 'bg-lime-300' : 'bg-cyan-300'}`}>
      <User className="w-4 h-4" />
      {isOwner ? 'Owner' : signedInName ? 'Member' : 'Signed In'}
    </span>
  );
}

function ProfileSummary({ user, isOwner, isLoading, onSignOut }: { user: Viewer | undefined; isOwner: boolean; isLoading: boolean; onSignOut: () => void | Promise<void>; }) {
  if (isLoading) {
    return (
      <div className="mb-8 bg-yellow-200 border-4 border-black p-4 shadow-[8px_8px_0_rgba(0,0,0,1)] flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="font-black text-sm">Checking your session...</span>
      </div>
    );
  }
  if (!user) return null;
  return (
    <div className="mb-8 bg-orange-200 border-4 border-black p-4 shadow-[8px_8px_0_rgba(0,0,0,1)]">
      <div className="flex flex-wrap items-center gap-4">
        {user.image ? (
          <img src={user.image} alt={user.displayName ?? user.name ?? 'Profile'} className="w-16 h-16 rounded-full border-4 border-black object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full border-4 border-black bg-yellow-300 flex items-center justify-center">
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
              className="inline-flex items-center gap-2 bg-red-400 border-4 border-black px-3 py-1 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all"
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
  const [showPreview, setShowPreview] = useState(false);
  const handleChange = (key: keyof Draft) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft({ ...draft, [key]: e.target.value });
  };

  return (
    <div className="mb-8 bg-pink-200 border-4 border-black p-6 shadow-[10px_10px_0_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <p className="font-black text-xl">{isEditing ? 'Edit Post' : 'New Post'}</p>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-2 bg-cyan-400 border-3 border-black px-3 py-1 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all text-sm font-bold"
        >
          <Eye className="w-4 h-4" /> {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {error && <p className="text-sm font-bold text-red-600 mb-3 bg-red-50 border-2 border-red-300 p-2">{error}</p>}
      
      {!showPreview ? (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="border-3 border-black p-3 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium"
              placeholder="Title"
              value={draft.title}
              onChange={handleChange('title')}
            />
            <input
              className="border-3 border-black p-3 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium disabled:bg-gray-100"
              placeholder="Slug (lowercase, unique)"
              value={draft.slug}
              onChange={handleChange('slug')}
              disabled={isEditing}
            />
            <input
              className="border-3 border-black p-3 md:col-span-2 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium"
              placeholder="Summary"
              value={draft.summary}
              onChange={handleChange('summary')}
            />
            <div className="md:col-span-2">
              <textarea
                className="w-full border-3 border-black p-3 focus:outline-none focus:ring-4 focus:ring-purple-300 font-mono text-sm"
                rows={12}
                placeholder="Content (Markdown supported: **bold**, *italic*, `code`, ```language for code blocks)"
                value={draft.content}
                onChange={handleChange('content')}
              />
              <p className="text-xs text-gray-600 mt-1">💡 Tip: Use Markdown for formatting. Code blocks support syntax highlighting!</p>
            </div>
          </div>
        </>
      ) : (
        <div className="border-3 border-black p-4 bg-white min-h-[300px]">
          <h2 className="font-black text-2xl mb-2">{draft.title || 'Untitled'}</h2>
          <p className="text-sm opacity-70 mb-4">{draft.summary || 'No summary'}</p>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {draft.content || '*No content to preview*'}
            </ReactMarkdown>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={onSubmit}
          disabled={saving}
          className="bg-lime-300 border-4 border-black px-6 py-2 shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-black"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Save Changes' : 'Create Post'}
        </button>
        <button
          onClick={onCancel}
          className="bg-white border-4 border-black px-6 py-2 shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all font-black"
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
  // Use data from the optimized query instead of separate queries
  const comments = post.comments ?? [];
  const likes = post.likesCount ?? 0;
  const userLiked = post.userLiked ?? false;
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

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
    <article className="bg-yellow-200 border-4 border-black p-6 shadow-[8px_8px_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_rgba(0,0,0,1)] transition-all">
      <h2 className="font-black text-2xl mb-2">{post.title}</h2>
      <p className="text-sm opacity-80 mb-3 font-medium">{new Date(post.createdAt).toDateString()}</p>
      <p className="text-sm mb-4 text-gray-700">{post.summary}</p>
      <details open={isExpanded} onToggle={(e) => setIsExpanded((e.target as HTMLDetailsElement).open)}>
        <summary className="cursor-pointer font-black hover:opacity-70 transition-opacity select-none">
          {isExpanded ? '▼' : '▶'} Read More
        </summary>
        <div className="mt-3 prose prose-sm max-w-none prose-headings:font-black prose-a:text-blue-600 prose-code:text-pink-600 prose-pre:bg-gray-900 prose-pre:border-2 prose-pre:border-black">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </details>
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <button
          onClick={handleLike}
          className={`inline-flex items-center gap-2 border-4 border-black px-4 py-2 font-bold shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all ${
            userLiked 
              ? 'bg-pink-400' 
              : 'bg-white'
          } ${!canInteract ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <Heart className={`w-4 h-4 ${userLiked ? 'fill-current' : ''}`} /> 
          <span>{likes}</span>
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 border-4 border-black px-4 py-2 font-bold bg-cyan-300 hover:bg-cyan-400 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all"
        >
          <Share2 className="w-4 h-4" /> {copySuccess || 'Share'}
        </button>
        {isOwner && (
          <>
            <button 
              onClick={onEdit} 
              className="inline-flex items-center gap-2 border-4 border-black px-4 py-2 font-bold bg-orange-300 hover:bg-orange-400 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <button 
              onClick={handleDelete} 
              className="inline-flex items-center gap-2 border-4 border-black px-4 py-2 font-bold bg-red-300 hover:bg-red-400 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </>
        )}
      </div>
      <div className="mt-4">
        <p className="font-black mb-2">Comments</p>
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div>
      <div className="space-y-2 mb-3">
        {comments.length === 0 ? (
          <p className="text-sm opacity-70 italic">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((c: any) => (
            <div key={c._id} className="border-4 border-black p-3 bg-green-200 shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <p className="text-sm">
                <span className="font-black">{c.userName}</span>
                <span className="text-gray-700">: {c.text}</span>
              </p>
            </div>
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          className="border-4 border-black p-3 flex-1 min-w-[200px] focus:outline-none focus:ring-4 focus:ring-cyan-300 font-medium"
          placeholder={canInteract ? 'Write a comment...' : 'Sign in to comment'}
          value={text}
          disabled={!canInteract || submitting}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleSubmit}
          disabled={!canInteract || submitting}
          className="inline-flex items-center gap-2 border-4 border-black px-4 py-2 font-bold bg-lime-300 hover:bg-lime-400 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" /> {submitting ? 'Posting...' : 'Post'}
        </button>
        {!canInteract && (
          <button
            onClick={onRequireAuth}
            className="inline-flex items-center gap-2 border-4 border-black px-4 py-2 font-bold bg-yellow-300 hover:bg-yellow-400 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all"
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
    <div className="py-16 flex flex-col items-center justify-center bg-cyan-200 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)]">
      <Loader2 className="w-8 h-8 animate-spin mb-3" />
      <span className="font-black text-lg">Loading posts...</span>
    </div>
  );
}

function EmptyState({ onCreate, signedIn }: { onCreate?: () => void; signedIn: boolean; }) {
  return (
    <div className="py-16 text-center border-4 border-dashed border-black bg-pink-200 shadow-[8px_8px_0_rgba(0,0,0,1)]">
      <div className="mb-4 text-6xl">✍️</div>
      <p className="font-black text-2xl mb-2">No posts yet.</p>
      <p className="text-sm opacity-70 mt-2 max-w-md mx-auto">
        {signedIn ? 'Create the first story for your readers and share your thoughts with the world!' : 'Sign in to start sharing your stories and connect with others.'}
      </p>
      {onCreate && (
        <button
          onClick={onCreate}
          className="mt-6 bg-lime-300 border-4 border-black px-6 py-3 shadow-[8px_8px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] transition-all font-black text-lg"
        >
          ✨ Write a post
        </button>
      )}
    </div>
  );
}
