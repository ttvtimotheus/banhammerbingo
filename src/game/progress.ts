import type {
  LeaderboardEntry,
  MilestoneId,
  RoleName,
  UserProgress,
} from './types';
import { ROLE_NAMES } from './types';

type MilestoneDefinition = {
  id: MilestoneId;
  label: string;
  points: number;
  achieved: (progress: UserProgress) => boolean;
};

export const MILESTONES: MilestoneDefinition[] = [
  {
    id: 'first_vote',
    label: 'First vote cast',
    points: 15,
    achieved: (progress) => progress.lastVoteDay !== null,
  },
  {
    id: 'streak_3',
    label: '3-day streak',
    points: 25,
    achieved: (progress) => progress.currentStreak >= 3,
  },
  {
    id: 'streak_7',
    label: '7-day streak',
    points: 60,
    achieved: (progress) => progress.currentStreak >= 7,
  },
  {
    id: 'streak_14',
    label: '14-day streak',
    points: 140,
    achieved: (progress) => progress.currentStreak >= 14,
  },
  {
    id: 'streak_30',
    label: '30-day streak',
    points: 300,
    achieved: (progress) => progress.currentStreak >= 30,
  },
  {
    id: 'points_100',
    label: '100 chaos points',
    points: 30,
    achieved: (progress) => progress.totalPoints >= 100,
  },
  {
    id: 'points_250',
    label: '250 chaos points',
    points: 75,
    achieved: (progress) => progress.totalPoints >= 250,
  },
  {
    id: 'points_500',
    label: '500 chaos points',
    points: 150,
    achieved: (progress) => progress.totalPoints >= 500,
  },
];

export const createInitialUserProgress = (): UserProgress => ({
  totalPoints: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastVoteDay: null,
  lastVoteAt: null,
  milestones: [],
  subscribedAt: null,
});

const getNewMilestones = (progress: UserProgress): MilestoneId[] =>
  MILESTONES.filter(
    (milestone) =>
      !progress.milestones.includes(milestone.id) && milestone.achieved(progress)
  ).map((milestone) => milestone.id);

const getMilestonePoints = (milestoneIds: MilestoneId[]): number =>
  milestoneIds.reduce((total, milestoneId) => {
    const milestone = MILESTONES.find((item) => item.id === milestoneId);
    return total + (milestone?.points ?? 0);
  }, 0);

export const applyVoteProgress = (
  current: UserProgress,
  day: number,
  votedAt: number
): { progress: UserProgress; pointsAwarded: number; newMilestones: MilestoneId[] } => {
  const isConsecutive = current.lastVoteDay === day - 1;
  const isSameDay = current.lastVoteDay === day;
  const currentStreak = isSameDay
    ? current.currentStreak
    : isConsecutive
      ? current.currentStreak + 1
      : 1;
  const basePoints = isSameDay ? 0 : 10;
  const streakBonus = isSameDay ? 0 : Math.min(currentStreak * 2, 20);
  const progressBeforeMilestones: UserProgress = {
    ...current,
    totalPoints: current.totalPoints + basePoints + streakBonus,
    currentStreak,
    bestStreak: Math.max(current.bestStreak, currentStreak),
    lastVoteDay: day,
    lastVoteAt: votedAt,
  };
  const newMilestones = getNewMilestones(progressBeforeMilestones);
  const milestonePoints = getMilestonePoints(newMilestones);
  const progress: UserProgress = {
    ...progressBeforeMilestones,
    totalPoints: progressBeforeMilestones.totalPoints + milestonePoints,
    milestones: [...progressBeforeMilestones.milestones, ...newMilestones],
  };

  return {
    progress,
    pointsAwarded: basePoints + streakBonus + milestonePoints,
    newMilestones,
  };
};

export const markSubscribed = (
  progress: UserProgress,
  subscribedAt: number
): UserProgress => ({
  ...progress,
  subscribedAt,
});

export const getVisibleMilestoneLabels = (progress: UserProgress): string[] =>
  progress.milestones
    .map((milestoneId) => MILESTONES.find((milestone) => milestone.id === milestoneId))
    .filter((milestone): milestone is MilestoneDefinition => Boolean(milestone))
    .map((milestone) => milestone.label);

export const updateLeaderboard = (
  leaderboard: LeaderboardEntry[],
  entry: LeaderboardEntry
): LeaderboardEntry[] => {
  const withoutCurrent = leaderboard.filter((item) => item.username !== entry.username);
  return [...withoutCurrent, entry]
    .sort((left, right) => {
      if (right.totalPoints !== left.totalPoints) return right.totalPoints - left.totalPoints;
      if (right.currentStreak !== left.currentStreak) return right.currentStreak - left.currentStreak;
      return right.bestStreak - left.bestStreak;
    })
    .slice(0, 10);
};

export const getTopRoleStandings = (
  roleCounts: Partial<Record<RoleName, number>>
): Array<{ role: RoleName; count: number }> =>
  ROLE_NAMES.map((role) => ({ role, count: roleCounts[role] ?? 0 }))
    .filter((entry) => entry.count > 0)
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);