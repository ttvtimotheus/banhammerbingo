import type { EndingReport } from '../game/types';
import { StatsPanel } from './StatsPanel';

type EndingScreenProps = {
  ending: EndingReport;
  onRestart: () => void;
  submitting: boolean;
};

export const EndingScreen = ({ ending, onRestart, submitting }: EndingScreenProps) => (
  <section className="ending-screen" aria-labelledby="ending-title">
    <span className="ending-screen__eyebrow">Season complete</span>
    <h2 id="ending-title">{ending.title}</h2>
    <p>{ending.description}</p>
    <StatsPanel stats={ending.finalStats} latestDay={null} />
    <dl className="final-report">
      <div><dt>Biggest Decision</dt><dd>{ending.biggestDecision}</dd></div>
      <div><dt>Most Chaotic Day</dt><dd>{ending.mostChaoticDay}</dd></div>
      <div><dt>Top Community Role</dt><dd>{ending.topCommunityRole}</dd></div>
      <div><dt>Final Rating</dt><dd>{ending.finalCommunityRating}</dd></div>
    </dl>
    <label className="share-summary">
      Shareable summary
      <textarea readOnly value={ending.shareText} rows={3} />
    </label>
    <button className="primary-action" type="button" onClick={onRestart} disabled={submitting}>
      Restart Community
    </button>
  </section>
);