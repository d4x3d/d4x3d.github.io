import SectionHeader from '../components/SectionHeader';
import { Code } from 'lucide-react';
import { posts } from '../data/posts';

export default function BlogPage() {
  const goHome = () => {
    location.hash = '#/';
  };
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="All Posts" icon={Code} bgColor="bg-yellow-200" rotate="rotate-1" />
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {posts.map((p) => (
            <article key={p.slug} className="bg-white border-4 border-black p-6 rotate-1 shadow-[8px_8px_0_rgba(0,0,0,1)]">
              <h2 className="font-black text-2xl mb-2">{p.title}</h2>
              <p className="text-sm opacity-80 mb-3">{new Date(p.date).toDateString()}</p>
              <p className="text-sm mb-3">{p.summary}</p>
              <details>
                <summary className="cursor-pointer font-black">Read</summary>
                <p className="mt-2 text-sm leading-relaxed">{p.content}</p>
              </details>
            </article>
          ))}
        </div>
        <button onClick={goHome} className="mt-8 bg-black text-white border-4 border-black px-4 py-2 -rotate-1 shadow-[6px_6px_0_rgba(0,0,0,1)] font-black">Back</button>
      </div>
    </div>
  );
}
