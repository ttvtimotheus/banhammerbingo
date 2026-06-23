import { checkEnding, buildEndingReport } from './endings';
import { createEmptyRoleScores, updateRoleRecord } from './roles';
import type {
  Choice,
  EndingDefinition,
  GameEvent,
  GameState,
  ResolvedDay,
  StatEffects,
  Stats,
  TopArgument,
  UserVoteRecord,
  VoteCounts,
  VoteInput,
} from './types';
import { STAT_KEYS } from './types';

export const INITIAL_STATS: Stats = {
  trust: 50,
  drama: 25,
  growth: 30,
  quality: 50,
  modStress: 20,
  reputation: 20,
};

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const clampStatValue = (value: number): number => {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

export const applyStatEffects = (stats: Stats, effects: StatEffects): Stats => ({
  trust: clampStatValue(stats.trust + (effects.trust ?? 0)),
  drama: clampStatValue(stats.drama + (effects.drama ?? 0)),
  growth: clampStatValue(stats.growth + (effects.growth ?? 0)),
  quality: clampStatValue(stats.quality + (effects.quality ?? 0)),
  modStress: clampStatValue(stats.modStress + (effects.modStress ?? 0)),
  reputation: clampStatValue(stats.reputation + (effects.reputation ?? 0)),
});

export const createInitialGameState = (
  communityName: string,
  currentEventId: string,
  now: number,
  restartCount = 0
): GameState => ({
  communityName,
  currentDay: 1,
  currentEventId,
  stats: INITIAL_STATS,
  votesForCurrentDay: {},
  userVotesForCurrentDay: {},
  resolvedDayHistory: [],
  previousConsequence: null,
  topArgumentHistory: [],
  currentEnding: null,
  restartCount,
  activeArcTags: [],
  createdAt: now,
  lastResolvedAt: null,
  nextResolutionAt: now + ONE_DAY_MS,
  roleCounts: {},
});

export const normaliseVoteCounts = (
  event: GameEvent,
  counts: VoteCounts
): VoteCounts => {
  const normalised: VoteCounts = {};
  for (const choice of event.choices) {
    normalised[choice.id] = counts[choice.id] ?? 0;
  }
  return normalised;
};

export const getTotalVotes = (counts: VoteCounts): number =>
  Object.values(counts).reduce((total, count) => total + count, 0);

export const getVotePercentages = (
  event: GameEvent,
  counts: VoteCounts
): Record<string, number> => {
  const normalised = normaliseVoteCounts(event, counts);
  const totalVotes = getTotalVotes(normalised);
  const percentages: Record<string, number> = {};

  for (const choice of event.choices) {
    const choiceVotes = normalised[choice.id] ?? 0;
    percentages[choice.id] =
      totalVotes === 0 ? 0 : Math.round((choiceVotes / totalVotes) * 100);
  }

  return percentages;
};

export const findChoice = (event: GameEvent, choiceId: string): Choice | null =>
  event.choices.find((choice) => choice.id === choiceId) ?? null;

export const addVoteToState = (
  state: GameState,
  event: GameEvent,
  vote: VoteInput,
  previousRoleScores = createEmptyRoleScores()
): { accepted: boolean; state: GameState; userVote: UserVoteRecord | null } => {
  if (state.currentEnding) {
    return { accepted: false, state, userVote: null };
  }

  const existingVote = state.userVotesForCurrentDay[vote.userId];
  if (existingVote) {
    return {
      accepted: false,
      state: {
        ...state,
        votesForCurrentDay: normaliseVoteCounts(event, state.votesForCurrentDay),
      },
      userVote: existingVote,
    };
  }

  const choice = findChoice(event, vote.choiceId);
  if (!choice) return { accepted: false, state, userVote: null };

  const roleUpdate = updateRoleRecord(previousRoleScores, choice);
  const normalisedCounts = normaliseVoteCounts(event, state.votesForCurrentDay);
  const userVote: UserVoteRecord = {
    ...vote,
    day: state.currentDay,
    eventId: event.id,
    roleAfterVote: roleUpdate.role,
  };

  return {
    accepted: true,
    userVote,
    state: {
      ...state,
      votesForCurrentDay: {
        ...normalisedCounts,
        [choice.id]: (normalisedCounts[choice.id] ?? 0) + 1,
      },
      userVotesForCurrentDay: {
        ...state.userVotesForCurrentDay,
        [vote.userId]: userVote,
      },
      roleCounts: {
        ...state.roleCounts,
        [roleUpdate.role]: (state.roleCounts[roleUpdate.role] ?? 0) + 1,
      },
    },
  };
};

export const determineWinningChoice = (
  event: GameEvent,
  counts: VoteCounts
): Choice => {
  const normalisedCounts = normaliseVoteCounts(event, counts);
  const [firstChoice, ...remainingChoices] = event.choices;
  let winner = firstChoice;

  for (const choice of remainingChoices) {
    const winnerVotes = normalisedCounts[winner.id] ?? 0;
    const choiceVotes = normalisedCounts[choice.id] ?? 0;
    if (choiceVotes > winnerVotes) {
      winner = choice;
      continue;
    }
    if (choiceVotes < winnerVotes) continue;

    const winnerDrama = winner.effects.drama ?? 0;
    const choiceDrama = choice.effects.drama ?? 0;
    if (choiceDrama > winnerDrama) {
      winner = choice;
      continue;
    }
    if (choiceDrama < winnerDrama) continue;

    const winnerStress = winner.effects.modStress ?? 0;
    const choiceStress = choice.effects.modStress ?? 0;
    if (choiceStress > winnerStress) winner = choice;
  }

  return winner;
};

const mergeArcTags = (state: GameState, event: GameEvent, winningChoice: Choice): string[] => {
  const tags = new Set(state.activeArcTags);
  tags.add(event.arc);
  for (const tag of event.tags) tags.add(tag);
  for (const tag of winningChoice.tags) tags.add(tag);
  return Array.from(tags).slice(-24);
};

export const resolveDay = (input: {
  state: GameState;
  currentEvent: GameEvent;
  nextEventId: string;
  topArgument: TopArgument | null;
  resolvedAt: number;
}): GameState => {
  const voteCounts = normaliseVoteCounts(
    input.currentEvent,
    input.state.votesForCurrentDay
  );
  const winningChoice = determineWinningChoice(input.currentEvent, voteCounts);
  const statsAfter = applyStatEffects(input.state.stats, winningChoice.effects);
  const resolvedDay: ResolvedDay = {
    day: input.state.currentDay,
    eventId: input.currentEvent.id,
    eventTitle: input.currentEvent.title,
    winningChoiceId: winningChoice.id,
    winningChoiceLabel: winningChoice.label,
    voteCounts,
    totalVotes: getTotalVotes(voteCounts),
    effects: winningChoice.effects,
    statsAfter,
    consequence: winningChoice.consequence,
    topArgument: input.topArgument,
    resolvedAt: input.resolvedAt,
  };
  const nextDay = input.state.currentDay + 1;
  const nextState: GameState = {
    ...input.state,
    currentDay: nextDay,
    currentEventId: input.nextEventId,
    stats: statsAfter,
    votesForCurrentDay: normaliseVoteCounts(input.currentEvent, {}),
    userVotesForCurrentDay: {},
    resolvedDayHistory: [...input.state.resolvedDayHistory, resolvedDay],
    previousConsequence: winningChoice.consequence,
    topArgumentHistory: input.topArgument
      ? [...input.state.topArgumentHistory, input.topArgument].slice(-10)
      : input.state.topArgumentHistory,
    activeArcTags: mergeArcTags(input.state, input.currentEvent, winningChoice),
    lastResolvedAt: input.resolvedAt,
    nextResolutionAt: input.resolvedAt + ONE_DAY_MS,
  };
  const ending = checkEnding(statsAfter, input.state.currentDay);

  if (!ending) return nextState;

  return {
    ...nextState,
    currentEnding: buildEndingReport(ending, nextState, input.resolvedAt),
  };
};

const eventMeetsUnlocks = (event: GameEvent, state: GameState): boolean => {
  const conditions = event.unlockConditions;
  if (conditions.minDay !== undefined && state.currentDay < conditions.minDay) return false;
  if (conditions.maxDay !== undefined && state.currentDay > conditions.maxDay) return false;

  if (conditions.requiredTags) {
    for (const tag of conditions.requiredTags) {
      if (!state.activeArcTags.includes(tag)) return false;
    }
  }

  if (conditions.excludedTags) {
    for (const tag of conditions.excludedTags) {
      if (state.activeArcTags.includes(tag)) return false;
    }
  }

  if (conditions.stats) {
    for (const stat of STAT_KEYS) {
      const rule = conditions.stats[stat];
      if (!rule) continue;
      const value = state.stats[stat];
      if (rule.min !== undefined && value < rule.min) return false;
      if (rule.max !== undefined && value > rule.max) return false;
    }
  }

  return true;
};

const hashText = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1_000_003;
  }
  return hash;
};

