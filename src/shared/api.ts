export type {
  DemoRequest,
  InitGameResponse,
  ResolveResponse,
  RestartResponse,
  VoteResponse,
} from '../game/types';

export type ErrorResponse = {
  status: 'error';
  message: string;
};
