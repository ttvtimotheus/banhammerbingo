import { wordmarkAsset } from './assetRegistry';
import { StickerBurst } from '../components/StickerBurst';
import { GameShell } from '../components/GameShell';
import { useGame } from './hooks/useGame';

export const GameApp = () => {
  const game = useGame();

  if (game.loading) {
    return (
      <main className="load-screen" aria-busy="true">
        <img className="load-screen__wordmark" src={wordmarkAsset} alt="Banhammer Bingo" />
        <p>Loading today&apos;s mess.</p>
      </main>
    );
  }

  if (game.error) {
    return (
      <main className="load-screen load-screen--error">
        <h1>The Queue Jammed</h1>
        <p>{game.error}</p>
        <button type="button" onClick={game.refresh}>Try Again</button>
      </main>
    );
  }

  if (!game.state || !game.event) {
    return (
      <main className="load-screen">
        <h1>No Incident Loaded</h1>
        <p>The fictional community has not started yet.</p>
        <button type="button" onClick={game.refresh}>Start Game</button>
      </main>
    );
  }

  return (
    <>
      <StickerBurst celebration={game.celebration} />
      <GameShell
        state={game.state}
        event={game.event}
        userVote={game.userVote}
        userRole={game.userRole}
        userProgress={game.userProgress}
        votePercentages={game.votePercentages}
        isDemoEnabled={game.isDemoEnabled}
        submitting={game.submitting}
        message={game.message}
        onVote={game.vote}
        onDemoAction={game.runDemoAction}
        onRestart={game.restart}
        onSubscribe={game.subscribe}
      />
    </>
  );
};