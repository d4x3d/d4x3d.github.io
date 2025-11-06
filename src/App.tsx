import { Code, Coffee, Github, Mail, Linkedin } from 'lucide-react';
// Background removed per request
import SectionHeader from './components/SectionHeader';
import GithubShowcase from './sections/GithubShowcase';
import { useGithubProfile } from './hooks/useGithub';
import TechStackSection from './sections/TechStackSection';
import SystemInfo from './sections/SystemInfo';
import ClickSpark from './components/ClickSpark';
import BlogSection from './sections/BlogSection';
import BlogPage from './pages/BlogPage';
import { Routes, Route } from 'react-router-dom';
// import { useGithubStatus } from './hooks/useGithub';

function App() {
  // Removed projects and skills per request

  const GH_USERNAME = 'auto';
  const profile = useGithubProfile(GH_USERNAME, 600000);
  // const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  
  // Static fallback name to prevent layout shift - will be replaced by GitHub data instantly from cache
  const displayName = profile.data?.name || profile.data?.login || 'DAVID OLADAPO';

  return (
    <div className="relative min-h-screen bg-white text-black overflow-x-hidden">

      <div className="relative z-10 p-4 md:p-8">
        <ClickSpark sparkColor="#38bdf8" sparkCount={14} duration={700} sparkRadius={24} sparkSize={8} extraScale={1.2}>
        {null}
        <Routes>
          <Route path="/" element={<>
        <header className="mb-16 md:mb-20 pt-8 md:pt-12 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="inline-block bg-yellow-300 border-4 border-black px-4 py-5 md:px-6 md:py-7 rotate-1 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-6 md:mb-8 transform transition-transform hover:scale-105">
              <h1 className="text-[clamp(2rem,8vw,3.5rem)] leading-none font-black uppercase tracking-tight text-black">
                {displayName.toUpperCase()}
              </h1>
            </div>

          </div>
        </header>

        <section className="max-w-7xl mx-auto mb-16 md:mb-20 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <SectionHeader label="About Me" icon={Code} bgColor="bg-lime-200" rotate="rotate-1" />

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-orange-200 border-4 border-black p-6 md:p-8 -rotate-1 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-base md:text-lg font-bold leading-relaxed mb-2">
                I build web apps, squash bugs, and occasionally touch grass.
              </p>
              <div className="mt-4">
                <p className="font-black mb-2">What I Can Do</p>
                <ul className="list-disc pl-5 space-y-1 text-sm md:text-base font-bold">
                  <li>Build responsive and intuitive web applications with React / Next.js</li>
                  <li>Design and develop secure and scalable systems with Node.js / Python</li>
                  <li>Build and maintain databases with PostgreSQL / MongoDB / MySQL</li>
                  <li>Build clean, maintainable APIs with Express / FastAPI</li>
                  <li>Learn frameworks and tools fast</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-200 border-4 border-black p-6 md:p-8 rotate-2 shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-2">
                <Coffee className="w-6 md:w-8 h-6 md:h-8" strokeWidth={3} />
                <p className="text-base md:text-lg font-black">About David</p>
              </div>
              <p className="text-sm md:text-base font-bold mb-3">I'm a creative full stack developer with experience in modern web technologies.</p>
              <div>
                <p className="font-black mb-1">My Journey</p>
                <ul className="list-disc pl-5 space-y-1 text-sm md:text-base font-bold">
                  <li>Grew up in Ogun State, Nigeria</li>
                  <li>Started coding out of curiosity and a love for problem‑solving</li>
                  <li>Studied Computer Science at AAPOLY (2022–2024)</li>
                </ul>
              </div>
              <div className="mt-3">
                <p className="font-black mb-1">My Kind of Fun</p>
                <ul className="list-disc pl-5 space-y-1 text-sm md:text-base font-bold">
                  <li>Obsessing over the little UX details that make apps feel effortless</li>
                  <li>Comfortable refactoring a wicked backend service</li>
                  <li>Outside of coding: running, music, and movies</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <GithubShowcase username={GH_USERNAME} />
        <TechStackSection />
        <BlogSection />

        <SystemInfo />

        <section className="max-w-7xl mx-auto mb-16 md:mb-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <SectionHeader label="Contact" icon={Mail} bgColor="bg-red-300" rotate="-rotate-1" />

          <div className="flex flex-wrap gap-4 md:gap-6">
            <a
              href="https://github.com/d4x3d"
              target="_blank" rel="noopener noreferrer"
              className="bg-blue-400 border-4 border-black p-4 md:p-6 rotate-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 md:gap-3 transform text-sm md:text-base"
            >
              <Github className="w-6 md:w-8 h-6 md:h-8" strokeWidth={3} />
              <span className="font-black uppercase">GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/david-oladapo-soliu-b493a7336"
              target="_blank" rel="noopener noreferrer"
              className="bg-cyan-400 border-4 border-black p-4 md:p-6 -rotate-1 shadow-[-6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 md:gap-3 transform text-sm md:text-base"
            >
              <Linkedin className="w-6 md:w-8 h-6 md:h-8" strokeWidth={3} />
              <span className="font-black uppercase">LinkedIn</span>
            </a>

            <a
              href="https://mail.google.com/mail/u/0/?fs=1&to=oladapodavid22354@gmail.com&su=Hey+David!&tf=cm"
              target="_blank" rel="noopener noreferrer"
              className="bg-pink-400 border-4 border-black p-4 md:p-6 rotate-3 shadow-[6px_-6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_-4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 md:gap-3 transform text-sm md:text-base"
            >
              <Mail className="w-6 md:w-8 h-6 md:h-8" strokeWidth={3} />
              <span className="font-black uppercase">Email</span>
            </a>

            <a
              href="https://x.com/d4x3d"
              target="_blank" rel="noopener noreferrer"
              className="bg-black text-white border-4 border-black p-4 md:p-6 -rotate-2 shadow-[-6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 md:gap-3 transform text-sm md:text-base"
            >
              <span className="font-black uppercase">X / Twitter</span>
            </a>
          </div>
        </section>

          </>} />
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
        </ClickSpark>
      </div>
    </div>
  );
}

export default App;
// OwnerBadge removed per request
