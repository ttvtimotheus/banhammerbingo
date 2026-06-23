import { Hono } from 'hono';
import type { TaskRequest, TaskResponse } from '@devvit/web/server';
import { resolveGameDayForPost } from '../core/game';

type DailyResolutionData = {
  postId?: string;
};

export const schedulerRoutes = new Hono();

schedulerRoutes.post('/daily-resolution', async (c) => {
  const body = await c.req.json<TaskRequest<DailyResolutionData>>();
  const postId = body.data?.postId;

  if (!postId) {
    console.error('Banhammer Bingo scheduler fired without a postId');
    return c.json<TaskResponse>({}, 200);
  }

  try {
    await resolveGameDayForPost({ postId, now: Date.now(), allowEarly: false });
  } catch (error) {
    console.error(`Banhammer Bingo scheduled resolution failed for ${postId}`, error);
  }

  return c.json<TaskResponse>({}, 200);
});