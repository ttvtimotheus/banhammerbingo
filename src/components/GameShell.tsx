import { useState } from 'react';
import type {
  DemoAction,
  GameEvent,
  GameState,
  RoleName,
  UserProgress,
  UserVoteRecord,
} from '../game/types';
import { getCommunityTitle } from '../game/logic';
import { wordmarkAsset } from '../client/assetRegistry';
import { DilemmaCard } from './DilemmaCard';
import { EndingScreen } from './EndingScreen';
import { GameMenu } from './GameMenu';
import { StatsPanel } from './StatsPanel';
import { UserRoleBadge } from './UserRoleBadge';

type GameShellProps = {
  state: GameState;
  event: GameEvent;
  userVote: UserVoteRecord | null;
  userRole: RoleName | null;
  userProgress: UserProgress | null;
  votePercentages: Record<string, number>;
  isDemoEnabled: boolean;
  submitting: boolean;
  message: string | null;
  onVote: (choiceId: string) => void;
  onDemoAction: (action: DemoAction) => void;
  onRestart: () => void;
  onSubscribe: () => void;
};

export const GameShell = ({
  state,
  event,
  userVote,
  userRole,
  userProgress,
  votePercentages,
  isDemoEnabled,
  submitting,
  message,
  onVote,
  onDemoAction,
  onRestart,
  onSubscribe,
}: GameShellProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const latestDay = state.resolvedDayHistory.at(-1) ?? null;
  const communityTitle = getCommunityTitle(state.stats);

  return (
    <>
    <a className="skip-link" href="#maincontent">Skip to daily dilemma</a>
    <main id="maincontent" className="game-shell game-shell--play" tabIndex={-1}>
      <header className="game-topbar" aria-labelledby="game-title">
        <div className="game-brand">
          <img className="game-brand__wordmark" src={wordmarkAsset} alt="Banhammer Bingo" />
          <h1 id="game-title" className="sr-only">Banhammer Bingo</h1>
        </div>
        <div className="game-topbar__actions">
          <span className="day-token">Day {state.currentDay}</span>
          <button
            type="button"
            className="menu-button"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span className="menu-button__bars" aria-hidden="true" />
            <span>Menu</span>
          </button>
        </div>
      </header>

      <section className="community-line" aria-label="Current community">
        <strong>{state.communityName}</strong>
        <span>{communityTitle}</span>
      </section>

      {message ? <p className="status-message" role="status">{message}</p> : null}

      {state.currentEnding ? (
        <EndingScreen ending={state.currentEnding} onRestart={onRestart} submitting={submitting} />
      ) : (
        <>
          <StatsPanel stats={state.stats} latestDay={latestDay} />

          <DilemmaCard
            event={event}
            userVote={userVote}
            voteCounts={state.votesForCurrentDay}
            votePercentages={votePercentages}
            submitting={submitting}
            onVote={onVote}
          />

          {userVote ? (
            <section className="vote-feedback" aria-label="Post vote feedback">
              <UserRoleBadge role={userRole} />
            </section>
          ) : null}
        </>
      )}
    </main>

    <GameMenu
      open={menuOpen}
      onClose={() => setMenuOpen(false)}
      state={state}
      userVote={userVote}
      userProgress={userProgress}
      submitting={submitting}
      isDemoEnabled={isDemoEnabled}
      onSubscribe={onSubscribe}
      onDemoAction={onDemoAction}
    />
    </>
  );
};