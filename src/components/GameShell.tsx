import type { DemoAction, GameEvent, GameState, RoleName, UserVoteRecord } from '../game/types';
import { getCommunityTitle } from '../game/logic';
import { ConsequencePanel } from './ConsequencePanel';
import { DemoControls } from './DemoControls';
import { DilemmaCard } from './DilemmaCard';
import { EndingScreen } from './EndingScreen';
import { HowToPlay } from './HowToPlay';
import { StatsPanel } from './StatsPanel';
import { UserRoleBadge } from './UserRoleBadge';

type GameShellProps = {
  state: GameState;
  event: GameEvent;
  username: string;
  userVote: UserVoteRecord | null;
  userRole: RoleName | null;
  votePercentages: Record<string, number>;
  isDemoEnabled: boolean;
  submitting: boolean;
  message: string | null;
  onVote: (choiceId: string) => void;
  onDemoAction: (action: DemoAction) => void;
  onRestart: () => void;
};

export const GameShell = ({
  state,
  event,
  username,
  userVote,
  userRole,
  votePercentages,
  isDemoEnabled,
  submitting,
  message,
  onVote,
  onDemoAction,
  onRestart,
}: GameShellProps) => {
  const latestDay = state.resolvedDayHistory.at(-1) ?? null;
  const latestArgument = state.topArgumentHistory.at(-1) ?? null;

  return (
    <main id="maincontent" className="game-shell" tabIndex={-1}>
      <section className="hero-panel" aria-labelledby="game-title">
        <div className="hero-panel__copy">
          <span className="eyebrow">Day {state.currentDay} / {state.communityName}</span>
          <h1 id="game-title">Banhammer Bingo</h1>
          <p>A Community Chaos Sim</p>
          <span className="community-title">{getCommunityTitle(state.stats)}</span>
        </div>
        <div className="hero-panel__stamp" aria-label={`Signed in as ${username}`}>
          <span>Playing as</span>
          <strong>{username}</strong>
        </div>
      </section>

      {message ? <p className="status-message" role="status">{message}</p> : null}

      {state.currentEnding ? (
        <EndingScreen ending={state.currentEnding} onRestart={onRestart} submitting={submitting} />
      ) : (
        <div className="game-layout">
          <div className="game-layout__main">
            <DilemmaCard
              event={event}
              userVote={userVote}
              voteCounts={state.votesForCurrentDay}
              votePercentages={votePercentages}
              submitting={submitting}
              onVote={onVote}
            />
          </div>
          <aside className="game-layout__side" aria-label="Community status">
            <StatsPanel stats={state.stats} latestDay={latestDay} />
            <ConsequencePanel previousConsequence={state.previousConsequence} topArgument={latestArgument} />
            <UserRoleBadge role={userRole} />
            <HowToPlay />
          </aside>
        </div>
      )}

      <DemoControls
        enabled={isDemoEnabled}
        state={state}
        submitting={submitting}
        onAction={onDemoAction}
      />
    </main>
  );
};