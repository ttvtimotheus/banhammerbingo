import { reddit } from '@devvit/web/server';

export const createPost = async () => {
  return await reddit.submitCustomPost({
    title: 'Banhammer Bingo: A Community Chaos Sim',
    textFallback: {
      text: 'Banhammer Bingo is a Reddit native daily chaos sim where the community votes through terrible moderation dilemmas.',
    },
  });
};
