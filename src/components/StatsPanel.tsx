import type { ResolvedDay, Stats } from '../game/types';
import { statAssets } from '../client/assetRegistry';
import { GameIcon } from './GameIcon';

type StatsPanelProps = {
  stats: Stats;
  latestDay: ResolvedDay | null;
};

const labels: Array<{
  key: keyof Stats;
  label: string;
  shortLabel: string;
  className: string;
}> = [
  { key: 'trust', label: 'Trust', shortLabel: 'Tr', className: 'stat--trust' },
  { key: 'drama', label: 'Drama', shortLabel: 'Dr', className: 'stat--drama' },
  { key: 'growth', label: 'Growth', shortLabel: 'Gr', className: 'stat--growth' },
  { key: 'quality', label: 'Quality', shortLabel: 'Qu', className: 'stat--quality' },
  { key: 'modStress', label: 'Mod Stress', shortLabel: 'St', className: 'stat--stress' },
  { key: 'reputation', label: 'Reputation', shortLabel: 'Rp', className: 'stat--reputation' },
];

export const StatsPanel = ({ stats, latestDay }: StatsPanelProps) => (
  <section className="stat-strip" aria-labelledby="stats-heading">
    <h2 id="stats-heading" className="sr-only">Community Stats</h2>
    <div className="stat-strip__grid">
      {labels.map((item) => {
        const change = latestDay?.effects[item.key] ?? null;
        return (
          <div
            className={`stat-chip ${item.className}`}
            key={item.key}
            title={`${item.label}: ${stats[item.key]}${change ? ` (${change > 0 ? '+' : ''}${change})` : ''}`}
          >
            <GameIcon src={statAssets[item.key]} className="stat-chip__icon" decorative />
            <span className="stat-chip__name" aria-hidden="true">{item.shortLabel}</span>
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