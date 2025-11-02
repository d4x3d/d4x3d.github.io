import { useEffect, useState } from 'react';
import { GhUser, GhRepo, getUser, listRepos } from '../services/githubRest';
import { getPinned, getContributionCalendar, PinnedRepo, ContributionDay } from '../services/githubGraphql';

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;

export function useGithubProfile(username: string, pollMs = 600000) {
  const [data, setData] = useState<GhUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const fetchOnce = () => {
      setLoading(true);
      getUser(username, TOKEN)
        .then(d => alive && setData(d))
        .catch(e => alive && setError(String(e)))
        .finally(() => alive && setLoading(false));
    };
    fetchOnce();
    const t = pollMs ? setInterval(fetchOnce, pollMs) : null;
    return () => {
      alive = false;
      if (t) clearInterval(t);
    };
  }, [username, pollMs]);
  return { data, loading, error };
}

export function usePinnedRepos(username: string, pollMs = 600000) {
  const [data, setData] = useState<PinnedRepo[] | GhRepo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      try {
        if (TOKEN) {
          const pinned = await getPinned(username, TOKEN);
          if (alive) setData(pinned);
        } else {
          const repos = await listRepos(username, undefined, 6);
          if (alive) setData(repos);
        }
      } catch (e) {
        if (alive) setError(String(e));
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    const t = pollMs ? setInterval(run, pollMs) : null;
    return () => {
      alive = false;
      if (t) clearInterval(t);
    };
  }, [username, pollMs]);
  return { data, loading, error, usesGraphql: Boolean(TOKEN) };
}

export function useContributions(username: string, pollMs = 600000) {
  const [data, setData] = useState<ContributionDay[] | null>(null);
  const [loading, setLoading] = useState(Boolean(TOKEN));
  const [error, setError] = useState<string | null>(TOKEN ? null : 'No token for GraphQL; contributions unavailable');
  useEffect(() => {
    let alive = true;
    if (!TOKEN) return;
    const run = () => {
      setLoading(true);
      getContributionCalendar(username, TOKEN)
        .then(d => alive && setData(d))
        .catch(e => alive && setError(String(e)))
        .finally(() => alive && setLoading(false));
    };
    run();
    const t = pollMs ? setInterval(run, pollMs) : null;
    return () => {
      alive = false;
      if (t) clearInterval(t);
    };
  }, [username, pollMs]);
  return { data, loading, error, enabled: Boolean(TOKEN) };
}
