import type { TopArgument } from '../game/types';

type ConsequencePanelProps = {
  previousConsequence: string | null;
  topArgument: TopArgument | null;
};

export const ConsequencePanel = ({
  previousConsequence,
  topArgument,
}: ConsequencePanelProps) => (
  <section className="panel consequence-panel" aria-labelledby="consequence-heading">
    <h2 id="consequence-heading">Yesterday in the Queue</h2>
    <p>{previousConsequence ?? 'No consequences yet. The first incident is still loading its tiny cannon.'}</p>
    <div className="argument-box">
      <span className="argument-box__label">Top Argument of the Day</span>
      {topArgument ? (
        <blockquote>
          <p>{topArgument.excerpt}</p>
          <footer>
            {topArgument.username} / {topArgument.scoreLabel}
          </footer>
        </blockquote>
      ) : (
        <p>No winning argument yet. Comments are where tomorrow gets its receipts.</p>
      )}
    </div>
  </section>
);