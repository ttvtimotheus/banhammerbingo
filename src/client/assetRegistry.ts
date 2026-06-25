import type { ArcName, Choice, RoleName, StatKey } from '../game/types';

const BASE = '/banhammer_bingo_svg_asset_system/svg';

export const brandingAsset = `${BASE}/branding/banhammer_bingo_mark.svg`;
export const wordmarkAsset = '/Banhammer%20Bingo%20Logo.svg';

export const stickerAssets = {
  shield: '/Shield%20Sticker.svg',
  stamp: '/Stamp%20Sticker.svg',
  vote: '/Vote%20Sticker.svg',
  warning: '/Warning%20Sticker.svg',
} as const;

export const statAssets: Record<StatKey, string> = {
  trust: `${BASE}/stats/trust_handshake_shield.svg`,
  drama: `${BASE}/stats/drama_flame.svg`,
  growth: `${BASE}/stats/growth_arrow_sprout.svg`,
  quality: `${BASE}/stats/quality_diamond_star.svg`,
  modStress: `${BASE}/stats/stress_siren_sweat.svg`,
  reputation: `${BASE}/stats/reputation_rosette.svg`,
};

export const roleAssets: Record<RoleName, string> = {
  Peacekeeper: `${BASE}/roles/peacekeeper_dove_gavel.svg`,
  'Drama Farmer': `${BASE}/roles/drama_farmer_pitchfork.svg`,
  'Rule Lawyer': `${BASE}/roles/rule_lawyer_scroll_stamp.svg`,
  'Growth Hacker': `${BASE}/roles/growth_hacker_rocket_chart.svg`,
  'Quality Purist': `${BASE}/roles/quality_purist_jewel.svg`,
  'Banhammer Enthusiast': `${BASE}/roles/banhammer_enthusiast_hammer_seal.svg`,
  'Chaos Goblin': `${BASE}/roles/chaos_goblin_grin.svg`,
  'Community Therapist': `${BASE}/roles/community_therapist_bubble_heart.svg`,
  'Algorithm Whisperer': `${BASE}/roles/algorithm_whisperer_orbit_eye.svg`,
  'Sponsor Gremlin': `${BASE}/roles/sponsor_gremlin_coin_claws.svg`,
};

export const arcAssets: Record<ArcName, string> = {
  'The Power User arc': `${BASE}/arcs/power_user_crown_comment.svg`,
  'The Bot Invasion arc': `${BASE}/arcs/bot_invasion_bug_swarm.svg`,
  'The Mod Team Civil War arc': `${BASE}/arcs/mod_civil_war_split_badge.svg`,
  'The Journalist Watching arc': `${BASE}/arcs/journalist_notebook_eye.svg`,
  'The New User Exodus arc': `${BASE}/arcs/new_user_exodus_open_door.svg`,
  'The Meme Economy arc': `${BASE}/arcs/meme_economy_coin_face.svg`,
  'The Algorithm Blessing arc': `${BASE}/arcs/algorithm_blessing_glowing_arrow.svg`,
  'The Sponsor Temptation arc': `${BASE}/arcs/sponsor_temptation_gold_pin.svg`,
  'The Ancient Forum Lore arc': `${BASE}/arcs/ancient_forum_lore_scroll.svg`,
  'The Unhinged AMA arc': `${BASE}/arcs/unhinged_ama_microphone.svg`,
};

export const markerAssets = {
  yourVote: `${BASE}/markers/marker_your_vote.svg`,
  leading: `${BASE}/markers/marker_leading.svg`,
  dangerous: `${BASE}/markers/marker_dangerous.svg`,
  stable: `${BASE}/markers/marker_stable.svg`,
} as const;

export const chromeAssets = {
  reportTag: `${BASE}/chrome/chrome_report_tag.svg`,
  stickyTape: `${BASE}/chrome/chrome_sticky_tape.svg`,
  stampedSeal: `${BASE}/chrome/chrome_stamped_seal.svg`,
} as const;

const specificChoiceAssets: Record<string, string> = {
  banhammer: `${BASE}/choices/choice_bonk_banhammer.svg`,
  private_warning: `${BASE}/choices/choice_dm_adult.svg`,
  content_flow: `${BASE}/choices/choice_numbers_go_brrr.svg`,
  make_mod: `${BASE}/choices/choice_promote_problem.svg`,
};

export const getChoiceAsset = (choice: Choice): string => {
  const specific = specificChoiceAssets[choice.id];
  if (specific) return specific;

  if (choice.tags.some((tag) => ['ban', 'remove', 'lock', 'restrict', 'quarantine'].includes(tag))) {
    return `${BASE}/choices/choice_action_ban.svg`;
  }
  if (choice.tags.some((tag) => ['sponsor', 'money'].includes(tag))) {
    return `${BASE}/choices/choice_action_sponsor.svg`;
  }
  if (choice.tags.some((tag) => ['vote', 'poll'].includes(tag))) {
    return `${BASE}/choices/choice_action_vote.svg`;
  }
  if (choice.tags.some((tag) => ['growth', 'algorithm', 'new-users'].includes(tag))) {
    return `${BASE}/choices/choice_action_growth.svg`;
  }
  if (choice.tags.some((tag) => ['quality', 'rules', 'trust', 'reputation'].includes(tag))) {
    return `${BASE}/choices/choice_action_quality.svg`;
  }
  if (choice.tags.some((tag) => ['calm', 'journalist', 'lore', 'ama'].includes(tag))) {
    return `${BASE}/choices/choice_action_message.svg`;
  }
  if (choice.tags.some((tag) => ['chaos', 'meme', 'drama', 'mod-war'].includes(tag))) {
    return `${BASE}/choices/choice_action_chaos.svg`;
  }

  switch (choice.roleAffinity) {
    case 'Banhammer Enthusiast':
      return `${BASE}/choices/choice_action_ban.svg`;
    case 'Community Therapist':
    case 'Peacekeeper':
      return `${BASE}/choices/choice_action_message.svg`;
    case 'Growth Hacker':
    case 'Algorithm Whisperer':
      return `${BASE}/choices/choice_action_growth.svg`;
    case 'Quality Purist':
    case 'Rule Lawyer':
      return `${BASE}/choices/choice_action_quality.svg`;
    case 'Sponsor Gremlin':
      return `${BASE}/choices/choice_action_sponsor.svg`;
    default:
      return `${BASE}/choices/choice_action_chaos.svg`;
  }
};

export const getChoiceMarker = (choice: Choice, selected: boolean, isLeading: boolean): string | null => {
  if (selected) return markerAssets.yourVote;
  if (isLeading) return markerAssets.leading;

  const drama = choice.effects.drama ?? 0;
  const stress = choice.effects.modStress ?? 0;
  const trust = choice.effects.trust ?? 0;

  if (drama >= 10 || stress >= 8 || choice.tags.includes('chaos')) {
    return markerAssets.dangerous;
  }
  if (trust > 0 && drama <= 0) {
    return markerAssets.stable;
  }
  return null;
};