import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const getViewer = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  if (!user) return null;
  return { user, userId };
};

const requireViewer = async (ctx: any) => {
  const viewer = await getViewer(ctx);
  if (!viewer) throw new Error("Not signed in");
  return viewer;
};

const requireOwner = async (ctx: any) => {
  const viewer = await requireViewer(ctx);
  if (!viewer.user.isOwner) throw new Error("Forbidden");
  return viewer;
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .collect();
    return posts;
  },
});

export const create = mutation({
  args: { title: v.string(), slug: v.string(), summary: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const { user } = await requireOwner(ctx);
    const now = Date.now();
    const id = await ctx.db.insert("posts", {
      title: args.title,
      slug: args.slug,
      summary: args.summary,
      content: args.content,
      authorName: user.displayName ?? user.name ?? "",
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const update = mutation({
  args: { slug: v.string(), title: v.string(), summary: v.string(), content: v.string() },
  handler: async (ctx, { slug, title, summary, content }) => {
    await requireOwner(ctx);
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!post) throw new Error("Not found");
    await ctx.db.patch(post._id, { title, summary, content, updatedAt: Date.now() });
    return true;
  },
});

export const remove = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    await requireOwner(ctx);
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!post) throw new Error("Not found");
    await ctx.db.delete(post._id);
    return true;
  },
});

export const comments = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!post) throw new Error("Not found");
    const items = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .order("desc")
      .collect();
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect();
    return { comments: items, likes: likes.length };
  },
});

export const addComment = mutation({
  args: { slug: v.string(), text: v.string() },
  handler: async (ctx, { slug, text }) => {
    const { user } = await requireViewer(ctx);
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!post) throw new Error("Not found");
    await ctx.db.insert("comments", {
      postId: post._id,
      userName: user.displayName ?? user.name ?? user.email ?? "anon",
      text,
      createdAt: Date.now(),
    });
    return true;
  },
});

export const toggleLike = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const { user } = await requireViewer(ctx);
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!post) throw new Error("Not found");
    const displayName = user.displayName ?? user.name ?? user.email ?? "";
    const userKey = (user.githubId as string | undefined) ?? String(user._id);
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_post_user", (q) => q.eq("postId", post._id).eq("userName", userKey))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    } else {
      await ctx.db.insert("likes", {
        postId: post._id,
        userName: userKey,
        displayName,
      });
      return { liked: true };
    }
  },
});
