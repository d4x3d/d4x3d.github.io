export type Post = {
  slug: string;
  title: string;
  date: string; // ISO
  summary: string;
  content: string;
};

export const posts: Post[] = [
  {
    slug: 'welcome-to-my-blog',
    title: 'Welcome to my blog',
    date: new Date().toISOString(),
    summary: 'Kicking off a new space where I share notes on code, security, and creative dev.',
    content:
      'This is the start. I will be sharing writeups, build logs, and thoughts on modern web, security, and tools I enjoy. Stay tuned!'
  },
  {
    slug: 'shipping-fast-with-react-and-typescript',
    title: 'Shipping fast with React + TypeScript',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    summary: 'Some patterns I use to stay productive while keeping types tight.',
    content:
      'I cover component structure, hooks, services, and how to keep types ergonomic without slowing you down.'
  }
];
