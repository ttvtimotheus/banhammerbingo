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
  <section className="panel stats-panel" aria-labelledby="stats-heading">
    <h2 id="stats-heading">Community Stats</h2>
    <div className="stats-grid">
      {labels.map((item) => {
        const change = latestDay?.effects[item.key] ?? null;
        return (
          <div className={`stat-row ${item.className}`} key={item.key}>
            <div className="stat-row__label">
              <span>{item.label}</span>
              <span>
                {stats[item.key]}
                {change ? ` (${change > 0 ? '+' : ''}${change})` : ''}
              </span>
            </div>
            <div className="stat-row__track" aria-hidden="true">
              <span style={{ width: `${stats[item.key]}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  </section>
);