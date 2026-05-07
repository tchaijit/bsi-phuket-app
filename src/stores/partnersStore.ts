import { create } from 'zustand';
import type { Partner, PartnerCategory, ContractStatus } from '../types';

interface PartnersState {
  partners: Partner[];
  filteredPartners: Partner[];
  selectedPartner: Partner | null;
  categoryFilters: Set<PartnerCategory>;
  statusFilters: Set<ContractStatus>;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPartners: () => Promise<void>;
  addPartner: (partner: Partner) => Promise<void>;
  updatePartner: (partner: Partner) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  selectPartner: (partner: Partner | null) => void;
  toggleCategoryFilter: (category: PartnerCategory) => void;
  toggleStatusFilter: (status: ContractStatus) => void;
  setSearchQuery: (query: string) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

export const usePartnersStore = create<PartnersState>((set, get) => ({
  partners: [],
  filteredPartners: [],
  selectedPartner: null,
  categoryFilters: new Set([
    'hospital',
    'clinic',
    'hotel',
    'tour_operator',
    'insurance',
    'transport',
    'pharmacy',
    'other',
  ]),
  statusFilters: new Set(['active', 'expiring_soon', 'expired', 'prospect', 'negotiation', 'renewed', 'terminated']),
  searchQuery: '',
  isLoading: false,
  error: null,

  fetchPartners: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/partners');

      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }

      const data = await response.json();

      set({
        partners: data.partners,
        isLoading: false,
      });

      get().applyFilters();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch partners',
      });
    }
  },

  addPartner: async (partner: Partner) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partner),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create partner');
      }

      const data = await response.json();

      set((state) => ({
        partners: [...state.partners, data.partner],
        isLoading: false,
      }));

      get().applyFilters();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to create partner',
      });
      throw error;
    }
  },

  updatePartner: async (partner: Partner) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/partners/${partner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partner),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update partner');
      }

      const data = await response.json();

      set((state) => ({
        partners: state.partners.map((p) =>
          p.id === partner.id ? data.partner : p
        ),
        isLoading: false,
      }));

      get().applyFilters();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to update partner',
      });
      throw error;
    }
  },

  deletePartner: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/partners/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete partner');
      }

      set((state) => ({
        partners: state.partners.filter((p) => p.id !== id),
        isLoading: false,
      }));

      get().applyFilters();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to delete partner',
      });
      throw error;
    }
  },

  selectPartner: (partner) => {
    set({ selectedPartner: partner });
  },

  toggleCategoryFilter: (category) => {
    set((state) => {
      const newFilters = new Set(state.categoryFilters);
      if (newFilters.has(category)) {
        newFilters.delete(category);
      } else {
        newFilters.add(category);
      }
      return { categoryFilters: newFilters };
    });
    get().applyFilters();
  },

  toggleStatusFilter: (status) => {
    set((state) => {
      const newFilters = new Set(state.statusFilters);
      if (newFilters.has(status)) {
        newFilters.delete(status);
      } else {
        newFilters.add(status);
      }
      return { statusFilters: newFilters };
    });
    get().applyFilters();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  applyFilters: () => {
    const { partners, categoryFilters, statusFilters, searchQuery } = get();

    const filtered = partners.filter((partner) => {
      // Category filter
      if (!categoryFilters.has(partner.category)) return false;

      // Status filter
      const status = partner.contract?.status;
      if (status && !statusFilters.has(status)) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName =
          partner.name_en?.toLowerCase().includes(query) ||
          partner.name_th?.toLowerCase().includes(query);
        const matchesZone = partner.zone?.toLowerCase().includes(query);
        if (!matchesName && !matchesZone) return false;
      }

      return true;
    });

    set({ filteredPartners: filtered });
  },

  resetFilters: () => {
    set({
      categoryFilters: new Set([
        'hospital',
        'clinic',
        'hotel',
        'tour_operator',
        'insurance',
        'transport',
        'pharmacy',
        'other',
      ]),
      statusFilters: new Set(['active', 'expiring_soon', 'expired', 'prospect', 'negotiation', 'renewed', 'terminated']),
      searchQuery: '',
    });
    get().applyFilters();
  },
}));
