import type { Zone, ZoneName } from '../types';

export const zones: Record<ZoneName, Zone> = {
  west_coast_kamala_patong: {
    name: 'west_coast_kamala_patong',
    label: 'Patong/Kamala',
    target: 25,
    density: 'very_high',
    weight: 1.5,
  },
  north_bangtao_surin_layan: {
    name: 'north_bangtao_surin_layan',
    label: 'Bang Tao/Surin/Layan',
    target: 20,
    density: 'high',
    weight: 1.0,
  },
  west_coast_karon_kata: {
    name: 'west_coast_karon_kata',
    label: 'Karon/Kata',
    target: 15,
    density: 'high',
    weight: 1.0,
  },
  phuket_town_central: {
    name: 'phuket_town_central',
    label: 'Phuket Town',
    target: 15,
    density: 'medium',
    weight: 0.7,
  },
  south_rawai_naiharn: {
    name: 'south_rawai_naiharn',
    label: 'Rawai/Nai Harn',
    target: 10,
    density: 'medium',
    weight: 0.7,
  },
  north_mai_khao_nai_yang: {
    name: 'north_mai_khao_nai_yang',
    label: 'Mai Khao/Nai Yang',
    target: 8,
    density: 'medium',
    weight: 0.7,
  },
  east_coast_panwa_chalong_pier: {
    name: 'east_coast_panwa_chalong_pier',
    label: 'Panwa/Chalong',
    target: 6,
    density: 'medium',
    weight: 0.7,
  },
  north_thalang_inland: {
    name: 'north_thalang_inland',
    label: 'Thalang inland',
    target: 4,
    density: 'low',
    weight: 0.4,
  },
};

export const ZONE_LIST = Object.values(zones);
