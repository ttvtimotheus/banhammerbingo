import type { Celebration } from '../client/celebrationLogic';

type StickerBurstProps = {
  celebration: Celebration | null;
};

export const StickerBurst = ({ celebration }: StickerBurstProps) => {
  if (!celebration) return null;

  return (
    <div className={`sticker-burst sticker-burst--${celebration.kind}`} aria-live="polite">
      <img
        className="sticker-burst__image"
        src={celebration.src}
        alt={celebration.label}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};