import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Dealership } from 'types/Dealerships';

interface DealershipStore {
  dealershipToEdit: Dealership | null;
  setDealershipToEdit: (dealership: Dealership | null) => void;
  dealershipToDelete: Dealership | null;
  setDealershipToDelete: (dealership: Dealership | null) => void;
  dealershipToRestore: Dealership | null;
  setDealershipToRestore: (dealership: Dealership | null) => void;
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
            'dealership/setDealershipToEdit'
          ),
        dealershipToDelete: null,
        setDealershipToDelete: (dealership) =>
          set(
            { dealershipToDelete: dealership },
            false,
            'dealership/setDealershipToDelete'
          ),
        dealershipToRestore: null,
        setDealershipToRestore: (dealership) =>
          set(
            { dealershipToRestore: dealership },
            false,
            'dealership/setDealershipToRestore'
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
