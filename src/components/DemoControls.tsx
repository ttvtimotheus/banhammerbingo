import type { DemoAction, GameState } from '../game/types';

type DemoControlsProps = {
  enabled: boolean;
  state: GameState;
  submitting: boolean;
  onAction: (action: DemoAction) => void;
};

const actions: Array<{ action: DemoAction; label: string }> = [
  { action: 'resolve', label: 'Resolve Current Day' },
  { action: 'add_test_votes', label: 'Add Test Votes' },
  { action: 'force_high_drama', label: 'Force High Drama' },
  { action: 'force_low_trust', label: 'Force Low Trust' },
  { action: 'force_day_30', label: 'Force Day 30' },
  { action: 'reset_game', label: 'Reset Game' },
];

export const DemoControls = ({ enabled, state, submitting, onAction }: DemoControlsProps) => {
  if (!enabled) return null;

  return (
    <details className="mini-drawer demo-controls">
      <summary id="demo-heading">Developer panel</summary>
      <div className="demo-controls__buttons">
        {actions.map((item) => (
          <button
            key={item.action}
            type="button"
            onClick={() => onAction(item.action)}
            disabled={submitting}
          >
            {item.label}
          </button>
        ))}
      </div>
      <details>
        <summary>Current raw state</summary>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </details>
    </details>
  );
};