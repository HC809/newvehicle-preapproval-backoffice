import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from 'types/User';

interface UserStore {
  userToEdit: User | null;
  setUserToEdit: (user: User | null) => void;
  userToDelete: User | null;
  setUserToDelete: (user: User | null) => void;
  userToRestore: User | null;
  setUserToRestore: (user: User | null) => void;
  userToResendEmail: User | null;
  setUserToResendEmail: (user: User | null) => void;
}

let store: ReturnType<typeof createStore>;

function createStore() {
  return create<UserStore>()(
    devtools(
      (set) => ({
        userToEdit: null,
        setUserToEdit: (user) =>
          set({ userToEdit: user }, false, 'user/setUserToEdit'),
        userToDelete: null,
        setUserToDelete: (user) =>
          set({ userToDelete: user }, false, 'user/setUserToDelete'),
        userToRestore: null,
        setUserToRestore: (user) =>
          set({ userToRestore: user }, false, 'user/setUserToRestore'),
        userToResendEmail: null,
        setUserToResendEmail: (user) =>
          set({ userToResendEmail: user }, false, 'user/setUserToResendEmail')
      }),
      {
        name: 'User Store',
        enabled: process.env.NODE_ENV === 'development'
      }
    )
  );
}

export const useUserStore = () => {
  if (!store) {
    store = createStore();
  }
  return store();
};
