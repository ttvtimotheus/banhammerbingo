import { reddit } from '@devvit/web/server';
import { T3 } from '@devvit/shared-types/tid.js';
import { selectTopArgument } from '../../game/comments';
import {
  GAME_EVENTS,
  getEventById,
  getFirstEvent,
  pickCommunityName,
} from '../../game/events';
import {
  addVoteToState,
  applyStatEffects,
  createInitialGameState,
  createRestartedState,
  determineWinningChoice,
  getVotePercentages,
  resolveDay,
  selectNextEvent,
} from '../../game/logic';
import { createEmptyRoleScores, updateRoleRecord } from '../../game/roles';
import {
  loadGameState,
  loadUserRoleRecord,
  saveGameState,
  saveUserRoleRecord,
  scheduleResolution,
} from '../../game/storage';
import type {
  CommentCandidate,
  DemoAction,
  GameEvent,
  GameState,
  InitGameResponse,
  ResolveResponse,
  RestartResponse,
  UserRoleRecord,
  VoteResponse,
} from '../../game/types';

export type Viewer = {
  userId: string | null;
  username: string;
};

export const isDemoEnabled = (): boolean =>
  process.env.BANHAMMER_BINGO_DEMO === 'true' ||
  process.env.DEVVIT_BANHAMMER_DEMO === 'true';

const createSeed = (postId: string, now: number): number => {
  let seed = now;
  for (let index = 0; index < postId.length; index += 1) {
    seed += postId.charCodeAt(index) * (index + 1);
  }
  return seed;
};

export const getCurrentViewer = async (): Promise<Viewer> => {
  const user = await reddit.getCurrentUser();
  if (user) return { userId: user.id, username: user.username };

  const username = await reddit.getCurrentUsername();
  return { userId: null, username: username ?? 'anonymous' };
};

const ensureResolutionJob = async (
  postId: string,
  state: GameState
): Promise<void> => {
  if (state.currentEnding) return;
  await scheduleResolution(postId, state.nextResolutionAt);
};

export const getOrCreateGameState = async (
  postId: string,
  now: number
): Promise<GameState> => {
  const existing = await loadGameState(postId);
  if (existing) return existing;

  const firstEvent = getFirstEvent();
  const state = createInitialGameState(
    pickCommunityName(createSeed(postId, now)),
    firstEvent.id,
    now
  );
  await saveGameState(postId, state);
  await ensureResolutionJob(postId, state);
  return state;
};

export const buildGameResponse = async (
  postId: string,
  viewer: Viewer,
  state: GameState
): Promise<InitGameResponse> => {
  const event = getEventById(state.currentEventId);
  const userVote = viewer.userId
    ? state.userVotesForCurrentDay[viewer.userId] ?? null
    : null;
  const roleRecord = viewer.userId
    ? await loadUserRoleRecord(postId, viewer.userId)
    : null;

  return {
    type: 'game_state',
    postId,
    username: viewer.username,
    userId: viewer.userId,
    isDemoEnabled: isDemoEnabled(),
    state,
    event,
    userVote,
    userRole: roleRecord?.currentRole ?? userVote?.roleAfterVote ?? null,
    votePercentages: getVotePercentages(event, state.votesForCurrentDay),
  };
};

const createRoleRecord = (
  viewer: { userId: string; username: string },
  now: number
): UserRoleRecord => ({
  userId: viewer.userId,
  username: viewer.username,
  currentRole: 'Peacekeeper',
  roleScores: createEmptyRoleScores(),
  voteHistory: [],
  updatedAt: now,
});

export const submitVote = async (input: {
  postId: string;
  viewer: Viewer;
  choiceId: string;
  now: number;
}): Promise<VoteResponse> => {
  const state = await getOrCreateGameState(input.postId, input.now);
  const event = getEventById(state.currentEventId);

  if (!input.viewer.userId) {
    return {
      type: 'vote_result',
      accepted: false,
      message: 'Sign in to vote in today\'s community incident.',
      state,
      event,
      userVote: null,
      userRole: null,
      votePercentages: getVotePercentages(event, state.votesForCurrentDay),
    };
  }

  const existingRoleRecord =
    (await loadUserRoleRecord(input.postId, input.viewer.userId)) ??
    createRoleRecord(
      { userId: input.viewer.userId, username: input.viewer.username },
      input.now
    );
  const result = addVoteToState(
    state,
    event,
    {
      userId: input.viewer.userId,
      username: input.viewer.username,
      choiceId: input.choiceId,
      votedAt: input.now,
    },
    existingRoleRecord.roleScores
  );

  if (!result.accepted || !result.userVote) {
    return {
      type: 'vote_result',
      accepted: false,
      message: state.userVotesForCurrentDay[input.viewer.userId]
        ? 'You already voted today. Tomorrow will find a new way to be strange.'
        : 'That choice is no longer available.',
      state: result.state,
      event,
      userVote: result.userVote,
      userRole: result.userVote?.roleAfterVote ?? existingRoleRecord.currentRole,
      votePercentages: getVotePercentages(event, result.state.votesForCurrentDay),
    };
  }

  const choice = event.choices.find((item) => item.id === input.choiceId);
  if (!choice) throw new Error('Choice disappeared during vote processing');

  const roleUpdate = updateRoleRecord(existingRoleRecord.roleScores, choice);
  const updatedRoleRecord: UserRoleRecord = {
    ...existingRoleRecord,
    username: input.viewer.username,
    currentRole: roleUpdate.role,
    roleScores: roleUpdate.roleScores,
    voteHistory: [...existingRoleRecord.voteHistory, result.userVote].slice(-60),
    updatedAt: input.now,
  };

  await Promise.all([
    saveGameState(input.postId, result.state),
    saveUserRoleRecord(input.postId, updatedRoleRecord),
  ]);

  return {
    type: 'vote_result',
    accepted: true,
    message: 'Vote locked. Now make your case in the comments.',
    state: result.state,
    event,
    userVote: result.userVote,
    userRole: roleUpdate.role,
    votePercentages: getVotePercentages(event, result.state.votesForCurrentDay),
  };
};

