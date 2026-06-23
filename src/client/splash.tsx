import './index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Splash = () => {
  return (
    <main className="splash-card">
      <div className="splash-card__mark" aria-hidden="true">B</div>
      <div>
        <span className="eyebrow">Daily community chaos</span>
        <h1>Banhammer Bingo</h1>
        <p>A Community Chaos Sim</p>
        <p className="splash-card__line">Vote through one terrible moderation dilemma. Return tomorrow for consequences.</p>
      </div>
      <button
        type="button"
        onClick={(event) => requestExpandedMode(event.nativeEvent, 'game')}
      >
        Open Today&apos;s Dilemma
      </button>
      <span className="splash-card__user">Playing as {context.username ?? 'anonymous'}</span>
    </main>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
