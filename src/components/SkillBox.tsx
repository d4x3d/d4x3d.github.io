import { LucideIcon } from 'lucide-react';

interface SkillBoxProps {
  name: string;
  icon: LucideIcon;
  color: string;
  rotate: string;
}

export default function SkillBox({ name, icon: Icon, color, rotate }: SkillBoxProps) {
  return (
    <div
      className={`${color} border-4 border-black p-4 md:p-6 ${rotate} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer transform`}
    >
      <Icon className="w-10 md:w-12 h-10 md:h-12 mb-3" strokeWidth={3} />
      <p className="text-lg md:text-xl font-black uppercase">{name}</p>
    </div>
  );
}
