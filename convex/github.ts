import { action } from "./_generated/server";
import { v } from "convex/values";

const rest = async (path: string, token?: string) => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub REST ${res.status}`);
  return res.json();
};

const getUsername = (u?: string | null) => u || process.env.GITHUB_USERNAME || "d4x3d";

// Note: Actions don't have db access in Convex, so we rely on client-side caching in localStorage

export const getProfile = action({
  args: { username: v.optional(v.string()) },
  handler: async (_ctx, { username }) => {
    const user = getUsername(username);
    const token = process.env.GITHUB_TOKEN;
    return await rest(`/users/${user}`, token);
  },
});

export const getPinned = action({
  args: { username: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (_ctx, { username, limit = 6 }) => {
    const user = getUsername(username);
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      // Fallback to recently updated repos
      const repos = await rest(`/users/${user}/repos?sort=updated&per_page=${limit}`);
      return (repos as any[]).map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        stargazerCount: r.stargazers_count,
        url: r.html_url,
        primaryLanguage: r.language ? { name: r.language, color: "#999" } : null,
      }));
    }
    const q = `query($login:String!,$n:Int!){ user(login:$login){ pinnedItems(first:$n, types:[REPOSITORY]){ nodes{ ... on Repository { id name description stargazerCount url primaryLanguage { name color } } } } } }`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: q, variables: { login: user, n: limit } }),
    });
    const json = await res.json();
    if (!res.ok || json.errors) throw new Error("GitHub GraphQL error");
    return json.data.user.pinnedItems.nodes;
  },
});

export const getContributions = action({
  args: { username: v.optional(v.string()) },
  handler: async (_ctx, { username }) => {
    const user = getUsername(username);
    const token = process.env.GITHUB_TOKEN;
    if (!token) return { enabled: false };
    const q = `query($login:String!){ user(login:$login){ contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount color } } } } } }`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: q, variables: { login: user } }),
    });
    const json = await res.json();
    if (!res.ok || json.errors) throw new Error("GitHub GraphQL error");
    const weeks = json.data.user.contributionsCollection.contributionCalendar.weeks || [];
    const days = weeks.flatMap((w: any) => w.contributionDays);
    return { enabled: true, days };
  },
});

export const getStatus = action({
  args: {},
  handler: async () => {
    return {
      username: getUsername(undefined),
      hasToken: Boolean(process.env.GITHUB_TOKEN),
    };
  },
});

export const selfTest = action({
  args: {},
  handler: async () => {
    const username = getUsername(undefined);
    const hasToken = Boolean(process.env.GITHUB_TOKEN);
    const out: any = { username, hasToken };
    try {
      const prof = await rest(`/users/${username}`, process.env.GITHUB_TOKEN);
      out.profile = { login: prof.login, ok: true };
    } catch (e: any) {
      out.profile = { ok: false, error: String(e) };
    }
    try {
      if (hasToken) {
        const q = `query($login:String!,$n:Int!){ user(login:$login){ pinnedItems(first:$n, types:[REPOSITORY]){ nodes{ ... on Repository { id name description stargazerCount url primaryLanguage { name color } } } } } }`;
        const res = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          },
          body: JSON.stringify({ query: q, variables: { login: username, n: 3 } }),
        });
        const json = await res.json();
        if (!res.ok || json.errors) throw new Error("GitHub GraphQL error");
        const nodes = json.data.user.pinnedItems.nodes;
        out.pinned = { ok: true, count: Array.isArray(nodes) ? nodes.length : 0 };
      } else {
        const repos = await rest(`/users/${username}/repos?sort=updated&per_page=3`);
        out.pinned = { ok: true, count: Array.isArray(repos) ? repos.length : 0, note: 'fallback: recent repos' };
      }
    } catch (e: any) {
      out.pinned = { ok: false, error: String(e) };
    }
    try {
      if (hasToken) {
        const q = `query($login:String!){ user(login:$login){ contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount color } } } } } }`;
        const res = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          },
          body: JSON.stringify({ query: q, variables: { login: username } }),
        });
        const json = await res.json();
        if (!res.ok || json.errors) throw new Error("GitHub GraphQL error");
        const weeks = json.data.user.contributionsCollection.contributionCalendar.weeks || [];
        const days = weeks.flatMap((w: any) => w.contributionDays);
        out.contributions = { ok: true, count: days.length };
      } else {
        out.contributions = { ok: false, note: 'no token' };
      }
    } catch (e: any) {
      out.contributions = { ok: false, error: String(e) };
    }
    return out;
  }
});
