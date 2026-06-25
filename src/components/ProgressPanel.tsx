import { getTopRoleStandings, getVisibleMilestoneLabels } from '../game/progress';
import { chromeAssets, roleAssets } from '../client/assetRegistry';
import type { GameState, UserProgress } from '../game/types';
import { GameIcon } from './GameIcon';

type ProgressPanelProps = {
  state: GameState;
  userProgress: UserProgress | null;
  submitting: boolean;
  onSubscribe: () => void;
};

export const ProgressPanel = ({
  state,
  userProgress,
  submitting,
  onSubscribe,
}: ProgressPanelProps) => {
  const milestones = userProgress ? getVisibleMilestoneLabels(userProgress) : [];
  const roleStandings = getTopRoleStandings(state.roleCounts);

  return (
    <details className="mini-drawer progress-panel">
      <summary id="progress-heading">
        <GameIcon src={chromeAssets.stickyTape} className="mini-drawer__summary-icon" decorative />
        <span>Streaks & leaderboard</span>
      </summary>
      <div className="mini-drawer__body progress-panel__body">
        <div className="progress-panel__header">
          <div>
            <span className="panel-kicker">Return Loop</span>
            <h2>Player Progress</h2>
          </div>
          <button
            type="button"
            className="secondary-action"
            onClick={onSubscribe}
            disabled={submitting || Boolean(userProgress?.subscribedAt)}
          >
            {userProgress?.subscribedAt ? 'Subscribed' : 'Join for Tomorrow'}
          </button>
        </div>

        <div className="progress-metrics" aria-label="Your progress metrics">
          <span><strong>{userProgress?.totalPoints ?? 0}</strong> chaos points</span>
          <span><strong>{userProgress?.currentStreak ?? 0}</strong> day streak</span>
          <span><strong>{userProgress?.bestStreak ?? 0}</strong> best streak</span>
        </div>

        <div className="mission-box">
          <span className="panel-kicker">Daily Mission</span>
          <p>Vote today, leave a reason in the comments, and return for the recap fallout.</p>
        </div>

        <div className="milestone-list">
          <span className="panel-kicker">Milestones</span>
          {milestones.length > 0 ? (
            <ul>
              {milestones.slice(-4).map((milestone) => (
                <li key={milestone}>{milestone}</li>
              ))}
            </ul>
          ) : (
            <p>First vote unlocks your first milestone.</p>
          )}
        </div>

        <div className="leaderboard-list">
          <span className="panel-kicker">Chaos Points Board</span>
          {state.leaderboard.length > 0 ? (
            <ol>
              {state.leaderboard.slice(0, 5).map((entry) => (
                <li key={entry.username}>
                  <span>{entry.username}</span>
                  <span>{entry.totalPoints} pts / {entry.currentStreak}d</span>
                </li>
              ))}
            </ol>
          ) : (
            <p>No scores yet. The board is freshly waxed and emotionally vulnerable.</p>
          )}
        </div>

        <div className="role-standings">
          <span className="panel-kicker">Role Momentum</span>
          {roleStandings.length > 0 ? (
            <ol>
              {roleStandings.map((entry) => (
                <li key={entry.role}>
                  <span className="role-standings__label">
                    <GameIcon src={roleAssets[entry.role]} className="role-standings__icon" decorative />
                    <span>{entry.role}</span>
                  </span>
                  <span>{entry.count}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p>Vote roles appear after the first decision lands.</p>
          )}
        </div>
      </div>
    </details>
  );
};