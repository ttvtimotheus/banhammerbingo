import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GameShell } from '../components/GameShell';
import { useGame } from './hooks/useGame';

export const App = () => {
  const game = useGame();

  if (game.loading) {
    return (
      <main className="state-screen" aria-busy="true">
        <span className="loader-mark" aria-hidden="true" />
        <h1>Banhammer Bingo</h1>
        <p>The mod queue is arranging today&apos;s tiny catastrophe.</p>
      </main>
    );
  }

  if (game.error) {
    return (
      <main className="state-screen state-screen--error">
        <h1>The Queue Jammed</h1>
        <p>{game.error}</p>
        <button type="button" onClick={game.refresh}>Try Again</button>
      </main>
    );
  }

  if (!game.state || !game.event) {
    return (
      <main className="state-screen">
        <h1>No Incident Loaded</h1>
        <p>The fictional community has not started yet.</p>
        <button type="button" onClick={game.refresh}>Start Game</button>
      </main>
    );
  }

  return (
    <GameShell
      state={game.state}
      event={game.event}
      username={game.username}
      userVote={game.userVote}
      userRole={game.userRole}
      votePercentages={game.votePercentages}
      isDemoEnabled={game.isDemoEnabled}
      submitting={game.submitting}
      message={game.message}
      onVote={game.vote}
      onDemoAction={game.runDemoAction}
      onRestart={game.restart}
    />
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
