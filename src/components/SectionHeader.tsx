import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  label: string;
  icon: LucideIcon;
  bgColor: string;
  rotate: string;
}

export default function SectionHeader({ label, icon: Icon, bgColor, rotate }: SectionHeaderProps) {
  return (
    <div className={`${bgColor} border-4 border-black p-4 md:p-6 ${rotate} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block mb-8 md:mb-12`}>
      <h2 className="text-3xl md:text-5xl font-black uppercase flex items-center gap-2 md:gap-3">
        <Icon className="w-8 md:w-10 h-8 md:h-10" strokeWidth={3} />
        {label}
      </h2>
    </div>
  );
}
