import type { TopArgument } from '../game/types';

type ConsequencePanelProps = {
  previousConsequence: string | null;
  topArgument: TopArgument | null;
};

export const ConsequencePanel = ({
  previousConsequence,
  topArgument,
}: ConsequencePanelProps) => (
  <details className="mini-drawer consequence-drawer">
    <summary id="consequence-heading">Yesterday&apos;s fallout</summary>
    <div className="mini-drawer__body">
      <p>{previousConsequence ?? 'No fallout yet. First vote, then consequence.'}</p>
      <div className="argument-box">
        <span className="argument-box__label">Top Argument</span>
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
);