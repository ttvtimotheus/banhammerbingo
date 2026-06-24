import type {
  DemoAction,
  GameEvent,
  GameState,
  RoleName,
  UserProgress,
  UserVoteRecord,
} from '../game/types';
import { getCommunityTitle } from '../game/logic';
import { ConsequencePanel } from './ConsequencePanel';
import { DemoControls } from './DemoControls';
import { DilemmaCard } from './DilemmaCard';
import { EndingScreen } from './EndingScreen';
import { HowToPlay } from './HowToPlay';
import { ProgressPanel } from './ProgressPanel';
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
  const latestDay = state.resolvedDayHistory.at(-1) ?? null;
  const latestArgument = state.topArgumentHistory.at(-1) ?? null;
  const communityTitle = getCommunityTitle(state.stats);

  return (
    <>
    <a className="skip-link" href="#maincontent">Skip to daily dilemma</a>
    <main id="maincontent" className="game-shell game-shell--play" tabIndex={-1}>
      <header className="game-topbar" aria-labelledby="game-title">
        <div className="game-brand">
          <span className="game-brand__mark" aria-hidden="true">B</span>
          <h1 id="game-title">Banhammer Bingo</h1>
        </div>
        <span className="day-token">Day {state.currentDay}</span>
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

          <div className="quiet-stack" aria-label="Secondary game information">
            <ConsequencePanel previousConsequence={state.previousConsequence} topArgument={latestArgument} />
            {userVote ? <UserRoleBadge role={userRole} /> : null}
            {userVote ? (
              <ProgressPanel
                state={state}
                userProgress={userProgress}
                submitting={submitting}
                onSubscribe={onSubscribe}
              />
            ) : null}
            <HowToPlay />
          </div>
        </>
      )}

      <DemoControls
        enabled={isDemoEnabled}
        state={state}
        submitting={submitting}
        onAction={onDemoAction}
      />
    </main>
    </>
  );
};