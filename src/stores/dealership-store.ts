import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Dealership } from 'types/Dealerships';

interface DealershipStore {
  dealershipToEdit: Dealership | null;
  setDealershipToEdit: (dealership: Dealership | null) => void;
}

let store: ReturnType<typeof createStore>;

function createStore() {
  return create<DealershipStore>()(
    devtools(
      (set) => ({
        dealershipToEdit: null,
        setDealershipToEdit: (dealership) =>
          set(
            { dealershipToEdit: dealership },
            false,
            'dealership/setDealershipToEdit' // Nombre de la acción para Redux DevTools
          )
      }),
      {
        name: 'Dealership Store',
        enabled: process.env.NODE_ENV === 'development'
      }
    )
  );
}

export const useDealershipStore = () => {
  if (!store) {
    store = createStore();
  }
  return store();
};
