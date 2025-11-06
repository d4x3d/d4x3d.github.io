import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    isOwner: v.optional(v.boolean()),
    githubId: v.optional(v.string()),
    displayName: v.optional(v.string()),
    lastSeen: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_name", ["name"]),


  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    summary: v.string(),
    content: v.string(),
    authorName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]).index("by_created", ["createdAt"]),

  comments: defineTable({
    postId: v.id("posts"),
    userName: v.string(),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_post", ["postId"]).index("by_created", ["createdAt"]),

  likes: defineTable({
    postId: v.id("posts"),
    userName: v.string(),
    displayName: v.optional(v.string()),
  }).index("by_post_user", ["postId", "userName"]).index("by_post", ["postId"]),

  githubCache: defineTable({
    key: v.string(),
    data: v.any(),
    expiresAt: v.number(),
  }).index("by_key", ["key"]).index("by_expiry", ["expiresAt"]),
});
