import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Client } from 'types/Client';

interface ClientStore {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  clearSelectedClient: () => void;
}

let store: ReturnType<typeof createStore>;

function createStore() {
  return create<ClientStore>()(
    devtools(
      persist(
        (set) => ({
          selectedClient: null,
          setSelectedClient: (client) =>
            set({ selectedClient: client }, false, 'client/setSelectedClient'),
          clearSelectedClient: () =>
            set({ selectedClient: null }, false, 'client/clearSelectedClient')
        }),
        {
          name: 'client-storage',
          partialize: (state) => ({
            selectedClient: state.selectedClient
          })
        }
      ),
      {
        name: 'Client Store',
        enabled: process.env.NODE_ENV === 'development'
      }
    )
  );
}

export const useClientStore = () => {
  if (!store) {
    store = createStore();
  }
  return store();
};
