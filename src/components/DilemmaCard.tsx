import type { GameEvent, UserVoteRecord } from '../game/types';
import { ChoiceButton } from './ChoiceButton';
import { VoteResults } from './VoteResults';

type DilemmaCardProps = {
  event: GameEvent;
  userVote: UserVoteRecord | null;
  voteCounts: Record<string, number>;
  votePercentages: Record<string, number>;
  submitting: boolean;
  onVote: (choiceId: string) => void;
};

export const DilemmaCard = ({
  event,
  userVote,
  voteCounts,
  votePercentages,
  submitting,
  onVote,
}: DilemmaCardProps) => (
  <section className={`dilemma-card ${userVote ? 'dilemma-card--voted' : ''}`} aria-labelledby="dilemma-title">
    <div className="dilemma-card__meta">
      <span>{event.arc}</span>
      <span className="heat-meter" aria-label={`Severity ${event.severity} of 5`}>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={index < event.severity ? 'heat-meter__dot heat-meter__dot--on' : 'heat-meter__dot'} />
        ))}
      </span>
    </div>
    <h2 id="dilemma-title">{event.title}</h2>
    <p>{event.text}</p>
    <div className="choice-grid" aria-label="Vote choices">
      {event.choices.map((choice) => (
        <ChoiceButton
          key={choice.id}
          choice={choice}
          disabled={submitting}
          userVote={userVote}
          revealEffects={Boolean(userVote)}
          onVote={onVote}
        />
      ))}
    </div>
    {userVote ? (
      <VoteResults
        event={event}
        voteCounts={voteCounts}
        votePercentages={votePercentages}
        selectedChoiceId={userVote.choiceId}
      />
    ) : (
      <p className="comment-prompt">Pick the least doomed option. The comment section can explain the damage.</p>
    )}
  </section>
);