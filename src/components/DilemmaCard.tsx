import type { GameEvent, UserVoteRecord } from '../game/types';
import { arcAssets } from '../client/assetRegistry';
import { ChoiceButton } from './ChoiceButton';
import { GameIcon } from './GameIcon';

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
      <span className="dilemma-card__arc">
        <GameIcon src={arcAssets[event.arc]} className="dilemma-card__arc-icon" decorative />
        <span>{event.arc}</span>
      </span>
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
          voteCount={voteCounts[choice.id] ?? 0}
          votePercentage={votePercentages[choice.id] ?? 0}
          onVote={onVote}
        />
      ))}
    </div>
    <p className="comment-prompt">
      {userVote
        ? 'Now explain your vote in the comments. Tomorrow one argument gets the spotlight.'
        : 'Pick the least doomed option. The comment section can explain the damage.'}
    </p>
  </section>
);