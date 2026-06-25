import { stickerAssets } from './assetRegistry';
import type {
  Choice,
  SubscribeResponse,
  UserProgress,
  VoteResponse,
} from '../game/types';

export type CelebrationKind = 'shield' | 'stamp' | 'vote' | 'warning';

export type Celebration = {
  src: string;
  label: string;
  kind: CelebrationKind;
};

const getSelectedChoice = (response: VoteResponse): Choice | null => {
  if (!response.userVote) return null;
  return response.event.choices.find(
    (choice) => choice.id === response.userVote?.choiceId
  ) ?? null;
};

const milestoneUnlocked = (
  before: UserProgress | null,
  after: UserProgress | null
): boolean =>
  (after?.milestones.length ?? 0) > (before?.milestones.length ?? 0);

export const getVoteCelebration = (
  response: VoteResponse,
  previousProgress: UserProgress | null
): Celebration | null => {
  if (!response.accepted) return null;

  if (milestoneUnlocked(previousProgress, response.userProgress)) {
    return {
      src: stickerAssets.stamp,
      label: 'Milestone unlocked',
      kind: 'stamp',
    };
  }

  const choice = getSelectedChoice(response);
  if (!choice) {
    return {
      src: stickerAssets.vote,
      label: 'Vote locked',
      kind: 'vote',
    };
  }

  if (
    choice.tags.some((tag) =>
      ['ban', 'remove', 'lock', 'restrict', 'quarantine'].includes(tag)
    ) ||
    response.userRole === 'Banhammer Enthusiast' ||
    response.userRole === 'Rule Lawyer'
  ) {
    return {
      src: stickerAssets.stamp,
      label: 'Moderation move',
      kind: 'stamp',
    };
  }

  if (
    (choice.effects.drama ?? 0) >= 10 ||
    (choice.effects.modStress ?? 0) >= 8 ||
    choice.tags.includes('chaos') ||
    response.userRole === 'Chaos Goblin' ||
    response.userRole === 'Drama Farmer'
  ) {
    return {
      src: stickerAssets.warning,
      label: 'Chaos unlocked',
      kind: 'warning',
    };
  }

  if (
    (choice.effects.trust ?? 0) > 0 &&
    (choice.effects.drama ?? 0) <= 0
  ) {
    return {
      src: stickerAssets.shield,
      label: 'Stable move',
      kind: 'shield',
    };
  }

  return {
    src: stickerAssets.vote,
    label: 'Vote locked',
    kind: 'vote',
  };
};

export const getSubscribeCelebration = (
  response: SubscribeResponse
): Celebration => ({
  src: stickerAssets.shield,
  label: response.message,
  kind: 'shield',
});