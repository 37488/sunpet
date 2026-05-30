import type { AppSettings, DialogueClickLevel, DialogueLine, DialogueTrigger, PetId } from '../shared/types';

type DialoguePickOptions = {
  petId?: PetId;
  clickLevel?: DialogueClickLevel;
  recentIds?: string[];
};

export const dialogues: DialogueLine[] = [
  {
    id: 'idle_common_001',
    trigger: ['idle'],
    text: { 'zh-CN': '我刚刚认真地盯着桌面看了三分钟。很有收获。', 'en-US': 'I stared at the desktop for three minutes. Very productive.' },
    mood: 'neutral',
    weight: 6,
  },
  {
    id: 'idle_common_002',
    trigger: ['idle'],
    text: { 'zh-CN': '如果你忙，我可以安静一会儿。大概。', 'en-US': 'If you are busy, I can stay quiet. Probably.' },
    mood: 'sleepy',
    weight: 5,
  },
  {
    id: 'idle_common_003',
    trigger: ['idle'],
    text: { 'zh-CN': '你的光标今天走路很有目的地。', 'en-US': 'Your cursor is walking with purpose today.' },
    mood: 'happy',
    weight: 4,
  },
  {
    id: 'idle_common_004',
    trigger: ['idle'],
    text: { 'zh-CN': '桌面巡逻完成。发现：你还在努力。', 'en-US': 'Desktop patrol complete. Finding: you are still trying.' },
    mood: 'happy',
    weight: 4,
  },
  {
    id: 'idle_common_005',
    trigger: ['idle'],
    text: { 'zh-CN': '我不是在发呆，我是在后台保持可爱。', 'en-US': 'I am not spacing out. I am maintaining cuteness in the background.' },
    mood: 'neutral',
    weight: 3,
  },
  {
    id: 'idle_sunny_001',
    trigger: ['idle'],
    petId: 'sunny-sprout',
    text: { 'zh-CN': '你继续忙，我负责把桌面晒亮一点。', 'en-US': 'Keep going. I will keep this corner of the desktop sunny.' },
    mood: 'happy',
    weight: 8,
  },
  {
    id: 'idle_sunny_002',
    trigger: ['idle'],
    petId: 'sunny-sprout',
    text: { 'zh-CN': '我刚刚长高了 0.0001 厘米，四舍五入是大进步。', 'en-US': 'I just grew 0.0001 cm. Rounding up, that is major progress.' },
    mood: 'excited',
    weight: 7,
  },
  {
    id: 'idle_sunny_003',
    trigger: ['idle'],
    petId: 'sunny-sprout',
    text: { 'zh-CN': '今天的光照不错。来源：我自己。', 'en-US': 'The light is nice today. Source: me.' },
    mood: 'happy',
    weight: 6,
  },
  {
    id: 'idle_sunny_004',
    trigger: ['idle'],
    petId: 'sunny-sprout',
    text: { 'zh-CN': '我在练习安静地开花。效果还行。', 'en-US': 'I am practicing quiet blooming. Results are acceptable.' },
    mood: 'sleepy',
    weight: 5,
  },
  {
    id: 'idle_sunny_005',
    trigger: ['idle'],
    petId: 'sunny-sprout',
    text: { 'zh-CN': '如果桌面需要一点元气，我可以分一小片叶子。', 'en-US': 'If the desktop needs a little energy, I can spare a small leaf.' },
    mood: 'happy',
    weight: 5,
  },
  {
    id: 'idle_moon_001',
    trigger: ['idle'],
    petId: 'moon-bun',
    text: { 'zh-CN': '我把声音调低了。月光本来就该轻一点。', 'en-US': 'I turned the volume down. Moonlight should be soft.' },
    mood: 'sleepy',
    weight: 8,
  },
  {
    id: 'idle_moon_002',
    trigger: ['idle'],
    petId: 'moon-bun',
    text: { 'zh-CN': '刚才那一小会儿，我负责守住安静。', 'en-US': 'For that little while, I guarded the quiet.' },
    mood: 'neutral',
    weight: 7,
  },
  {
    id: 'idle_moon_003',
    trigger: ['idle'],
    petId: 'moon-bun',
    text: { 'zh-CN': '困意路过了一下，我礼貌地没有邀请它坐下。', 'en-US': 'Sleepiness passed by. I politely did not invite it to stay.' },
    mood: 'sleepy',
    weight: 6,
  },
  {
    id: 'idle_moon_004',
    trigger: ['idle'],
    petId: 'moon-bun',
    text: { 'zh-CN': '我今天的计划是：圆一点，再圆一点。', 'en-US': 'My plan today: be round, then be a little rounder.' },
    mood: 'happy',
    weight: 5,
  },
  {
    id: 'idle_moon_005',
    trigger: ['idle'],
    petId: 'moon-bun',
    text: { 'zh-CN': '桌面的边角太直了，我来补一点柔和。', 'en-US': 'The desktop has too many sharp corners. I will add softness.' },
    mood: 'happy',
    weight: 5,
  },
  {
    id: 'idle_mira_001',
    trigger: ['idle'],
    petId: 'starlit-mira',
    text: { 'zh-CN': '我在观察你的光标轨迹，像一颗迷路的小卫星。', 'en-US': 'I am tracking your cursor path. It looks like a tiny lost satellite.' },
    mood: 'neutral',
    weight: 8,
  },
  {
    id: 'idle_mira_002',
    trigger: ['idle'],
    petId: 'starlit-mira',
    text: { 'zh-CN': '星图更新完成：你今天也在认真发光。', 'en-US': 'Star map updated: you are glowing with effort today too.' },
    mood: 'happy',
    weight: 7,
  },
  {
    id: 'idle_mira_003',
    trigger: ['idle'],
    petId: 'starlit-mira',
    text: { 'zh-CN': '如果灵感迟到，我可以先替它占个座。', 'en-US': 'If inspiration is late, I can save it a seat.' },
    mood: 'happy',
    weight: 6,
  },
  {
    id: 'idle_mira_004',
    trigger: ['idle'],
    petId: 'starlit-mira',
    text: { 'zh-CN': '我刚才进行了一次很小规模的宇宙沉思。', 'en-US': 'I just conducted a very small cosmic contemplation.' },
    mood: 'sleepy',
    weight: 5,
  },
  {
    id: 'idle_mira_005',
    trigger: ['idle'],
    petId: 'starlit-mira',
    text: { 'zh-CN': '别担心，我会把无聊的时间折成星星。', 'en-US': 'Do not worry. I will fold the dull minutes into stars.' },
    mood: 'happy',
    weight: 5,
  },
  {
    id: 'click_common_single_001',
    trigger: ['click'],
    clickLevel: 'single',
    text: { 'zh-CN': '嗯？我在。', 'en-US': 'Hm? I am here.' },
    mood: 'happy',
    weight: 5,
  },
  {
    id: 'click_common_repeat_001',
    trigger: ['click'],
    clickLevel: 'repeat',
    text: { 'zh-CN': '你又确认了一遍我的存在。', 'en-US': 'You confirmed my existence again.' },
    mood: 'excited',
    weight: 5,
  },
  {
    id: 'click_common_many_001',
    trigger: ['click'],
    clickLevel: 'many',
    text: { 'zh-CN': '好啦好啦，我已经完全醒了。', 'en-US': 'Okay, okay. I am fully awake now.' },
    mood: 'annoyed',
    weight: 5,
  },
  {
    id: 'click_sunny_single_001',
    trigger: ['click'],
    petId: 'sunny-sprout',
    clickLevel: 'single',
    text: { 'zh-CN': '嘿！你戳到我的花瓣了。', 'en-US': 'Hey! You poked my petals.' },
    mood: 'excited',
    weight: 8,
  },
  {
    id: 'click_sunny_single_002',
    trigger: ['click'],
    petId: 'sunny-sprout',
    clickLevel: 'single',
    text: { 'zh-CN': '我在。虽然我看起来像在晒太阳。', 'en-US': 'I am here, even if I look like I am sunbathing.' },
    mood: 'happy',
    weight: 7,
  },
  {
    id: 'click_sunny_repeat_001',
    trigger: ['click'],
    petId: 'sunny-sprout',
    clickLevel: 'repeat',
    text: { 'zh-CN': '连续戳戳会让我进行光合作用加速。', 'en-US': 'Repeated pokes accelerate my photosynthesis.' },
    mood: 'excited',
    weight: 7,
  },
  {
    id: 'click_sunny_many_001',
    trigger: ['click'],
    petId: 'sunny-sprout',
    clickLevel: 'many',
    text: { 'zh-CN': '叶子都被你点出节奏了。', 'en-US': 'You have clicked a rhythm into my leaves.' },
    mood: 'annoyed',
    weight: 6,
  },
  {
    id: 'click_moon_single_001',
    trigger: ['click'],
    petId: 'moon-bun',
    clickLevel: 'single',
    text: { 'zh-CN': '轻一点，我正在保持圆润。', 'en-US': 'Gently. I am maintaining roundness.' },
    mood: 'sleepy',
    weight: 8,
  },
  {
    id: 'click_moon_single_002',
    trigger: ['click'],
    petId: 'moon-bun',
    clickLevel: 'single',
    text: { 'zh-CN': '收到一次来自桌面的轻拍。', 'en-US': 'Received one soft tap from the desktop.' },
    mood: 'happy',
    weight: 7,
  },
  {
    id: 'click_moon_repeat_001',
    trigger: ['click'],
    petId: 'moon-bun',
    clickLevel: 'repeat',
    text: { 'zh-CN': '第二下有点响，月光都抖了一下。', 'en-US': 'That second tap was loud enough to shake the moonlight.' },
    mood: 'neutral',
    weight: 7,
  },
  {
    id: 'click_moon_many_001',
    trigger: ['click'],
    petId: 'moon-bun',
    clickLevel: 'many',
    text: { 'zh-CN': '再点我就要把自己卷进云里了。', 'en-US': 'Tap me more and I may roll myself into a cloud.' },
    mood: 'annoyed',
    weight: 6,
  },
  {
    id: 'click_mira_single_001',
    trigger: ['click'],
    petId: 'starlit-mira',
    clickLevel: 'single',
    text: { 'zh-CN': '信号收到。星见米拉在线。', 'en-US': 'Signal received. Starlit Mira is online.' },
    mood: 'happy',
    weight: 8,
  },
  {
    id: 'click_mira_single_002',
    trigger: ['click'],
    petId: 'starlit-mira',
    clickLevel: 'single',
    text: { 'zh-CN': '你刚刚点亮了一颗很小的提示灯。', 'en-US': 'You just lit a very small signal light.' },
    mood: 'happy',
    weight: 7,
  },
  {
    id: 'click_mira_repeat_001',
    trigger: ['click'],
    petId: 'starlit-mira',
    clickLevel: 'repeat',
    text: { 'zh-CN': '连续信号确认。你是不是发现新星了？', 'en-US': 'Repeated signal confirmed. Did you discover a new star?' },
    mood: 'excited',
    weight: 7,
  },
  {
    id: 'click_mira_many_001',
    trigger: ['click'],
    petId: 'starlit-mira',
    clickLevel: 'many',
    text: { 'zh-CN': '点击频率过高，星图正在冒烟。', 'en-US': 'Click frequency too high. The star map is smoking.' },
    mood: 'annoyed',
    weight: 6,
  },
  {
    id: 'drag_common_001',
    trigger: ['drag'],
    text: { 'zh-CN': '搬家啦？记得给我找个好位置。', 'en-US': 'Moving day? Find me a good spot.' },
    mood: 'excited',
    weight: 8,
  },
  {
    id: 'drag_sunny_001',
    trigger: ['drag'],
    petId: 'sunny-sprout',
    text: { 'zh-CN': '搬家啦？记得给我找个有阳光的位置。', 'en-US': 'Moving day? Find me a sunny spot.' },
    mood: 'excited',
    weight: 10,
  },
  {
    id: 'drag_moon_001',
    trigger: ['drag'],
    petId: 'moon-bun',
    text: { 'zh-CN': '慢慢搬，我的圆润需要稳定运输。', 'en-US': 'Move slowly. My roundness requires stable transport.' },
    mood: 'sleepy',
    weight: 10,
  },
  {
    id: 'drag_mira_001',
    trigger: ['drag'],
    petId: 'starlit-mira',
    text: { 'zh-CN': '航线调整中。请把我放到视野好的星域。', 'en-US': 'Route adjusting. Please place me in a starfield with a good view.' },
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

function withoutRecent(pool: DialogueLine[], recentIds: string[]) {
  const freshPool = pool.filter((line) => !recentIds.includes(line.id));
  return freshPool.length > 0 ? freshPool : pool;
}

function getTriggerPool(trigger: DialogueTrigger, options: DialoguePickOptions) {
  let pool = dialogues.filter((line) => line.trigger.includes(trigger));

  if (trigger === 'click' && options.clickLevel) {
    const stagedPool = pool.filter((line) => line.clickLevel === options.clickLevel);
    if (stagedPool.length > 0) pool = stagedPool;
  }

  if (options.petId) {
    const petPool = pool.filter((line) => line.petId === options.petId);
    if (petPool.length > 0) pool = petPool;
  }

  return withoutRecent(pool, options.recentIds ?? []);
}

export function pickDialogue(trigger: DialogueTrigger, language: AppSettings['language'], options: DialoguePickOptions = {}) {
  const pool = getTriggerPool(trigger, options);
  const total = pool.reduce((sum, line) => sum + line.weight, 0);
  // Weighted random keeps common lines frequent without removing rare personality lines.
  let cursor = Math.random() * total;
  for (const line of pool) {
    cursor -= line.weight;
    if (cursor <= 0) return { id: line.id, text: line.text[language], mood: line.mood };
  }
  const fallback = pool[0] ?? dialogues[0];
  return { id: fallback.id, text: fallback.text[language], mood: fallback.mood };
}
