import type {
  EndingDefinition,
  EndingReport,
  GameState,
  ResolvedDay,
  RoleName,
  Stats,
} from './types';
import { ROLE_NAMES } from './types';

export const ENDINGS: EndingDefinition[] = [
  {
    id: 'community_revolt',
    title: 'The Community Revolt',
    description:
      'The users overthrow the mod team and declare a new age of suspicious freedom.',
  },
  {
    id: 'eternal_flame_war',
    title: 'The Eternal Flame War',
    description: 'Every thread becomes the same argument forever.',
  },
  {
    id: 'burnout_logout',
    title: 'Burnout Logout',
    description:
      'The mods vanish, the queue grows teeth, and nobody knows who is in charge.',
  },
  {
    id: 'healthy_community',
    title: 'Healthy Community',
    description:
      'Somehow, against all laws of the internet, the community becomes good.',
  },
  {
    id: 'content_farm',
    title: 'Content Farm',
    description:
      'The community becomes enormous, profitable, and completely unreadable.',
  },
  {
    id: 'platform_legend',
    title: 'Platform Legend',
    description:
      'The community becomes a legend whispered about in onboarding documents.',
  },
  {
    id: 'ghost_town',
    title: 'Ghost Town',
    description:
      'The last active user posts "anyone here?" and receives one bot reply.',
  },
  {
    id: 'day_30_final_report',
    title: 'Day 30 Final Report',
    description:
      'The season ends and the community receives its final judgment.',
  },
];

export const getEndingById = (id: string): EndingDefinition | null =>
  ENDINGS.find((ending) => ending.id === id) ?? null;

export const checkEnding = (
  stats: Stats,
  resolvedDay: number
): EndingDefinition | null => {
  if (stats.trust <= 0) return getEndingById('community_revolt');
  if (stats.drama >= 100) return getEndingById('eternal_flame_war');
  if (stats.modStress >= 100) return getEndingById('burnout_logout');
  if (stats.growth >= 100 && stats.quality >= 70 && stats.drama < 50) {
    return getEndingById('healthy_community');
  }
  if (stats.growth >= 100 && stats.quality < 40) return getEndingById('content_farm');
  if (stats.reputation >= 100) return getEndingById('platform_legend');
  if (stats.growth <= 0) return getEndingById('ghost_town');
  if (resolvedDay >= 30) return getEndingById('day_30_final_report');
  return null;
};

const getBiggestDecision = (history: ResolvedDay[]): string => {
  if (history.length === 0) return 'No decision survived long enough to matter.';

  let biggest: ResolvedDay | null = null;
  for (const day of history) {
    if (!biggest || day.totalVotes > biggest.totalVotes) biggest = day;
  }

  if (!biggest) return 'No decision survived long enough to matter.';

  return `Day ${biggest.day}: ${biggest.winningChoiceLabel} (${biggest.totalVotes} votes)`;
};

const getMostChaoticDay = (history: ResolvedDay[]): string => {
  if (history.length === 0) return 'No chaos recorded. Suspicious.';

  let mostChaotic: ResolvedDay | null = null;
  let highestDrama = -Infinity;
  for (const day of history) {
    const drama = day.effects.drama ?? 0;
    if (!mostChaotic || drama > highestDrama) {
      mostChaotic = day;
      highestDrama = drama;
    }
  }

  if (!mostChaotic) return 'No chaos recorded. Suspicious.';

  return `Day ${mostChaotic.day}: ${mostChaotic.eventTitle}`;
};

const getTopCommunityRole = (
  roleCounts: Partial<Record<RoleName, number>>
): RoleName | 'Undecided' => {
  let topRole: RoleName | 'Undecided' = 'Undecided';
  let topCount = 0;

  for (const role of ROLE_NAMES) {
    const count = roleCounts[role];
    if (count !== undefined && count > topCount) {
      topRole = role;
      topCount = count;
    }
  }

  return topRole;
};

const getFinalCommunityRating = (stats: Stats): string => {
  const health =
    stats.trust + stats.quality + stats.reputation + stats.growth - stats.drama - stats.modStress;

  if (health >= 190) return 'Miraculously Functional';
  if (health >= 120) return 'Mostly Not On Fire';
  if (health >= 50) return 'Volatile but Beloved';
  if (health >= 0) return 'Technically Still a Forum';
  return 'A Case Study With Comments Disabled';
};

export const buildEndingReport = (
  ending: EndingDefinition,
  state: GameState,
  endedAt: number
): EndingReport => {
  const topCommunityRole = getTopCommunityRole(state.roleCounts);
  const finalCommunityRating = getFinalCommunityRating(state.stats);

  return {
    ...ending,
    finalStats: state.stats,
    biggestDecision: getBiggestDecision(state.resolvedDayHistory),
    mostChaoticDay: getMostChaoticDay(state.resolvedDayHistory),
    topCommunityRole,
    finalCommunityRating,
    shareText: `${state.communityName} reached "${ending.title}" on day ${state.currentDay}. Final rating: ${finalCommunityRating}.`,
    endedAt,
  };
};