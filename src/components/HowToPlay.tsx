import { chromeAssets } from '../client/assetRegistry';
import { GameIcon } from './GameIcon';

export const HowToPlay = () => (
  <details className="mini-drawer how-to-play">
    <summary id="how-heading">
      <GameIcon src={chromeAssets.stickyTape} className="mini-drawer__summary-icon" decorative />
      <span>How this works</span>
    </summary>
    <ol>
      <li>Vote on today&apos;s terrible moderation dilemma.</li>
      <li>Explain your vote in the Reddit comments.</li>
      <li>Return after resolution to see the winning choice, stats, role shifts, and fallout.</li>
    </ol>
  </details>
);