import type { Choice, UserVoteRecord } from '../game/types';

type ChoiceButtonProps = {
  choice: Choice;
  disabled: boolean;
  userVote: UserVoteRecord | null;
  onVote: (choiceId: string) => void;
};

const formatEffects = (choice: Choice): string =>
  Object.entries(choice.effects)
    .map(([key, value]) => `${key.replace('modStress', 'mod stress')} ${value && value > 0 ? '+' : ''}${value}`)
    .join(' / ');

export const ChoiceButton = ({
  choice,
  disabled,
  userVote,
  onVote,
}: ChoiceButtonProps) => {
  const selected = userVote?.choiceId === choice.id;

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
        <span className="choice-button__role">{choice.roleAffinity}</span>
      </span>
      <span className="choice-button__description">{choice.description}</span>
      <span className="choice-button__effects">{formatEffects(choice)}</span>
    </button>
  );
};