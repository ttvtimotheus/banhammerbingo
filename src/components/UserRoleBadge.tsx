import type { RoleName } from '../game/types';
import { getRoleDescription } from '../game/roles';

type UserRoleBadgeProps = {
  role: RoleName | null;
};

export const UserRoleBadge = ({ role }: UserRoleBadgeProps) => (
  <section className="role-badge" aria-label="Your role after voting">
    <span className="role-badge__eyebrow">Unlocked</span>
    <strong>{role ?? 'Undecided'}</strong>
    <span>{role ? getRoleDescription(role) : 'Vote to earn a community archetype.'}</span>
  </section>
);