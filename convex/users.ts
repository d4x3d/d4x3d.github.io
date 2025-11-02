import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type UserDoc = Doc<"users">;

const sanitizeUser = (user: UserDoc) => ({
  _id: user._id,
  name: user.displayName ?? user.name ?? null,
  displayName: user.displayName ?? null,
  email: user.email ?? null,
  image: user.image ?? null,
  isOwner: Boolean(user.isOwner),
  githubId: user.githubId ?? null,
  lastSeen: user.lastSeen ?? null,
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return sanitizeUser(user);
  },
});

export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    const existing = await ctx.db.get(userId);
    if (!existing) throw new Error("User profile missing");

    const now = Date.now();
    const nextPatch: Partial<UserDoc> = { lastSeen: now };
    const identity = await ctx.auth.getUserIdentity();

    if (identity?.name && !existing.name) nextPatch.name = identity.name;
    if (identity?.email && !existing.email) nextPatch.email = identity.email;
    if (!existing.githubId) {
      const candidate = identity?.subject ?? identity?.tokenIdentifier ?? null;
      if (candidate) nextPatch.githubId = candidate;
    }

    if (existing.isOwner === undefined) {
      const all = await ctx.db.query("users").collect();
      const hasOwner = all.some((u) => u.isOwner);
      nextPatch.isOwner = hasOwner ? false : true;
    }

    if (existing.displayName === undefined && existing.name) {
      nextPatch.displayName = existing.name;
    }

    const patchKeys = Object.keys(nextPatch);
    if (patchKeys.length > 0) {
      await ctx.db.patch(userId, nextPatch);
    }

    const refreshed = await ctx.db.get(userId);
    return refreshed ? sanitizeUser(refreshed) : null;
  },
});

export const setOwner = mutation({
  args: { userId: v.id("users"), isOwner: v.boolean() },
  handler: async (ctx, { userId, isOwner }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not signed in");
    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser?.isOwner) throw new Error("Forbidden");

    if (!isOwner && currentUserId === userId) {
      const others = await ctx.db.query("users").collect();
      const hasOtherOwner = others.some((u) => u._id !== userId && u.isOwner);
      if (!hasOtherOwner) {
        throw new Error("At least one owner required");
      }
    }

    await ctx.db.patch(userId, { isOwner });
    const updated = await ctx.db.get(userId);
    return updated ? sanitizeUser(updated) : null;
  },
});
