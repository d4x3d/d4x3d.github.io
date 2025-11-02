import { Code } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import TechStack from '../components/TechStack';

export default function TechStackSection() {
  return (
    <section className="max-w-7xl mx-auto mb-16 md:mb-20 animate-fade-in" style={{ animationDelay: '0.22s' }}>
      <SectionHeader label="Tech Stack" icon={Code} bgColor="bg-lime-200" rotate="rotate-1" />
      <TechStack />
      <div className="mt-8 grid md:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-white border-4 border-black p-6 rotate-1 shadow-[8px_8px_0_rgba(0,0,0,1)]">
          <p className="font-black mb-2">Frontend</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>UI/UX design, responsive design, accessibility</li>
            <li>React, Next.js, TypeScript</li>
            <li>Tailwind CSS, CSS‑in‑JS</li>
            <li>Motion, GSAP</li>
          </ul>
        </div>
        <div className="bg-white border-4 border-black p-6 -rotate-1 shadow-[-8px_8px_0_rgba(0,0,0,1)]">
          <p className="font-black mb-2">Backend</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Node.js, Express, FastAPI, Flask</li>
            <li>PostgreSQL, MongoDB, MySQL, Firebase</li>
            <li>Python, Go, SQL, TypeScript</li>
          </ul>
        </div>
        <div className="bg-white border-4 border-black p-6 rotate-2 shadow-[8px_-8px_0_rgba(0,0,0,1)]">
          <p className="font-black mb-2">Tools & Deployment</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Git, GitHub, GitLab, Cloudflare</li>
            <li>Docker, AWS, Azure, Vercel, Render</li>
            <li>Postman</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
