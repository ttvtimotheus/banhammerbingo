import type { TopArgument } from '../game/types';
import { chromeAssets } from '../client/assetRegistry';
import { GameIcon } from './GameIcon';

type ConsequencePanelProps = {
  previousConsequence: string | null;
  topArgument: TopArgument | null;
};

export const ConsequencePanel = ({
  previousConsequence,
  topArgument,
}: ConsequencePanelProps) => (
  previousConsequence ? (
    <details className="mini-drawer consequence-drawer" open>
      <summary id="consequence-heading">
        <GameIcon src={chromeAssets.reportTag} className="mini-drawer__summary-icon" decorative />
        <span>Yesterday&apos;s fallout</span>
      </summary>
      <div className="mini-drawer__body">
        <p>{previousConsequence}</p>
        <div className="argument-box">
          <span className="argument-box__label">
            <GameIcon src={chromeAssets.stampedSeal} className="argument-box__icon" decorative />
            <span>Top Argument</span>
          </span>
          {topArgument ? (
            <blockquote>
              <p>{topArgument.excerpt}</p>
              <footer>
                {topArgument.username} / {topArgument.scoreLabel}
              </footer>
            </blockquote>
          ) : (
            <p>No champion argument yet.</p>
          )}
        </div>
      </div>
    </details>
  ) : (
    <p className="micro-note" aria-label="No fallout yet">No fallout yet. Today decides the tone of tomorrow.</p>
  )
);