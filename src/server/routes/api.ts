import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import {
  buildGameResponse,
  getCurrentViewer,
  getOrCreateGameState,
  isDemoEnabled,
  restartGame,
  resolveGameDayForPost,
  runDemoAction,
  subscribeViewerToCommunity,
  submitVote,
} from '../core/game';
import type { DemoRequest } from '../../game/types';
import type {
  ErrorResponse,
  InitGameResponse,
  ResolveResponse,
  RestartResponse,
  SubscribeResponse,
  VoteResponse,
} from '../../shared/api';

export const api = new Hono();

const getPostId = (): string | null => context.postId ?? null;

api.get('/init', async (c) => {
  const postId = getPostId();
  if (!postId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const now = Date.now();
    const [viewer, state] = await Promise.all([
      getCurrentViewer(),
      getOrCreateGameState(postId, now),
    ]);
    return c.json<InitGameResponse>(await buildGameResponse(postId, viewer, state));
  } catch (error) {
    console.error(`Banhammer Bingo init failed for ${postId}`, error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'The mod queue jammed while loading the game.' },
      500
    );
  }
});

api.post('/vote', async (c) => {
  const postId = getPostId();
  if (!postId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'postId is required' }, 400);
  }

  const body = await c.req.json<{ choiceId?: string }>();
  if (!body.choiceId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'choiceId is required' }, 400);
  }

  try {
    const response = await submitVote({
      postId,
      viewer: await getCurrentViewer(),
      choiceId: body.choiceId,
      now: Date.now(),
    });
    return c.json<VoteResponse>(response);
  } catch (error) {
    console.error(`Banhammer Bingo vote failed for ${postId}`, error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'The vote fell into the mod queue. Try again.' },
      500
    );
  }
});

api.post('/demo', async (c) => {
  const postId = getPostId();
  if (!postId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'postId is required' }, 400);
  }
  if (!isDemoEnabled()) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Demo controls are disabled for this environment.' },
      403
    );
  }

  try {
    const body = await c.req.json<DemoRequest>();
    const response = await runDemoAction({
      postId,
      action: body.action,
      now: Date.now(),
    });

    if (response.type === 'restart_result') return c.json<RestartResponse>(response);
    return c.json<ResolveResponse>(response);
  } catch (error) {
    console.error(`Banhammer Bingo demo action failed for ${postId}`, error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Demo controls tripped over the queue.' },
      500
    );
  }
});

api.post('/subscribe', async (c) => {
  const postId = getPostId();
  if (!postId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'postId is required' }, 400);
  }

  try {
    const viewer = await getCurrentViewer();
    if (!viewer.userId) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Sign in to join this community from the game.' },
        401
      );
    }

    return c.json<SubscribeResponse>(
      await subscribeViewerToCommunity({
        postId,
        viewer,
        now: Date.now(),
      })
    );
  } catch (error) {
    console.error(`Banhammer Bingo subscribe failed for ${postId}`, error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Could not subscribe from the game post.' },
      500
    );
  }
});

api.post('/resolve-demo', async (c) => {
  const postId = getPostId();
  if (!postId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'postId is required' }, 400);
  }
  if (!isDemoEnabled()) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Demo controls are disabled for this environment.' },
      403
    );
  }

  const response = await resolveGameDayForPost({
    postId,
    now: Date.now(),
    allowEarly: true,
  });
  return c.json<ResolveResponse>(response);
});

api.post('/restart', async (c) => {
  const postId = getPostId();
  if (!postId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'postId is required' }, 400);
  }

  const state = await getOrCreateGameState(postId, Date.now());
  if (!state.currentEnding && !isDemoEnabled()) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Restart unlocks after the community reaches an ending.' },
      403
    );
  }

  return c.json<RestartResponse>(await restartGame(postId, Date.now()));
});
