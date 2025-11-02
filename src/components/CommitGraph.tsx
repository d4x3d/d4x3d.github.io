import type { ContributionDay } from '../services/githubGraphql';

type Props = { days: ContributionDay[] };

export default function CommitGraph({ days }: Props) {
  if (!days?.length) return null;
  const byWeek: ContributionDay[][] = [];
  for (let i = 0; i < days.length; i += 7) byWeek.push(days.slice(i, i + 7));
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {byWeek.map((week, wi) => (
          <div className="flex flex-col gap-1" key={wi}>
            {week.map(d => (
              <div
                key={d.date}
                className="w-3 h-3 md:w-4 md:h-4 border border-black/20"
                style={{ backgroundColor: d.color }}
                title={`${d.date}: ${d.contributionCount} contributions`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
