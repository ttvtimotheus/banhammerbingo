import type { Choice, CommentCandidate, GameEvent, TopArgument } from './types';

const EXPLANATION_WORDS = [
  'because',
  'since',
  'therefore',
  'agree',
  'disagree',
  'risk',
  'trust',
  'drama',
  'growth',
  'quality',
  'stress',
];

export const sanitizeExcerpt = (body: string): string => {
  const cleaned = body
    .replace(/<[^>]*>/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= 150) return cleaned;
  return `${cleaned.slice(0, 147).trim()}...`;
};

const normaliseText = (value: string): string => value.toLowerCase();

export const findRelatedChoice = (
  event: GameEvent,
  body: string
): Choice | null => {
  const text = normaliseText(body);
  for (const choice of event.choices) {
    const labelWords = choice.label.toLowerCase().split(/\s+/);
    if (text.includes(choice.id.toLowerCase())) return choice;
    if (text.includes(choice.label.toLowerCase())) return choice;
    if (labelWords.some((word) => word.length > 4 && text.includes(word))) {
      return choice;
    }
  }
  return null;
};

const getScoreLabel = (score: number): string => {
  if (score >= 45) return 'Thread-defining';
  if (score >= 30) return 'Convincing';
  if (score >= 18) return 'Persuasive';
  return 'Noted by the queue';
};

const scoreComment = (
  comment: CommentCandidate,
  event: GameEvent,
  winningChoiceId: string,
  resolvedAt: number
): { score: number; relatedChoice: Choice | null } => {
  const text = normaliseText(comment.body);
  const relatedChoice = findRelatedChoice(event, comment.body);
  const lengthScore = Math.min(12, Math.floor(comment.body.length / 45));
  const wordScore = EXPLANATION_WORDS.reduce(
    (total, word) => total + (text.includes(word) ? 2 : 0),
    0
  );
  const winningChoiceScore = relatedChoice?.id === winningChoiceId ? 10 : 0;
  const ageMs = Math.max(0, resolvedAt - comment.createdAt);
  const recencyScore = Math.max(0, 8 - Math.floor(ageMs / (3 * 60 * 60 * 1000)));
  const score = comment.score * 3 + lengthScore + wordScore + winningChoiceScore + recencyScore;

  return { score, relatedChoice };
};

export const selectTopArgument = (
  comments: CommentCandidate[],
  event: GameEvent,
  winningChoiceId: string,
  resolvedAt: number
): TopArgument | null => {
  let winner: CommentCandidate | null = null;
  let winningRelatedChoice: Choice | null = null;
  let winningScore = -Infinity;

  for (const comment of comments) {
    const excerpt = sanitizeExcerpt(comment.body);
    if (excerpt.length < 12) continue;

    const scored = scoreComment(comment, event, winningChoiceId, resolvedAt);
    if (!scored.relatedChoice) continue;
    if (scored.score > winningScore) {
      winner = comment;
      winningRelatedChoice = scored.relatedChoice;
      winningScore = scored.score;
    }
  }

  if (!winner) return null;

  return {
    username: winner.username,
    excerpt: sanitizeExcerpt(winner.body),
    relatedChoiceId: winningRelatedChoice?.id ?? null,
    scoreLabel: getScoreLabel(winningScore),
  };
};