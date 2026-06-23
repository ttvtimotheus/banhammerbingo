import type { Choice, RoleName, RoleScoreMap } from './types';
import { ROLE_NAMES } from './types';

export const createEmptyRoleScores = (): RoleScoreMap => ({
  Peacekeeper: 0,
  'Drama Farmer': 0,
  'Rule Lawyer': 0,
  'Growth Hacker': 0,
  'Quality Purist': 0,
  'Banhammer Enthusiast': 0,
  'Chaos Goblin': 0,
  'Community Therapist': 0,
  'Algorithm Whisperer': 0,
  'Sponsor Gremlin': 0,
});

export const getRoleDescription = (role: RoleName): string => {
  const descriptions: Record<RoleName, string> = {
    Peacekeeper: 'Votes for cooler heads, slower threads, and fewer apology posts.',
    'Drama Farmer': 'Understands that engagement sometimes arrives carrying a chair.',
    'Rule Lawyer': 'Can quote rule 7.3 from memory and has feelings about subclauses.',
    'Growth Hacker': 'Sees every incident as a funnel wearing a tiny hat.',
    'Quality Purist': 'Would rather have three good posts than a thousand haunted ones.',
    'Banhammer Enthusiast': 'Believes decisive action is a love language.',
    'Chaos Goblin': 'Chooses the option that makes tomorrow louder.',
    'Community Therapist': 'Keeps asking what the thread needs right now.',
    'Algorithm Whisperer': 'Can hear the feed machinery humming through the wall.',
    'Sponsor Gremlin': 'Smells monetisation in places others smell smoke.',
  };

  return descriptions[role];
};

export const getRoleDeltaForChoice = (choice: Choice): RoleScoreMap => {
  const scores = createEmptyRoleScores();
  const drama = choice.effects.drama ?? 0;
  const trust = choice.effects.trust ?? 0;
  const growth = choice.effects.growth ?? 0;
  const quality = choice.effects.quality ?? 0;
  const modStress = choice.effects.modStress ?? 0;
  const reputation = choice.effects.reputation ?? 0;
  const loweredQuality = quality < 0;
  const lowersDrama = drama < 0;
  const lowersStress = modStress < 0;
  const punitiveTags = ['ban', 'punish', 'remove', 'lock', 'restrict', 'quarantine'];
  const hasPunitiveTag = choice.tags.some((tag) => punitiveTags.includes(tag));

  scores[choice.roleAffinity] += 4;

  if (trust > 0 && lowersDrama) scores.Peacekeeper += 3;
  if (drama > 0) scores['Drama Farmer'] += Math.max(1, Math.ceil(drama / 4));
  if (quality > 0 && modStress > 0) scores['Rule Lawyer'] += 3;
  if (growth > 0) scores['Growth Hacker'] += Math.max(1, Math.ceil(growth / 5));
  if (quality > 0) scores['Quality Purist'] += Math.max(1, Math.ceil(quality / 5));
  if (hasPunitiveTag) scores['Banhammer Enthusiast'] += 4;
  if (drama >= 10 || (growth >= 8 && trust < 0)) scores['Chaos Goblin'] += 3;
  if (trust > 0 && lowersStress) scores['Community Therapist'] += 4;
  if (reputation > 0 && growth > 0) scores['Algorithm Whisperer'] += 3;
  if (growth > 0 && loweredQuality) scores['Sponsor Gremlin'] += 4;

  return scores;
};

export const mergeRoleScores = (
  current: RoleScoreMap,
  delta: RoleScoreMap
): RoleScoreMap => ({
  Peacekeeper: current.Peacekeeper + delta.Peacekeeper,
  'Drama Farmer': current['Drama Farmer'] + delta['Drama Farmer'],
  'Rule Lawyer': current['Rule Lawyer'] + delta['Rule Lawyer'],
  'Growth Hacker': current['Growth Hacker'] + delta['Growth Hacker'],
  'Quality Purist': current['Quality Purist'] + delta['Quality Purist'],
  'Banhammer Enthusiast':
    current['Banhammer Enthusiast'] + delta['Banhammer Enthusiast'],
  'Chaos Goblin': current['Chaos Goblin'] + delta['Chaos Goblin'],
  'Community Therapist':
    current['Community Therapist'] + delta['Community Therapist'],
  'Algorithm Whisperer':
    current['Algorithm Whisperer'] + delta['Algorithm Whisperer'],
  'Sponsor Gremlin': current['Sponsor Gremlin'] + delta['Sponsor Gremlin'],
});

export const getDominantRole = (scores: RoleScoreMap): RoleName => {
  let winner: RoleName = 'Peacekeeper';
  let winningScore = scores[winner];

  for (const role of ROLE_NAMES) {
    const score = scores[role];
    if (score > winningScore) {
      winner = role;
      winningScore = score;
    }
  }

  return winner;
};

export const updateRoleRecord = (
  currentScores: RoleScoreMap,
  choice: Choice
): { role: RoleName; roleScores: RoleScoreMap } => {
  const roleScores = mergeRoleScores(currentScores, getRoleDeltaForChoice(choice));
  return {
    role: getDominantRole(roleScores),
    roleScores,
  };
};