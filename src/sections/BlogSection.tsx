import SectionHeader from '../components/SectionHeader';
import { Code } from 'lucide-react';
import { posts } from '../data/posts';

export default function BlogSection() {
  const latest = posts.slice(0, 2);
  const goBlog = () => {
    location.hash = '#/blog';
  };
  return (
    <section className="max-w-7xl mx-auto mb-16 md:mb-20 animate-fade-in" style={{ animationDelay: '0.26s' }}>
      <SectionHeader label="Blog" icon={Code} bgColor="bg-purple-200" rotate="-rotate-1" />
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {latest.map((p) => (
          <article key={p.slug} className="bg-white border-4 border-black p-6 rotate-1 shadow-[8px_8px_0_rgba(0,0,0,1)]">
            <h3 className="font-black text-xl mb-2">{p.title}</h3>
            <p className="text-sm opacity-80 mb-3">{new Date(p.date).toDateString()}</p>
            <p className="text-sm">{p.summary}</p>
          </article>
        ))}
      </div>
      <button onClick={goBlog} className="mt-6 bg-black text-white border-4 border-black px-4 py-2 -rotate-1 shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0_rgba(0,0,0,1)] font-black">
        Go to Blog
      </button>
    </section>
  );
}
