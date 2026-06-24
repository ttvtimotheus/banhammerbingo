import { useCallback, useEffect, useState } from 'react';
import type {
  DemoAction,
  GameEvent,
  GameState,
  InitGameResponse,
  ResolveResponse,
  RestartResponse,
  RoleName,
  SubscribeResponse,
  UserProgress,
  UserVoteRecord,
  VoteResponse,
} from '../../game/types';

type GameViewState = {
  loading: boolean;
  submitting: boolean;
  error: string | null;
  message: string | null;
  postId: string | null;
  username: string;
  state: GameState | null;
  event: GameEvent | null;
  userVote: UserVoteRecord | null;
  userRole: RoleName | null;
  userProgress: UserProgress | null;
  votePercentages: Record<string, number>;
  isDemoEnabled: boolean;
};

const initialState: GameViewState = {
  loading: true,
  submitting: false,
  error: null,
  message: null,
  postId: null,
  username: 'anonymous',
  state: null,
  event: null,
  userVote: null,
  userRole: null,
  userProgress: null,
  votePercentages: {},
  isDemoEnabled: false,
};

const assertOk = async (response: Response): Promise<void> => {
  if (response.ok) return;
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  throw new Error(body?.message ?? `HTTP ${response.status}`);
};

export const useGame = () => {
  const [viewState, setViewState] = useState<GameViewState>(initialState);

  const applyInit = useCallback((data: InitGameResponse) => {
    setViewState({
      loading: false,
      submitting: false,
      error: null,
      message: null,
      postId: data.postId,
      username: data.username,
      state: data.state,
      event: data.event,
      userVote: data.userVote,
      userRole: data.userRole,
      userProgress: data.userProgress,
      votePercentages: data.votePercentages,
      isDemoEnabled: data.isDemoEnabled,
    });
  }, []);

  const refresh = useCallback(async () => {
    setViewState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await fetch('/api/init');
      await assertOk(response);
      const data: InitGameResponse = await response.json();
      applyInit(data);
    } catch (error) {
      setViewState((current) => ({
        ...current,
        loading: false,
        submitting: false,
        error: error instanceof Error ? error.message : 'The game failed to load.',
      }));
    }
  }, [applyInit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const applyVoteResult = useCallback((data: VoteResponse) => {
    setViewState((current) => ({
      ...current,
      loading: false,
      submitting: false,
      error: null,
      message: data.message,
      state: data.state,
      event: data.event,
      userVote: data.userVote,
      userRole: data.userRole,
      userProgress: data.userProgress,
      votePercentages: data.votePercentages,
    }));
  }, []);

  const vote = useCallback(
    async (choiceId: string) => {
      setViewState((current) => ({ ...current, submitting: true, error: null }));
      try {
        const response = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choiceId }),
        });
        await assertOk(response);
        const data: VoteResponse = await response.json();
        applyVoteResult(data);
      } catch (error) {
        setViewState((current) => ({
          ...current,
          submitting: false,
          error: error instanceof Error ? error.message : 'The vote did not land.',
        }));
      }
    },
    [applyVoteResult]
  );

  const applyResolution = useCallback((data: ResolveResponse | RestartResponse) => {
    setViewState((current) => ({
      ...current,
      loading: false,
      submitting: false,
      error: null,
      message: data.type === 'resolve_result' ? data.message : 'A fresh season begins.',
      state: data.state,
      event: data.event,
      userVote: null,
      votePercentages: data.event.choices.reduce<Record<string, number>>((acc, choice) => {
        acc[choice.id] = 0;
        return acc;
      }, {}),
    }));
  }, []);

  const runDemoAction = useCallback(
    async (action: DemoAction) => {
      setViewState((current) => ({ ...current, submitting: true, error: null }));
      try {
        const response = await fetch('/api/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        await assertOk(response);
        const data: ResolveResponse | RestartResponse = await response.json();
        applyResolution(data);
      } catch (error) {
        setViewState((current) => ({
          ...current,
          submitting: false,
          error: error instanceof Error ? error.message : 'Demo control failed.',
        }));
      }
    },
    [applyResolution]
  );

  const restart = useCallback(async () => {
    setViewState((current) => ({ ...current, submitting: true, error: null }));
    try {
      const response = await fetch('/api/restart', { method: 'POST' });
      await assertOk(response);
      const data: RestartResponse = await response.json();
      applyResolution(data);
    } catch (error) {
      setViewState((current) => ({
        ...current,
        submitting: false,
        error: error instanceof Error ? error.message : 'Restart failed.',
      }));
    }
  }, [applyResolution]);

  const subscribe = useCallback(async () => {
    setViewState((current) => ({ ...current, submitting: true, error: null }));
    try {
      const response = await fetch('/api/subscribe', { method: 'POST' });
      await assertOk(response);
      const data: SubscribeResponse = await response.json();
      setViewState((current) => ({
        ...current,
        submitting: false,
        error: null,
        message: data.message,
        userProgress: data.userProgress,
      }));
    } catch (error) {
      setViewState((current) => ({
        ...current,
        submitting: false,
        error: error instanceof Error ? error.message : 'Subscribe failed.',
      }));
    }
  }, []);

  return {
    ...viewState,
    refresh,
    vote,
    runDemoAction,
    restart,
    subscribe,
  } as const;
};