export type StatKey =
  | 'trust'
  | 'drama'
  | 'growth'
  | 'quality'
  | 'modStress'
  | 'reputation';

export type Stats = Record<StatKey, number>;

export type RoleName =
  | 'Peacekeeper'
  | 'Drama Farmer'
  | 'Rule Lawyer'
  | 'Growth Hacker'
  | 'Quality Purist'
  | 'Banhammer Enthusiast'
  | 'Chaos Goblin'
  | 'Community Therapist'
  | 'Algorithm Whisperer'
  | 'Sponsor Gremlin';

export type RoleScoreMap = Record<RoleName, number>;

export type ArcName =
  | 'The Power User arc'
  | 'The Bot Invasion arc'
  | 'The Mod Team Civil War arc'
  | 'The Journalist Watching arc'
  | 'The New User Exodus arc'
  | 'The Meme Economy arc'
  | 'The Algorithm Blessing arc'
  | 'The Sponsor Temptation arc'
  | 'The Ancient Forum Lore arc'
  | 'The Unhinged AMA arc';

export type Severity = 1 | 2 | 3 | 4 | 5;

export type StatEffects = Partial<Record<StatKey, number>>;

export type UnlockConditions = {
  minDay?: number;
  maxDay?: number;
  requiredTags?: string[];
  excludedTags?: string[];
  stats?: Partial<Record<StatKey, { min?: number; max?: number }>>;
};

export type Choice = {
  id: string;
  label: string;
  description: string;
  effects: StatEffects;
  consequence: string;
  tags: string[];
  roleAffinity: RoleName;
};

export type FourChoices = [Choice, Choice, Choice, Choice];

export type GameEvent = {
  id: string;
  arc: ArcName;
  title: string;
  text: string;
  severity: Severity;
  tags: string[];
  unlockConditions: UnlockConditions;
  choices: FourChoices;
};

export type VoteCounts = Record<string, number>;

export type VoteInput = {
  userId: string;
  username: string;
  choiceId: string;
  votedAt: number;
};

export type UserVoteRecord = VoteInput & {
  day: number;
  eventId: string;
  roleAfterVote: RoleName;
};

export type MilestoneId =
  | 'first_vote'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'points_100'
  | 'points_250'
  | 'points_500';

export type UserProgress = {
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  lastVoteDay: number | null;
  lastVoteAt: number | null;
  milestones: MilestoneId[];
  subscribedAt: number | null;
};

export type LeaderboardEntry = {
  username: string;
  role: RoleName;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
};

export type RecapCommentRecord = {
  day: number;
  commentId: string | null;
  createdAt: number;
};

export type UserRoleRecord = {
  userId: string;
  username: string;
  currentRole: RoleName;
  roleScores: RoleScoreMap;
  progress: UserProgress;
  voteHistory: UserVoteRecord[];
  updatedAt: number;
};

export type TopArgument = {
  username: string;
  excerpt: string;
  relatedChoiceId: string | null;
  scoreLabel: string;
};

export type ResolvedDay = {
  day: number;
  eventId: string;
  eventTitle: string;
  winningChoiceId: string;
  winningChoiceLabel: string;
  voteCounts: VoteCounts;
  totalVotes: number;
  effects: StatEffects;
  statsAfter: Stats;
  consequence: string;
  topArgument: TopArgument | null;
  resolvedAt: number;
};

export type EndingDefinition = {
  id: string;
  title: string;
  description: string;
};

export type EndingReport = EndingDefinition & {
  finalStats: Stats;
  biggestDecision: string;
  mostChaoticDay: string;
  topCommunityRole: RoleName | 'Undecided';
  finalCommunityRating: string;
  shareText: string;
  endedAt: number;
};

export type GameState = {
  communityName: string;
  currentDay: number;
  currentEventId: string;
  stats: Stats;
  votesForCurrentDay: VoteCounts;
  userVotesForCurrentDay: Record<string, UserVoteRecord>;
  resolvedDayHistory: ResolvedDay[];
  previousConsequence: string | null;
  topArgumentHistory: TopArgument[];
  currentEnding: EndingReport | null;
  restartCount: number;
  activeArcTags: string[];
  createdAt: number;
  lastResolvedAt: number | null;
  nextResolutionAt: number;
  roleCounts: Partial<Record<RoleName, number>>;
  leaderboard: LeaderboardEntry[];
  recapCommentHistory: RecapCommentRecord[];
};

export type InitGameResponse = {
  type: 'game_state';
  postId: string;
  username: string;
  userId: string | null;
  isDemoEnabled: boolean;
  state: GameState;
  event: GameEvent;
  userVote: UserVoteRecord | null;
  userRole: RoleName | null;
  userProgress: UserProgress | null;
  votePercentages: Record<string, number>;
};

export type VoteResponse = {
  type: 'vote_result';
  accepted: boolean;
  message: string;
  state: GameState;
  event: GameEvent;
  userVote: UserVoteRecord | null;
  userRole: RoleName | null;
  userProgress: UserProgress | null;
  votePercentages: Record<string, number>;
};

export type SubscribeResponse = {
  type: 'subscribe_result';
  status: 'success';
  message: string;
  userProgress: UserProgress;
};

export type ResolveResponse = {
  type: 'resolve_result';
  state: GameState;
  event: GameEvent;
  message: string;
};

export type RestartResponse = {
  type: 'restart_result';
  state: GameState;
  event: GameEvent;
};

export type DemoAction =
  | 'resolve'
  | 'add_test_votes'
  | 'force_high_drama'
  | 'force_low_trust'
  | 'force_day_30'
  | 'reset_game';

export type DemoRequest = {
  action: DemoAction;
};

export type CommentCandidate = {
  username: string;
  body: string;
  score: number;
  createdAt: number;
};

export const STAT_KEYS: StatKey[] = [
  'trust',
  'drama',
  'growth',
  'quality',
  'modStress',
  'reputation',
];

export const ROLE_NAMES: RoleName[] = [
  'Peacekeeper',
  'Drama Farmer',
  'Rule Lawyer',
  'Growth Hacker',
  'Quality Purist',
  'Banhammer Enthusiast',
  'Chaos Goblin',
  'Community Therapist',
  'Algorithm Whisperer',
  'Sponsor Gremlin',
];