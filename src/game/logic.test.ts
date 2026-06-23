import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addVoteToState,
  applyStatEffects,
  checkForEnding,
  clampStatValue,
  createInitialGameState,
  determineWinningChoice,
  getCommunityTitle,
  resolveDay,
} from './logic';
import type { Choice, GameEvent, TopArgument } from './types';

const choices: [Choice, Choice, Choice, Choice] = [
  {
    id: 'steady',
    label: 'Keep It Steady',
    description: 'Calm everyone down.',
    effects: { trust: 6, drama: -4, modStress: -2 },
    consequence: 'The thread exhales for once.',
    tags: ['calm'],
    roleAffinity: 'Peacekeeper',
  },
  {
    id: 'loud',
    label: 'Make It Loud',
    description: 'Let the chaos juice the numbers.',
    effects: { drama: 10, growth: 4, modStress: 3 },
    consequence: 'Everyone starts posting reaction images.',
    tags: ['chaos'],
    roleAffinity: 'Drama Farmer',
  },
  {
    id: 'strict',
    label: 'Make a Rule',
    description: 'Clarify the policy with frightening precision.',
    effects: { quality: 8, modStress: 8, drama: 2 },
    consequence: 'The rule is correct and somehow disputed.',
    tags: ['rules', 'restrict'],
    roleAffinity: 'Rule Lawyer',
  },
  {
    id: 'sponsor',
    label: 'Sell the Pin',
    description: 'Let a sponsor own the moment.',
    effects: { growth: 10, quality: -8, reputation: 6 },
    consequence: 'The banner says community, the invoice says otherwise.',
    tags: ['sponsor'],
    roleAffinity: 'Sponsor Gremlin',
  },
];

const event: GameEvent = {
  id: 'test_event',
  arc: 'The Meme Economy arc',
  title: 'The Test Dilemma',
  text: 'A tiny drama has become load-bearing community infrastructure.',
  severity: 3,
  tags: ['test'],
  unlockConditions: {},
  choices,
};

const argument: TopArgument = {
  username: 'ThreadAccountant',
  excerpt: 'Because drama is a resource only if you budget for cleanup.',
  relatedChoiceId: 'loud',
  scoreLabel: 'Convincing',
};

void test('clamps stat values between 0 and 100', () => {
  assert.equal(clampStatValue(-20), 0);
  assert.equal(clampStatValue(42), 42);
  assert.equal(clampStatValue(140), 100);
});

void test('applies stat effects without mutating the source stats', () => {
  const state = createInitialGameState('The Button Pressers', 'event_a', 0);
  const updated = applyStatEffects(state.stats, {
    trust: 80,
    drama: -90,
    reputation: 10,
  });

  assert.equal(state.stats.trust, 50);
  assert.equal(updated.trust, 100);
  assert.equal(updated.drama, 0);
  assert.equal(updated.reputation, 30);
});

void test('prevents a user voting twice on the same day', () => {
  const state = createInitialGameState('The Hot Take Habitat', event.id, 0);
  const firstVote = addVoteToState(state, event, {
    userId: 't2_user',
    username: 'voter',
    choiceId: 'steady',
    votedAt: 10,
  });
  const secondVote = addVoteToState(firstVote.state, event, {
    userId: 't2_user',
    username: 'voter',
    choiceId: 'loud',
    votedAt: 11,
  });

  assert.equal(firstVote.accepted, true);
  assert.equal(secondVote.accepted, false);
  assert.equal(secondVote.state.votesForCurrentDay.steady, 1);
  assert.equal(secondVote.state.votesForCurrentDay.loud, 0);
});

void test('uses drama and mod stress tie-breakers for the winning choice', () => {
  const winner = determineWinningChoice(event, {
    steady: 0,
    loud: 4,
    strict: 4,
    sponsor: 1,
  });

  assert.equal(winner.id, 'loud');
});

void test('resolves a day by applying the winning consequence and advancing the event', () => {
  const state = createInitialGameState('The Patch Notes Club', event.id, 0);
  const voted = addVoteToState(state, event, {
    userId: 't2_a',
    username: 'alpha',
    choiceId: 'loud',
    votedAt: 10,
  }).state;
  const resolved = resolveDay({
    state: voted,
    currentEvent: event,
    nextEventId: 'next_event',
    topArgument: argument,
    resolvedAt: 86_400_000,
  });

  assert.equal(resolved.currentDay, 2);
  assert.equal(resolved.currentEventId, 'next_event');
  assert.equal(resolved.previousConsequence, choices[1].consequence);
  assert.equal(resolved.resolvedDayHistory.length, 1);
  assert.equal(resolved.topArgumentHistory[0]?.username, 'ThreadAccountant');
  assert.equal(resolved.votesForCurrentDay.loud, 0);
});

void test('detects endings and assigns readable community titles', () => {
  assert.equal(checkForEnding({ trust: 0, drama: 30, growth: 40, quality: 50, modStress: 20, reputation: 10 }, 4)?.id, 'community_revolt');
  assert.equal(checkForEnding({ trust: 50, drama: 20, growth: 100, quality: 75, modStress: 20, reputation: 30 }, 12)?.id, 'healthy_community');
  assert.equal(getCommunityTitle({ trust: 74, drama: 18, growth: 66, quality: 78, modStress: 19, reputation: 72 }), 'Surprisingly Healthy Forum');
});