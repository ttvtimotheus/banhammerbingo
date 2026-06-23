import type { GameEvent } from '../game/types';

type VoteResultsProps = {
  event: GameEvent;
  voteCounts: Record<string, number>;
  votePercentages: Record<string, number>;
  selectedChoiceId: string;
};

export const VoteResults = ({
  event,
  voteCounts,
  votePercentages,
  selectedChoiceId,
}: VoteResultsProps) => (
  <section className="vote-results" aria-label="Vote results">
    {event.choices.map((choice) => {
      const count = voteCounts[choice.id] ?? 0;
      const percent = votePercentages[choice.id] ?? 0;
      return (
        <div className="vote-result" key={choice.id}>
          <span className="vote-result__label">
            {choice.id === selectedChoiceId ? 'Your vote: ' : ''}
            {choice.label}
          </span>
          <span className="vote-result__count">{count} votes / {percent}%</span>
          <span className="vote-result__bar" aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </span>
        </div>
      );
    })}
  </section>
);