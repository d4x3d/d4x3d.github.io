type GraphQLRequest = {
  query: string;
  variables?: Record<string, unknown>;
};

export async function ghGraphQL<T>(body: GraphQLRequest, token?: string): Promise<T> {
  if (!token) throw new Error('GitHub GraphQL requires a token');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error('GitHub GraphQL error');
  return json.data as T;
}

export type PinnedRepo = {
  id: string;
  name: string;
  description: string | null;
  stargazerCount: number;
  url: string;
  primaryLanguage: { name: string; color: string } | null;
};

export async function getPinned(username: string, token: string): Promise<PinnedRepo[]> {
  const data = await ghGraphQL<{ user: { pinnedItems: { nodes: PinnedRepo[] } } }>({
    query: `query($login:String!){ user(login:$login){ pinnedItems(first:6, types:[REPOSITORY]){ nodes{ ... on Repository { id name description stargazerCount url primaryLanguage { name color } } } } } }`,
    variables: { login: username },
  }, token);
  return data.user.pinnedItems.nodes || [];
}

export type ContributionDay = { date: string; contributionCount: number; color: string };

export async function getContributionCalendar(username: string, token: string): Promise<ContributionDay[]> {
  const data = await ghGraphQL<{ user: { contributionsCollection: { contributionCalendar: { weeks: { contributionDays: ContributionDay[] }[] } } } }>({
    query: `query($login:String!){ user(login:$login){ contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount color } } } } } }`,
    variables: { login: username },
  }, token);
  const weeks = data.user.contributionsCollection.contributionCalendar.weeks || [];
  return weeks.flatMap(w => w.contributionDays);
}
