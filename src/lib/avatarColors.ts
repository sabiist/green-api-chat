export const AVATAR_COLORS = [
  { bg: 'bg-teal-100', text: 'text-teal-800' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  { bg: 'bg-lime-100', text: 'text-lime-800' },
  { bg: 'bg-amber-100', text: 'text-amber-800' },
  { bg: 'bg-orange-100', text: 'text-orange-800' },
  { bg: 'bg-sky-100', text: 'text-sky-800' },
  { bg: 'bg-violet-100', text: 'text-violet-800' },
  { bg: 'bg-rose-100', text: 'text-rose-800' },
] as const;

export function randomAvatarColorIndex() {
  return Math.floor(Math.random() * AVATAR_COLORS.length);
}

export function avatarColorFor(chatId: string, colorIndex?: number) {
  let index = colorIndex;
  if (index === undefined || index < 0 || index >= AVATAR_COLORS.length) {
    let hash = 0;
    for (const char of chatId) {
      hash = (hash * 31 + char.charCodeAt(0)) | 0;
    }
    index = Math.abs(hash) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[index];
}