const readCommentCandidates = async (
  postId: string,
  since: number
): Promise<CommentCandidate[]> => {
  try {
    const post = await reddit.getPostById(T3(postId));
    const comments = await post.comments.get(80);
    return comments
      .filter((comment) => comment.createdAt.getTime() >= since)
      .map((comment) => ({
        username: comment.authorName,
        body: comment.body,
        score: comment.score,
        createdAt: comment.createdAt.getTime(),
      }));
  } catch (error) {
    console.warn(`Could not read Banhammer Bingo comments for ${postId}`, error);
    return [];
  }
};

export const resolveGameDayForPost = async (input: {
  postId: string;
  now: number;
  allowEarly: boolean;
  commentCandidates?: CommentCandidate[];
}): Promise<ResolveResponse> => {
  const state = await getOrCreateGameState(input.postId, input.now);
  const event = getEventById(state.currentEventId);

  if (state.currentEnding) {
    return {
      type: 'resolve_result',
      state,
      event,
      message: 'The season has already ended. Restart to begin a fresh disaster.',
    };
  }

  if (!input.allowEarly && input.now < state.nextResolutionAt) {
    return {
      type: 'resolve_result',
      state,
      event,
      message: 'Today is still collecting votes.',
    };
  }

  const winningChoice = determineWinningChoice(event, state.votesForCurrentDay);
  const comments =
    input.commentCandidates ??
    (await readCommentCandidates(input.postId, state.lastResolvedAt ?? state.createdAt));
  const topArgument = selectTopArgument(
    comments,
    event,
    winningChoice.id,
    input.now
  );
  const previewState: GameState = {
    ...state,
    stats: applyStatEffects(state.stats, winningChoice.effects),
  };
  const nextEvent = selectNextEvent(GAME_EVENTS, previewState);
  const resolvedState = resolveDay({
    state,
    currentEvent: event,
    nextEventId: nextEvent.id,
    topArgument,
    resolvedAt: input.now,
  });

  await saveGameState(input.postId, resolvedState);
  await ensureResolutionJob(input.postId, resolvedState);

  return {
    type: 'resolve_result',
    state: resolvedState,
    event: getEventById(resolvedState.currentEventId),
    message: `Day ${state.currentDay} resolved: ${winningChoice.label}.`,
  };
};

export const restartGame = async (
  postId: string,
  now: number
): Promise<RestartResponse> => {
  const currentState = await getOrCreateGameState(postId, now);
  const restarted = createRestartedState(
    currentState,
    pickCommunityName(createSeed(postId, now + currentState.restartCount + 1)),
    getFirstEvent().id,
    now
  );

  await saveGameState(postId, restarted);
  await ensureResolutionJob(postId, restarted);

  return {
    type: 'restart_result',
    state: restarted,
    event: getEventById(restarted.currentEventId),
  };
};

const addTestVotes = (
  state: GameState,
  event: GameEvent,
  now: number
): GameState => {
  let updated = state;
  event.choices.forEach((choice, index) => {
    for (let voteIndex = 0; voteIndex <= index; voteIndex += 1) {
      updated = addVoteToState(updated, event, {
        userId: `demo_${choice.id}_${voteIndex}_${now}`,
        username: `demo-${index + 1}-${voteIndex + 1}`,
        choiceId: choice.id,
        votedAt: now + voteIndex,
      }).state;
    }
  });
  return updated;
};

export const runDemoAction = async (input: {
  postId: string;
  action: DemoAction;
  now: number;
}): Promise<ResolveResponse | RestartResponse> => {
  if (!isDemoEnabled()) throw new Error('Demo controls are disabled.');

  if (input.action === 'reset_game') return await restartGame(input.postId, input.now);
  if (input.action === 'resolve') {
    return await resolveGameDayForPost({
      postId: input.postId,
      now: input.now,
      allowEarly: true,
      commentCandidates: [
        {
          username: 'DemoCommenter',
          body: 'I vote for the winning choice because trust, drama, quality, growth, and stress all matter here.',
          score: 7,
          createdAt: input.now - 60_000,
        },
      ],
    });
  }

  const state = await getOrCreateGameState(input.postId, input.now);
  const event = getEventById(state.currentEventId);
  let updatedState = state;

  if (input.action === 'add_test_votes') {
    updatedState = addTestVotes(state, event, input.now);
  }
  if (input.action === 'force_high_drama') {
    updatedState = { ...state, stats: { ...state.stats, drama: 95 } };
  }
  if (input.action === 'force_low_trust') {
    updatedState = { ...state, stats: { ...state.stats, trust: 5 } };
  }
  if (input.action === 'force_day_30') {
    updatedState = { ...state, currentDay: 30, nextResolutionAt: input.now };
  }

  await saveGameState(input.postId, updatedState);

  return {
    type: 'resolve_result',
    state: updatedState,
    event,
    message: `Demo action applied: ${input.action}.`,
  };
};