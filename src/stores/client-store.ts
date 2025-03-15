import { create } from 'zustand';
import { Client } from 'types/Client';

interface ClientState {
  // Selected client for viewing details
  selectedClient: Client | null;

  // Actions
  setSelectedClient: (client: Client | null) => void;
  clearSelectedClient: () => void;
}

export const useClientStore = create<ClientState>((set) => ({
  // Initial state
  selectedClient: null,

  // Actions
  setSelectedClient: (client) => set({ selectedClient: client }),
  clearSelectedClient: () => set({ selectedClient: null })
}));
