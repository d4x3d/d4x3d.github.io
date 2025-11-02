import { Terminal } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  color: string;
  rotate: string;
  shadow: string;
}

export default function ProjectCard({ title, color, rotate, shadow }: ProjectCardProps) {
  return (
    <div
      className={`${color} border-4 border-black p-6 md:p-8 ${rotate} ${shadow} hover:translate-x-2 hover:translate-y-2 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group transform`}
    >
      <div className="bg-white border-3 border-black p-3 md:p-4 mb-4 group-hover:bg-black group-hover:text-white transition-colors">
        <Terminal className="w-8 md:w-10 h-8 md:h-10" strokeWidth={3} />
      </div>
      <h3 className="text-lg md:text-2xl font-black uppercase mb-2">{title}</h3>
      <p className="font-bold text-sm md:text-base">View project</p>
    </div>
  );
}
