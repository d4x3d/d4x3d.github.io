export async function ghGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub REST error: ${res.status}`);
  return res.json() as Promise<T>;
}

export type GhUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
  location?: string | null;
  blog?: string | null;
};

export type GhRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  language: string | null;
};

export async function getUser(username: string, token?: string) {
  return ghGet<GhUser>(`/users/${username}`, token);
}

export async function listRepos(username: string, token?: string, per_page = 6) {
  return ghGet<GhRepo[]>(`/users/${username}/repos?sort=updated&per_page=${per_page}`, token);
}
