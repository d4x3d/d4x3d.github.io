import { Code } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import TechStack from '../components/TechStack';
import StackIcon, { type IconName } from 'tech-stack-icons';

type IconEntry = {
  name: IconName;
  label: string;
};

type StackGroup = {
  title: string;
  cardClass: string;
  icons: IconEntry[];
};

const STACK_GROUPS: StackGroup[] = [
  {
    title: 'Frontend',
    cardClass: 'bg-white border-4 border-black p-6 rotate-1 shadow-[8px_8px_0_rgba(0,0,0,1)]',
    icons: [
      { name: 'react', label: 'React' },
      { name: 'nextjs', label: 'Next.js' },
      { name: 'nextjs2', label: 'Next.js 2' },
      { name: 'typescript', label: 'TypeScript' },
      { name: 'tailwindcss', label: 'Tailwind CSS' },
      { name: 'threejs', label: 'Three.js' },
      { name: 'gsap', label: 'GSAP' },
      { name: 'framer', label: 'Framer Motion' },
      { name: 'figma', label: 'Figma' },
    ],
  },
  {
    title: 'Backend',
    cardClass: 'bg-white border-4 border-black p-6 -rotate-1 shadow-[-8px_8px_0_rgba(0,0,0,1)]',
    icons: [
      { name: 'nodejs', label: 'Node.js' },
      { name: 'expressjs', label: 'Express.js' },
      { name: 'python', label: 'Python' },
      { name: 'go', label: 'Go' },
      { name: 'postgresql', label: 'PostgreSQL' },
      { name: 'mongodb', label: 'MongoDB' },
      { name: 'mysql', label: 'MySQL' },
      { name: 'firebase', label: 'Firebase' },
    ],
  },
  {
    title: 'Tools & Deployment',
    cardClass: 'bg-white border-4 border-black p-6 rotate-2 shadow-[8px_-8px_0_rgba(0,0,0,1)]',
    icons: [
      { name: 'docker', label: 'Docker' },
      { name: 'aws', label: 'AWS' },
      { name: 'azure', label: 'Azure' },
      { name: 'vercel', label: 'Vercel' },
      { name: 'render', label: 'Render' },
      { name: 'cloudflare', label: 'Cloudflare' },
      { name: 'git', label: 'Git' },
      { name: 'github', label: 'GitHub' },
      { name: 'gitlab', label: 'GitLab' },
      { name: 'postman', label: 'Postman' },
    ],
  },
];

export default function TechStackSection() {
  return (
    <section className="max-w-7xl mx-auto mb-16 md:mb-20 animate-fade-in" style={{ animationDelay: '0.22s' }}>
      <SectionHeader label="Tech Stack" icon={Code} bgColor="bg-lime-200" rotate="rotate-1" />
      <TechStack />
      <div className="mt-8 grid md:grid-cols-3 gap-6 md:gap-8">
        {STACK_GROUPS.map((group) => (
          <div key={group.title} className={group.cardClass}>
            <p className="font-black mb-3">{group.title}</p>
            <div className="grid grid-cols-3 gap-3">
              {group.icons.map((icon) => (
                <div key={icon.name} className="flex flex-col items-center text-center">
                  <span className="grid place-items-center w-14 h-14 border-2 border-black bg-white">
                    <StackIcon name={icon.name} className="w-8 h-8" />
                  </span>
                  <span className="mt-2 text-[11px] font-black leading-tight">
                    {icon.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
