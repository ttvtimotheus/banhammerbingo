import type { ResolvedDay, Stats } from '../game/types';

type StatsPanelProps = {
  stats: Stats;
  latestDay: ResolvedDay | null;
};

const labels: Array<{ key: keyof Stats; label: string; className: string }> = [
  { key: 'trust', label: 'Trust', className: 'stat--trust' },
  { key: 'drama', label: 'Drama', className: 'stat--drama' },
  { key: 'growth', label: 'Growth', className: 'stat--growth' },
  { key: 'quality', label: 'Quality', className: 'stat--quality' },
  { key: 'modStress', label: 'Mod Stress', className: 'stat--stress' },
  { key: 'reputation', label: 'Reputation', className: 'stat--reputation' },
];

export const StatsPanel = ({ stats, latestDay }: StatsPanelProps) => (
  <section className="stat-strip" aria-labelledby="stats-heading">
    <h2 id="stats-heading" className="sr-only">Community Stats</h2>
    <div className="stat-strip__grid">
      {labels.map((item) => {
        const change = latestDay?.effects[item.key] ?? null;
        return (
          <div className={`stat-chip ${item.className}`} key={item.key}>
            <span className="stat-chip__dot" aria-hidden="true" />
            <span className="stat-chip__name">{item.label === 'Mod Stress' ? 'Stress' : item.label === 'Reputation' ? 'Rep' : item.label}</span>
            <span className="stat-chip__value">
              {stats[item.key]}
              {change ? ` ${change > 0 ? '+' : ''}${change}` : ''}
            </span>
          </div>
        );
      })}
    </div>
  </section>
);