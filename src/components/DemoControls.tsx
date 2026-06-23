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
    <section className="panel demo-controls" aria-labelledby="demo-heading">
      <h2 id="demo-heading">Demo Controls</h2>
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
    </section>
  );
};