import type { PetId, PetMood, PetState } from '../shared/types';
import { useEffect, useState, type ReactElement } from 'react';

const starlitMiraFrameModules = import.meta.glob<string>('./assets/pets/starlit-mira/*.png', {
  eager: true,
  import: 'default',
});

function buildFrameSequence(state: PetState, count: number) {
  return Array.from({ length: count }, (_item, index) => {
    const frameNumber = (index + 1).toString().padStart(2, '0');
    const path = `./assets/pets/starlit-mira/${state}-${frameNumber}.png`;
    const frame = starlitMiraFrameModules[path];
    if (!frame) throw new Error(`Missing pet frame: ${path}`);
    return frame;
  });
}

const starlitMiraFrames = {
  idle: buildFrameSequence('idle', 10),
  talking: buildFrameSequence('talking', 7),
  dragged: buildFrameSequence('dragged', 6),
  alarm: buildFrameSequence('alarm', 9),
  music: buildFrameSequence('music', 9),
} satisfies Record<PetState, string[]>;

type PetBaseDefinition = {
  id: PetId;
  name: Record<'zh-CN' | 'en-US', string>;
  description: Record<'zh-CN' | 'en-US', string>;
};

type CssPetDefinition = PetBaseDefinition & {
  mode: 'css';
  className: string;
  render: () => ReactElement;
};

type ImagePetDefinition = PetBaseDefinition & {
  mode: 'image';
  className: string;
  frames: Record<PetState, string[]>;
  frameDurations: Record<PetState, number>;
};

export type PetDefinition = CssPetDefinition | ImagePetDefinition;

export const petDefinitions = [
  {
    id: 'sunny-sprout',
    mode: 'css',
    name: {
      'zh-CN': '晴芽',
      'en-US': 'Sunny Sprout',
    },
    description: {
      'zh-CN': '圆滚滚的阳光芽苗，当前默认形象。',
      'en-US': 'A round sun sprout and the current default pet.',
    },
    className: 'pet-skin-sunny-sprout',
    render: () => (
      <>
        <span className="pet-face">
          <span className="eye eye-left" />
          <span className="eye eye-right" />
          <span className="mouth" />
        </span>
        <span className="pet-stem" />
        <span className="pet-leaf" />
      </>
    ),
  },
  {
    id: 'moon-bun',
    mode: 'css',
    name: {
      'zh-CN': '月团',
      'en-US': 'Moon Bun',
    },
    description: {
      'zh-CN': '安静的月亮团子，用来验证多形象切换。',
      'en-US': 'A quiet moon bun that validates multi-pet switching.',
    },
    className: 'pet-skin-moon-bun',
    render: () => (
      <>
        <span className="moon-ear moon-ear-left" />
        <span className="moon-ear moon-ear-right" />
        <span className="moon-cheek moon-cheek-left" />
        <span className="moon-cheek moon-cheek-right" />
        <span className="pet-face">
          <span className="eye eye-left" />
          <span className="eye eye-right" />
          <span className="mouth" />
        </span>
      </>
    ),
  },
  {
    id: 'starlit-mira',
    mode: 'image',
    name: {
      'zh-CN': '星见米拉',
      'en-US': 'Starlit Mira',
    },
    description: {
      'zh-CN': '原创 6 头身二次元女生立绘，使用素材模式渲染。',
      'en-US': 'An original six-head anime girl rendered through image mode.',
    },
    className: 'pet-skin-starlit-mira',
    frames: starlitMiraFrames,
    frameDurations: {
      idle: 520,
      talking: 180,
      dragged: 150,
      alarm: 170,
      music: 190,
    },
  },
] satisfies PetDefinition[];

export const defaultPetDefinition = petDefinitions[0];

export function getPetDefinition(id: PetId) {
  return petDefinitions.find((pet) => pet.id === id) ?? defaultPetDefinition;
}

type PetAvatarProps = {
  petId: PetId;
  mood: PetMood;
  state: PetState;
  onClick: () => void;
  onDoubleClick: () => void;
};

export function PetAvatar({ petId, mood, state, onClick, onDoubleClick }: PetAvatarProps) {
  const pet = getPetDefinition(petId);
  const className = `pet pet-mode-${pet.mode} ${pet.className} pet-${mood} pet-state-${state}`;
  const frames = pet.mode === 'image' ? pet.frames[state] : [];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0);
  }, [pet.id, state]);

  useEffect(() => {
    if (pet.mode !== 'image' || frames.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, pet.frameDurations[state]);

    return () => window.clearInterval(timer);
  }, [frames.length, pet, state]);

  if (pet.mode === 'image') {
    return (
      <button className={className} aria-label={pet.name['en-US']} onClick={onClick} onDoubleClick={onDoubleClick}>
        <img className="pet-image" src={frames[frameIndex % frames.length]} alt="" draggable={false} />
      </button>
    );
  }

  return (
    <button
      className={className}
      aria-label={pet.name['en-US']}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {pet.render()}
    </button>
  );
}
