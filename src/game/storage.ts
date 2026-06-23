import { redis, scheduler } from '@devvit/web/server';
import type { GameState, UserRoleRecord } from './types';

const STATE_KEY_PREFIX = 'banhammer-bingo:state';
const USER_KEY_PREFIX = 'banhammer-bingo:user';
const SCHEDULER_KEY_PREFIX = 'banhammer-bingo:scheduler';

export const getGameStateKey = (postId: string): string => `${STATE_KEY_PREFIX}:${postId}`;
export const getUserRoleKey = (postId: string, userId: string): string =>
  `${USER_KEY_PREFIX}:${postId}:${userId}`;
export const getSchedulerKey = (postId: string): string => `${SCHEDULER_KEY_PREFIX}:${postId}`;

export const loadGameState = async (postId: string): Promise<GameState | null> => {
  const raw = await redis.get(getGameStateKey(postId));
  if (!raw) return null;
  const parsed: GameState = JSON.parse(raw);
  return parsed;
};

export const saveGameState = async (
  postId: string,
  state: GameState
): Promise<void> => {
  await redis.set(getGameStateKey(postId), JSON.stringify(state));
};

export const deleteGameState = async (postId: string): Promise<void> => {
  await redis.del(getGameStateKey(postId));
};

export const loadUserRoleRecord = async (
  postId: string,
  userId: string
): Promise<UserRoleRecord | null> => {
  const raw = await redis.get(getUserRoleKey(postId, userId));
  if (!raw) return null;
  const parsed: UserRoleRecord = JSON.parse(raw);
  return parsed;
};

export const saveUserRoleRecord = async (
  postId: string,
  record: UserRoleRecord
): Promise<void> => {
  await redis.set(getUserRoleKey(postId, record.userId), JSON.stringify(record));
};

export const saveScheduledResolutionJob = async (
  postId: string,
  jobId: string
): Promise<void> => {
  await redis.set(getSchedulerKey(postId), jobId);
};

export const scheduleResolution = async (
  postId: string,
  runAt: number
): Promise<void> => {
  const existingJobId = await redis.get(getSchedulerKey(postId));
  if (existingJobId) {
    try {
      await scheduler.cancelJob(existingJobId);
    } catch (error) {
      console.warn(`Could not cancel previous Banhammer Bingo job ${existingJobId}`, error);
    }
  }

  const jobId = await scheduler.runJob({
    name: 'daily-resolution',
    runAt: new Date(runAt),
    data: { postId },
  });
  await saveScheduledResolutionJob(postId, jobId);
};