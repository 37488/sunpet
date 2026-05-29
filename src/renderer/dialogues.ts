import type { DialogueLine, DialogueTrigger } from '../shared/types';

export const dialogues: DialogueLine[] = [
  {
    id: 'idle_001',
    trigger: ['idle'],
    text: { 'zh-CN': '我刚刚认真地盯着桌面看了三分钟。很有收获。', 'en-US': 'I stared at the desktop for three minutes. Very productive.' },
    mood: 'neutral',
    weight: 8,
  },
  {
    id: 'idle_002',
    trigger: ['idle'],
    text: { 'zh-CN': '如果你忙，我可以安静一会儿。大概。', 'en-US': 'If you are busy, I can stay quiet. Probably.' },
    mood: 'sleepy',
    weight: 6,
  },
  {
    id: 'click_001',
    trigger: ['click'],
    text: { 'zh-CN': '嘿！你戳到我的花瓣了。', 'en-US': 'Hey! You poked my petals.' },
    mood: 'excited',
    weight: 10,
  },
  {
    id: 'click_002',
    trigger: ['click'],
    text: { 'zh-CN': '我在。虽然我看起来像在发呆。', 'en-US': 'I am here. Even if I look like I am buffering.' },
    mood: 'happy',
    weight: 8,
  },
  {
    id: 'drag_001',
    trigger: ['drag'],
    text: { 'zh-CN': '搬家啦？记得给我找个有阳光的位置。', 'en-US': 'Moving day? Find me a sunny spot.' },
    mood: 'excited',
    weight: 10,
  },
  {
    id: 'music_001',
    trigger: ['music'],
    text: { 'zh-CN': '没有真正的乐队，但我可以假装有。', 'en-US': 'No real band here, but I can pretend.' },
    mood: 'happy',
    weight: 10,
  },
  {
    id: 'alarm_001',
    trigger: ['alarm'],
    text: { 'zh-CN': '提醒时间到！我这次非常准时。', 'en-US': 'Alarm time! I am exceptionally punctual today.' },
    mood: 'excited',
    weight: 10,
  },
  {
    id: 'clock_001',
    trigger: ['clock'],
    text: { 'zh-CN': '整点到了，我的时间感正在发光。', 'en-US': 'Top of the hour. My time sense is glowing.' },
    mood: 'happy',
    weight: 10,
  },
];

export function pickDialogue(trigger: DialogueTrigger, language: 'zh-CN' | 'en-US') {
  const pool = dialogues.filter((line) => line.trigger.includes(trigger));
  const total = pool.reduce((sum, line) => sum + line.weight, 0);
  // Weighted random keeps common lines frequent without removing rare personality lines.
  let cursor = Math.random() * total;
  for (const line of pool) {
    cursor -= line.weight;
    if (cursor <= 0) return { text: line.text[language], mood: line.mood };
  }
  const fallback = pool[0] ?? dialogues[0];
  return { text: fallback.text[language], mood: fallback.mood };
}
