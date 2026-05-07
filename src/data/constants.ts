import type { PartnerCategory, ContractStatus } from '../types';

// Category Metadata
export const CATEGORY_META: Record<
  PartnerCategory,
  { color: string; icon: string; label: string }
> = {
  hospital: { color: '#e53935', icon: '🏥', label: 'Hospital' },
  clinic: { color: '#fb8c00', icon: '🩺', label: 'Clinic' },
  hotel: { color: '#1e88e5', icon: '🏨', label: 'Hotel' },
  tour_operator: { color: '#00897b', icon: '✈️', label: 'Tour Operator' },
  insurance: { color: '#43a047', icon: '📋', label: 'Insurance' },
  transport: { color: '#5e35b1', icon: '🚗', label: 'Transport' },
  pharmacy: { color: '#8e24aa', icon: '💊', label: 'Pharmacy' },
  other: { color: '#9e9e9e', icon: '📍', label: 'Other' },
};

// Status Metadata
export const STATUS_META: Record<
  ContractStatus,
  { label: string; color: string }
> = {
  prospect: { label: 'Prospect', color: '#9e9e9e' },
  negotiation: { label: 'Negotiation', color: '#3949ab' },
  active: { label: 'Active', color: '#43a047' },
  expiring_soon: { label: 'Expiring ≤90d', color: '#fb8c00' },
  expired: { label: 'Expired', color: '#e53935' },
  renewed: { label: 'Renewed', color: '#00897b' },
  terminated: { label: 'Terminated', color: '#424242' },
};

// Partner categories for filtering
export const PARTNER_CATEGORIES: PartnerCategory[] = [
  'hospital',
  'clinic',
  'hotel',
  'tour_operator',
  'insurance',
  'transport',
  'pharmacy',
  'other',
];

// Map default center (Phuket)
export const MAP_DEFAULT_CENTER: [number, number] = [7.8884, 98.3826];
export const MAP_DEFAULT_ZOOM = 11;

// Score bands
export type ScoreBand = 'dominant' | 'strong' | 'contested' | 'weak' | 'absent';

export const getScoreBand = (score: number): ScoreBand => {
  if (score >= 80) return 'dominant';
  if (score >= 60) return 'strong';
  if (score >= 40) return 'contested';
  if (score >= 20) return 'weak';
  return 'absent';
};

export const BAND_COLORS: Record<ScoreBand, string> = {
  dominant: '#1b5e20',
  strong: '#43a047',
  contested: '#fb8c00',
  weak: '#e53935',
  absent: '#424242',
};

export const BAND_BG_COLORS: Record<ScoreBand, string> = {
  dominant: '#e8f5e9',
  strong: '#f1f8e9',
  contested: '#fff3e0',
  weak: '#ffebee',
  absent: '#f5f5f5',
};
