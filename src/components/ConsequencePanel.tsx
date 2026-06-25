import type { TopArgument } from '../game/types';

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
      <summary id="consequence-heading">Yesterday&apos;s fallout</summary>
      <div className="mini-drawer__body">
        <p>{previousConsequence}</p>
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
  ) : (
    <p className="micro-note" aria-label="No fallout yet">No fallout yet. Today decides the tone of tomorrow.</p>
  )
);