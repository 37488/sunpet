import type { PetId, PetMood, PetState } from '../shared/types';
import type { ReactElement } from 'react';
import miraIdle from './assets/pets/starlit-mira.svg';

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
  image: Partial<Record<PetState, string>> & { idle: string };
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
    image: {
      idle: miraIdle,
      talking: miraIdle,
      dragged: miraIdle,
      alarm: miraIdle,
    },
  },
] satisfies PetDefinition[];

export const defaultPetDefinition = petDefinitions[0];

export function getPetDefinition(id: PetId) {
  return petDefinitions.find((pet) => pet.id === id) ?? defaultPetDefinition;
}

function getStateImage(image: ImagePetDefinition['image'], state: PetState) {
  return image[state] ?? image.idle;
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

  if (pet.mode === 'image') {
    return (
      <button className={className} aria-label={pet.name['en-US']} onClick={onClick} onDoubleClick={onDoubleClick}>
        <img className="pet-image" src={getStateImage(pet.image, state)} alt="" draggable={false} />
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
