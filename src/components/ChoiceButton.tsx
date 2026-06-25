import type { Choice, UserVoteRecord } from '../game/types';

type ChoiceButtonProps = {
  choice: Choice;
  disabled: boolean;
  userVote: UserVoteRecord | null;
  revealEffects: boolean;
  voteCount: number;
  votePercentage: number;
  onVote: (choiceId: string) => void;
};

const statLabels: Record<string, string> = {
  trust: 'Trust',
  drama: 'Drama',
  growth: 'Growth',
  quality: 'Quality',
  modStress: 'Stress',
  reputation: 'Rep',
};

const formatEffects = (choice: Choice): string =>
  Object.entries(choice.effects)
    .map(([key, value]) => `${statLabels[key] ?? key} ${value && value > 0 ? '+' : ''}${value}`)
    .join(' / ');

export const ChoiceButton = ({
  choice,
  disabled,
  userVote,
  revealEffects,
  voteCount,
  votePercentage,
  onVote,
}: ChoiceButtonProps) => {
  const selected = userVote?.choiceId === choice.id;
  const voteLabel = `${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}`;

  return (
    <button
      className={`choice-button ${selected ? 'choice-button--selected' : ''}`}
      type="button"
      onClick={() => onVote(choice.id)}
      disabled={disabled || Boolean(userVote)}
      aria-pressed={selected}
    >
      <span className="choice-button__topline">
        <span className="choice-button__label">{choice.label}</span>
        {selected ? <span className="choice-button__picked">Your vote</span> : null}
      </span>
      <span className="choice-button__description">{choice.description}</span>
      <span className="choice-button__footer">
        <span className="choice-button__role">{choice.roleAffinity}</span>
        {revealEffects ? (
          <span className="choice-button__result-chip">
            {voteLabel}
            {votePercentage > 0 ? ` · ${votePercentage}%` : ''}
          </span>
        ) : null}
      </span>
      {revealEffects ? (
        <span className="choice-button__effects" aria-hidden={!revealEffects}>{formatEffects(choice)}</span>
      ) : null}
    </button>
  );
};