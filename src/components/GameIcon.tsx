type GameIconProps = {
  src: string;
  label?: string;
  className?: string;
  decorative?: boolean;
};

export const GameIcon = ({
  src,
  label,
  className,
  decorative = true,
}: GameIconProps) => (
  <img
    className={className}
    src={src}
    alt={decorative ? '' : (label ?? '')}
    aria-hidden={decorative}
    loading="eager"
    decoding="async"
  />
);