export const selectNextEvent = (events: GameEvent[], state: GameState): GameEvent => {
  const [fallbackEvent] = events;
  if (!fallbackEvent) throw new Error('At least one game event is required');

  const recentEventIds = state.resolvedDayHistory.slice(-8).map((day) => day.eventId);
  const eligibleEvents = events.filter(
    (event) => event.id !== state.currentEventId && eventMeetsUnlocks(event, state)
  );
  const freshEvents = eligibleEvents.filter((event) => !recentEventIds.includes(event.id));
  const candidateEvents = freshEvents.length > 0 ? freshEvents : eligibleEvents;

  if (candidateEvents.length === 0) return fallbackEvent;

  const [firstCandidate] = candidateEvents;
  if (!firstCandidate) return fallbackEvent;

  let selected = firstCandidate;
  let selectedScore = -Infinity;

  for (const event of candidateEvents) {
    const arcBonus = state.activeArcTags.includes(event.arc) ? 20 : 0;
    const pressureBonus = Math.abs(event.severity * 12 - state.stats.drama);
    const deterministicNoise = hashText(`${state.communityName}:${state.currentDay}:${event.id}`) % 17;
    const score = arcBonus + pressureBonus + deterministicNoise;
    if (score > selectedScore) {
      selected = event;
      selectedScore = score;
    }
  }

  return selected;
};

