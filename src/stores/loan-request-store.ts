import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { LoanRequest } from 'types/LoanRequests';

interface LoanRequestStore {
  selectedLoanRequest: LoanRequest | null;
  setSelectedLoanRequest: (loanRequest: LoanRequest | null) => void;
  clearSelectedLoanRequest: () => void;
}

let store: ReturnType<typeof createStore>;

function createStore() {
  return create<LoanRequestStore>()(
    devtools(
      persist(
        (set) => ({
          selectedLoanRequest: null,
          setSelectedLoanRequest: (loanRequest) =>
            set(
              { selectedLoanRequest: loanRequest },
              false,
              'loanRequest/setSelectedLoanRequest'
            ),
          clearSelectedLoanRequest: () =>
            set(
              { selectedLoanRequest: null },
              false,
              'loanRequest/clearSelectedLoanRequest'
            )
        }),
        {
          name: 'loan-request-storage',
          // Solo persistimos la solicitud seleccionada
          partialize: (state) => ({
            selectedLoanRequest: state.selectedLoanRequest
          })
        }
      ),
      {
        name: 'Loan Request Store',
        enabled: process.env.NODE_ENV === 'development'
      }
    )
  );
}

export const useLoanRequestStore = () => {
  if (!store) {
    store = createStore();
  }
  return store();
};
