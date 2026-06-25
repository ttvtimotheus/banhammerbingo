import type { RoleName } from '../game/types';
import { roleAssets } from '../client/assetRegistry';
import { getRoleDescription } from '../game/roles';
import { GameIcon } from './GameIcon';

type UserRoleBadgeProps = {
  role: RoleName | null;
};

export const UserRoleBadge = ({ role }: UserRoleBadgeProps) => (
  <section className="role-badge" aria-label="Your role after voting">
    <span className="role-badge__eyebrow">Unlocked</span>
    <div className="role-badge__row">
      {role ? <GameIcon src={roleAssets[role]} className="role-badge__icon" decorative /> : null}
      <strong>{role ?? 'Undecided'}</strong>
    </div>
    <span>{role ? getRoleDescription(role) : 'Vote to earn a community archetype.'}</span>
  </section>
);