export const getCommunityTitle = (stats: Stats): string => {
  if (stats.trust <= 12 && stats.drama >= 70) return 'Collapsing Empire';
  if (stats.modStress >= 80 && stats.drama >= 55) return 'Civil War Mod Queue';
  if (stats.growth >= 80 && stats.quality <= 35) return 'Content Farm';
  if (stats.reputation >= 80 && stats.growth >= 60) return 'Platform Darling';
  if (stats.growth >= 65 && stats.quality <= 45 && stats.reputation >= 55) {
    return 'Sponsor Haunted Marketplace';
  }
  if (stats.drama >= 75 && stats.quality <= 45) return 'Haunted Comment Section';
  if (stats.drama >= 65 && stats.growth >= 55) return 'Bot Infested Bazaar';
  if (stats.quality >= 75 && stats.modStress >= 65) return 'Overmoderated Fortress';
  if (stats.trust >= 65 && stats.quality >= 65 && stats.drama <= 35 && stats.modStress <= 45) {
    return 'Surprisingly Healthy Forum';
  }
  if (stats.trust >= 65 && stats.drama <= 30) return 'Peaceful Niche Forum';
  if (stats.growth >= 60 && stats.drama >= 35) return 'Rising Meme Republic';
  if (stats.drama >= 55) return 'Drama Reactor';
  return 'Peaceful Niche Forum';
};

export const checkForEnding = (
  stats: Stats,
  resolvedDay: number
): EndingDefinition | null => checkEnding(stats, resolvedDay);

export const createRestartedState = (
  previousState: GameState,
  communityName: string,
  firstEventId: string,
  now: number
): GameState =>
  createInitialGameState(
    communityName,
    firstEventId,
    now,
    previousState.restartCount + 1
  );