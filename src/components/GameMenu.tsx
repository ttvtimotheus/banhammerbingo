import { useEffect, useRef } from 'react';
import type {
  DemoAction,
  GameState,
  UserProgress,
  UserVoteRecord,
} from '../game/types';
import { ConsequencePanel } from './ConsequencePanel';
import { DemoControls } from './DemoControls';
import { HowToPlay } from './HowToPlay';
import { ProgressPanel } from './ProgressPanel';

type GameMenuProps = {
  open: boolean;
  onClose: () => void;
  state: GameState;
  userVote: UserVoteRecord | null;
  userProgress: UserProgress | null;
  submitting: boolean;
  isDemoEnabled: boolean;
  onSubscribe: () => void;
  onDemoAction: (action: DemoAction) => void;
};

export const GameMenu = ({
  open,
  onClose,
  state,
  userVote,
  userProgress,
  submitting,
  isDemoEnabled,
  onSubscribe,
  onDemoAction,
}: GameMenuProps) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const topArgument = state.topArgumentHistory.at(-1) ?? null;

  return (
    <div className="game-menu" onClick={onClose}>
      <div
        className="game-menu__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-menu-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="game-menu__header">
          <h2 id="game-menu-title">Mod Desk</h2>
          <button ref={closeRef} type="button" className="game-menu__close" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="game-menu__body">
          <ConsequencePanel previousConsequence={state.previousConsequence} topArgument={topArgument} />
          {userVote ? (
            <ProgressPanel
              state={state}
              userProgress={userProgress}
              submitting={submitting}
              onSubscribe={onSubscribe}
            />
          ) : null}
          <HowToPlay />
          <DemoControls
            enabled={isDemoEnabled}
            state={state}
            submitting={submitting}
            onAction={onDemoAction}
          />
        </div>
      </div>
    </div>
  );
};
