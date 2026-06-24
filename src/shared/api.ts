export type {
  DemoRequest,
  InitGameResponse,
  ResolveResponse,
  RestartResponse,
  SubscribeResponse,
  VoteResponse,
} from '../game/types';

export type ErrorResponse = {
  status: 'error';
  message: string;
};
