import SectionHeader from '../components/SectionHeader';
import { Cpu, Terminal, Activity } from 'lucide-react';
// @ts-ignore
import sys from '../data/systemInfo.json';

export default function SystemInfo() {
  return (
    <section className="max-w-7xl mx-auto mb-16 md:mb-20 animate-fade-in" style={{ animationDelay: '0.24s' }}>
      <SectionHeader label="System Info" icon={Cpu} bgColor="bg-yellow-200" rotate="-rotate-1" />
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-yellow-200 border-4 border-black p-6 rotate-1 shadow-[8px_8px_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-2"><Activity className="w-5 h-5" /><p className="font-black">Machine</p></div>
          <p className="text-sm"><span className="font-black">Name:</span> {sys.name}</p>
          <p className="text-sm"><span className="font-black">Device:</span> {sys.device?.vendor} {sys.device?.model}</p>
          <p className="text-sm"><span className="font-black">OS:</span> {sys.os}</p>
          <p className="text-sm"><span className="font-black">Kernel:</span> {sys.kernel}</p>
        </div>
        <div className="bg-cyan-200 border-4 border-black p-6 -rotate-1 shadow-[-8px_8px_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-2"><Cpu className="w-5 h-5" /><p className="font-black">Specs</p></div>
          <p className="text-sm"><span className="font-black">CPU:</span> {sys.cpu.model}</p>
          <p className="text-sm"><span className="font-black">Memory:</span> {sys.memory}</p>
          <p className="text-sm"><span className="font-black">Storage:</span> {sys.storage}</p>
        </div>
        <div className="bg-pink-200 border-4 border-black p-6 rotate-2 shadow-[8px_-8px_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-2"><Terminal className="w-5 h-5" /><p className="font-black">Tools</p></div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sys.tools).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1 bg-white border-2 border-black px-2 py-1 text-xs font-black rotate-1 shadow-[4px_4px_0_rgba(0,0,0,1)]">
                {k}: {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
